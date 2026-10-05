import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { formatPrice, PAYMENT_METHODS } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { MAX_CONTENT_WIDTH } from "@/lib/layout";
import { colors } from "@/lib/theme";
import type { Order, OrderItem } from "@/lib/types";

export default function OrderScreen() {
  const { id, placed, emailed } = useLocalSearchParams<{ id: string; placed?: string; emailed?: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined);
  const [items, setItems] = useState<OrderItem[]>([]);

  useEffect(() => {
    Promise.all([
      supabase.from("orders").select("*").eq("id", id).maybeSingle(),
      supabase.from("order_items").select("*").eq("order_id", id),
    ]).then(([o, i]) => {
      setOrder((o.data as Order | null) ?? null);
      setItems((i.data ?? []) as OrderItem[]);
    });
  }, [id]);

  if (order === undefined) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.ink} />;
  if (order === null) return <Text style={styles.muted}>Order not found.</Text>;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      {placed === "1" && (
        <View style={styles.success}>
          <Text style={styles.successTitle}>Thank you, your order is confirmed!</Text>
          <Text style={styles.successText}>
            {emailed === "1"
              ? `A confirmation email has been sent to ${order.email}.`
              : `Your order is placed, but we couldn't send the confirmation email to ${order.email} just now.`}
          </Text>
        </View>
      )}

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.muted}>Order</Text>
          <Text style={styles.number}>{order.order_number}</Text>
        </View>
        <Text style={styles.status}>{order.status}</Text>
      </View>

      <View style={styles.card}>
        {items.map((i) => (
          <View key={i.id} style={styles.item}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemName}>{i.product_name}</Text>
              <Text style={styles.muted}>Qty {i.quantity} × {formatPrice(i.unit_price_cents)}</Text>
            </View>
            <Text style={styles.itemTotal}>{formatPrice(i.line_total_cents)}</Text>
          </View>
        ))}
        <View style={styles.totals}>
          <Row label="Subtotal" value={formatPrice(order.subtotal_cents)} />
          <Row label="Shipping" value={order.shipping_cents ? formatPrice(order.shipping_cents) : "Free"} />
          <Row label="VAT" value={formatPrice(order.tax_cents)} />
          <Row label="Total" value={formatPrice(order.total_cents)} bold />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Shipping to</Text>
        <Text style={styles.address}>
          {[order.full_name, order.address_line1, order.address_line2, `${order.city}, ${order.state} ${order.postal_code}`, order.country, order.phone]
            .filter(Boolean)
            .join("\n")}
        </Text>
        <Text style={[styles.cardTitle, { marginTop: 12 }]}>Payment</Text>
        <Text style={styles.address}>{PAYMENT_METHODS[order.payment_method]}</Text>
      </View>

      <Button title="Continue shopping" onPress={() => router.navigate("/")} />
    </ScrollView>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
      <Text style={bold ? styles.bold : styles.muted}>{label}</Text>
      <Text style={bold ? styles.bold : styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 40, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
  success: { backgroundColor: colors.success + "12", borderColor: colors.success + "40", borderWidth: 1, borderRadius: 16, padding: 16, gap: 4 },
  successTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  successText: { fontSize: 14, color: colors.inkSoft },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  number: { fontSize: 18, fontWeight: "700", color: colors.ink },
  status: { textTransform: "capitalize", color: colors.brand, fontWeight: "600", backgroundColor: colors.brand + "15", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: "hidden" },
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 10 },
  cardTitle: { fontWeight: "700", color: colors.ink },
  item: { flexDirection: "row", gap: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: colors.line },
  itemName: { fontWeight: "600", color: colors.ink },
  itemTotal: { fontWeight: "700", color: colors.ink },
  totals: { gap: 6 },
  address: { color: colors.inkSoft, lineHeight: 21 },
  muted: { color: colors.muted, fontSize: 13 },
  value: { color: colors.ink, fontSize: 13 },
  bold: { color: colors.ink, fontSize: 16, fontWeight: "700" },
});
