import { Image } from "expo-image";
import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { formatPrice } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { MAX_CONTENT_WIDTH } from "@/lib/layout";
import { colors } from "@/lib/theme";
import type { Order } from "@/lib/types";

type OrderRow = Pick<Order, "id" | "order_number" | "status" | "total_cents" | "created_at">;

export default function AccountScreen() {
  const { session, signInWithGoogle, signOut } = useAuth();
  const [signingIn, setSigningIn] = useState(false);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = useCallback(async () => {
    if (!session) return setOrders([]);
    const { data } = await supabase
      .from("orders")
      .select("id, order_number, status, total_cents, created_at")
      .order("created_at", { ascending: false });
    setOrders((data ?? []) as OrderRow[]);
  }, [session]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function onSignIn() {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (e) {
      Alert.alert("Sign-in didn't complete", e instanceof Error ? e.message : "Please try again.");
    } finally {
      setSigningIn(false);
    }
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.signIn}>
          <Text style={styles.logo}>
            veyro<Text style={{ color: colors.brand }}>.</Text>
          </Text>
          <Text style={styles.heading}>Sign in to continue</Text>
          <Text style={styles.sub}>Use the same Google account as on the website. Your cart and orders are shared.</Text>
          <Button title="Continue with Google" variant="ghost" loading={signingIn} onPress={onSignIn} style={{ alignSelf: "stretch", marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  const meta = session.user.user_metadata ?? {};
  const name = (meta.full_name ?? meta.name ?? session.user.email ?? "Account") as string;

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await loadOrders();
              setRefreshing(false);
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ gap: 20, marginBottom: 12 }}>
            <View style={styles.profile}>
              {meta.avatar_url ? (
                <Image source={{ uri: meta.avatar_url as string }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.initial]}>
                  <Text style={styles.initialText}>{name.charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.email}>{session.user.email}</Text>
              </View>
            </View>
            <Text style={styles.section}>Your orders</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item: o }) => (
          <Link href={{ pathname: "/order/[id]", params: { id: o.id } }} asChild>
            <Pressable style={styles.order}>
              <View style={{ flex: 1 }}>
                <Text style={styles.orderNumber}>{o.order_number}</Text>
                <Text style={styles.orderMeta}>
                  {new Date(o.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })} · {o.status}
                </Text>
              </View>
              <Text style={styles.orderTotal}>{formatPrice(o.total_cents)}</Text>
            </Pressable>
          </Link>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No orders yet.</Text>}
        ListFooterComponent={<Button title="Sign out" variant="ghost" onPress={signOut} style={{ marginTop: 32 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  signIn: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  logo: { fontSize: 30, fontWeight: "800", color: colors.ink },
  heading: { fontSize: 20, fontWeight: "700", color: colors.ink, marginTop: 24 },
  sub: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 8 },
  list: { padding: 16, paddingBottom: 32, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
  profile: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16 },
  avatar: { width: 56, height: 56, borderRadius: 28 },
  initial: { backgroundColor: colors.ink, alignItems: "center", justifyContent: "center" },
  initialText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  name: { fontSize: 18, fontWeight: "700", color: colors.ink },
  email: { fontSize: 13, color: colors.muted, marginTop: 2 },
  section: { fontSize: 18, fontWeight: "700", color: colors.ink },
  order: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.line, padding: 14 },
  orderNumber: { fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }), fontWeight: "600", color: colors.ink },
  orderMeta: { fontSize: 12, color: colors.muted, marginTop: 2, textTransform: "capitalize" },
  orderTotal: { fontWeight: "700", color: colors.ink },
  muted: { color: colors.muted },
});
