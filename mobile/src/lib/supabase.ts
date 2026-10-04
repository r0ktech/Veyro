import "expo-sqlite/localStorage/install";
import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";

// Same Supabase project as the website, so the same accounts, products and carts.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: localStorage, // keeps the user signed in across app launches
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: "pkce", // Google sign-in returns a one-time code that we exchange for a session
  },
});

// Only refresh the session while the app is in the foreground.
AppState.addEventListener("change", (state) => {
  if (state === "active") supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
