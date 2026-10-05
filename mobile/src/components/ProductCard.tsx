import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";

// Keeps cards a predictable height when the phone uses a large font size.
const MAX_FONT_SCALE = 1.3;

export function ProductCard({ product, width }: { product: Product; width: number }) {
  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
  return (
    <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} asChild>
      <Pressable style={({ pressed }) => [styles.card, { width }, pressed && { opacity: 0.85 }]}>
        <View>
          <ProductImage product={product} />
          {onSale && (
            <View style={styles.sale}>
              <Text style={styles.saleText} maxFontSizeMultiplier={MAX_FONT_SCALE}>Sale</Text>
            </View>
          )}
        </View>
        <View style={styles.body}>
          <Text style={styles.brand} numberOfLines={1} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {product.brand.toUpperCase()}
          </Text>
          <Text style={styles.name} numberOfLines={2} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {product.name}
          </Text>
          <View style={styles.priceRow}>
            <Price cents={product.price_cents} compareAt={product.compare_at_cents} size={14} />
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  body: { padding: 12, gap: 4, flexGrow: 1 },
  brand: { fontSize: 10, lineHeight: 14, letterSpacing: 1, color: colors.muted, fontWeight: "600" },
  // Two lines are always reserved so names of different lengths don't push prices out of line.
  name: { fontSize: 14, lineHeight: 19, minHeight: 38, fontWeight: "600", color: colors.ink },
  priceRow: { marginTop: "auto", paddingTop: 2 },
  sale: { position: "absolute", top: 8, left: 8, backgroundColor: colors.ink, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  saleText: { color: "#fff", fontSize: 11, fontWeight: "700", includeFontPadding: false },
});
