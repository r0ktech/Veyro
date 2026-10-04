import { StyleSheet, Text, View } from "react-native";
import { formatPrice } from "@/lib/pricing";
import { colors } from "@/lib/theme";

export function Price({ cents, compareAt, size = 15 }: { cents: number; compareAt?: number | null; size?: number }) {
  const onSale = compareAt != null && compareAt > cents;
  return (
    <View style={styles.row}>
      <Text style={[styles.price, { fontSize: size }]}>{formatPrice(cents)}</Text>
      {onSale && <Text style={styles.compare}>{formatPrice(compareAt)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "baseline", gap: 6, flexWrap: "wrap" },
  price: { fontWeight: "700", color: colors.ink },
  compare: { fontSize: 12, color: colors.muted, textDecorationLine: "line-through" },
});
