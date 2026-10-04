import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { colors } from "@/lib/theme";

SplashScreen.preventAutoHideAsync();

function AppStack() {
  const { loading } = useAuth();
  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  return (
    <Stack
      screenOptions={{
        headerTintColor: colors.ink,
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.paper },
        contentStyle: { backgroundColor: colors.paper },
        headerBackButtonDisplayMode: "minimal",
      }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="product/[slug]" options={{ title: "" }} />
      <Stack.Screen name="checkout" options={{ title: "Checkout" }} />
      <Stack.Screen name="order/[id]" options={{ title: "Order" }} />
      <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="dark" />
        <AppStack />
      </CartProvider>
    </AuthProvider>
  );
}
