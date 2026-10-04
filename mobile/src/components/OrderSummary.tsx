import { StyleSheet, Text, View } from "react-native";
import { computeTotals, formatPrice, FREE_SHIPPING_MIN_CENTS, TAX_RATE } from "@/lib/pricing";
import { colors } from "@/lib/theme";

export function OrderSummary({ subtotalCents }: { subtotalCents: number }) {
  const t = computeTotals(subtotalCents);
  const toFree = FREE_SHIPPING_MIN_CENTS - subtotalCents;
  return (
    <View style={styles.card}>
      <Row label="Subtotal" value={formatPrice(t.subtotal)} />
      <Row label="Shipping" value={t.shipping === 0 ? "Free" : formatPrice(t.shipping)} />
      <Row label={`VAT (${(TAX_RATE * 100).toFixed(1)}%)`} value={formatPrice(t.tax)} />
      <View style={styles.divider} />
      <Row label="Total" value={formatPrice(t.total)} bold />
      {toFree > 0 && subtotalCents > 0 && <Text style={styles.hint}>Add {formatPrice(toFree)} more for free shipping.</Text>}
    </View>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, bold && styles.bold]}>{label}</Text>
      <Text style={[styles.value, bold && styles.bold]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 8 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  label: { color: colors.muted, fontSize: 14 },
  value: { color: colors.ink, fontSize: 14, fontWeight: "500" },
  bold: { color: colors.ink, fontSize: 16, fontWeight: "700" },
  divider: { height: 1, backgroundColor: colors.line, marginVertical: 4 },
  hint: { marginTop: 4, fontSize: 12, color: colors.inkSoft, backgroundColor: colors.tint, padding: 8, borderRadius: 10, overflow: "hidden" },
});
