import type { Session } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Where Google → Supabase sends the user back to. In Expo Go this is
 * exp://<your-computer>:8081/--/auth/callback; in an installed build it is
 * veyro://auth/callback. Both must be allowed in Supabase → Redirect URLs.
 */
export const authRedirectUrl = Linking.createURL("auth/callback");

const exchanged = new Set<string>();

/** Turns the `?code=` from the redirect URL into a session (PKCE). Safe to call twice with the same URL. */
export async function completeSignIn(url: string) {
  const { queryParams } = Linking.parse(url);
  const error = queryParams?.error_description ?? queryParams?.error;
  if (error) throw new Error(String(error));
  const code = queryParams?.code;
  if (typeof code !== "string" || exchanged.has(code)) return;
  exchanged.add(code);
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authRedirectUrl, skipBrowserRedirect: true, queryParams: { prompt: "select_account" } },
    });
    if (error) throw error;

    const result = await WebBrowser.openAuthSessionAsync(data.url, authRedirectUrl);
    if (result.type !== "success") return false; // user closed the browser
    await completeSignIn(result.url);
    return true;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ session, loading, signInWithGoogle, signOut }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
