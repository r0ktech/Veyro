import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/lib/theme";
import type { Product } from "@/lib/types";
import { Price } from "./Price";
import { ProductImage } from "./ProductImage";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
  return (
    <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} asChild>
      <Pressable style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}>
        <View>
          <ProductImage product={product} />
          {onSale && <Text style={styles.sale}>Sale</Text>}
        </View>
        <View style={styles.body}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
          <Price cents={product.price_cents} compareAt={product.compare_at_cents} size={14} />
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, overflow: "hidden" },
  body: { padding: 12, gap: 4, flex: 1 },
  brand: { fontSize: 10, letterSpacing: 1, color: colors.muted, fontWeight: "600" },
  name: { fontSize: 14, fontWeight: "600", color: colors.ink, minHeight: 36 },
  sale: { position: "absolute", top: 8, left: 8, backgroundColor: colors.ink, color: "#fff", fontSize: 11, fontWeight: "700", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, overflow: "hidden" },
});
