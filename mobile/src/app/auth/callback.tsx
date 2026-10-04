import { Redirect, useGlobalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { completeSignIn } from "@/lib/auth";
import { colors } from "@/lib/theme";

/**
 * Fallback for when the OS opens the sign-in redirect as a deep link instead of
 * handing it back to the in-app browser (this happens on some Android phones).
 */
export default function AuthCallback() {
  const params = useGlobalSearchParams<{ code?: string; error_description?: string }>();
  const [done, setDone] = useState(false);

  useEffect(() => {
    const url = Linking.createURL("auth/callback", { queryParams: params as Record<string, string> });
    completeSignIn(url)
      .catch((e) => console.warn("Sign-in failed", e))
      .finally(() => setDone(true));
  }, [params]);

  if (done) return <Redirect href="/account" />;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.paper }}>
      <ActivityIndicator color={colors.ink} />
    </View>
  );
}
