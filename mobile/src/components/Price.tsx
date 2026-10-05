import { StyleSheet, Text, View } from "react-native";
import { formatPrice } from "@/lib/pricing";
import { colors } from "@/lib/theme";

export function Price({ cents, compareAt, size = 15 }: { cents: number; compareAt?: number | null; size?: number }) {
  const onSale = compareAt != null && compareAt > cents;
  return (
    // "baseline" alignment is unreliable on Android, so align the bottoms instead.
    <View style={styles.row}>
      <Text style={[styles.price, { fontSize: size }]} maxFontSizeMultiplier={1.3}>{formatPrice(cents)}</Text>
      {onSale && <Text style={styles.compare} maxFontSizeMultiplier={1.3}>{formatPrice(compareAt)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-end", columnGap: 6, flexWrap: "wrap" },
  price: { fontWeight: "700", color: colors.ink, includeFontPadding: false },
  compare: { fontSize: 12, color: colors.muted, textDecorationLine: "line-through", includeFontPadding: false, paddingBottom: 1 },
});
