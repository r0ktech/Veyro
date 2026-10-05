import { Link, router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { OrderSummary } from "@/components/OrderSummary";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { MAX_CONTENT_WIDTH, useContentWidth } from "@/lib/layout";
import { formatPrice, maxQuantity } from "@/lib/pricing";
import { colors } from "@/lib/theme";

export default function CartScreen() {
  const { session } = useAuth();
  const { lines, ready, subtotalCents, setQuantity, remove } = useCart();
  const { isCompact } = useContentWidth();
  const thumbWidth = isCompact ? 80 : 96;

  if (!session) {
    return (
      <SafeAreaView style={styles.screen} edges={["top"]}>
        <View style={styles.list}>
          <Text style={styles.title}>Your cart</Text>
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Sign in to see your cart</Text>
            <Text style={styles.emptyText}>Your cart is shared with the Veyro website, so it follows you everywhere.</Text>
            <Button title="Sign in" onPress={() => router.navigate("/account")} style={{ marginTop: 16 }} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      <FlatList
        data={lines}
        keyExtractor={(l) => l.product.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Your cart</Text>}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item: { product, quantity } }) => (
          <View style={styles.line}>
            <Link href={{ pathname: "/product/[slug]", params: { slug: product.slug } }} asChild>
              <Pressable style={[styles.thumb, { width: thumbWidth }]}>
                <ProductImage product={product} />
              </Pressable>
            </Link>
            <View style={styles.lineBody}>
              <Text style={styles.name} numberOfLines={2} maxFontSizeMultiplier={1.3}>{product.name}</Text>
              <Text style={styles.each} maxFontSizeMultiplier={1.3}>{formatPrice(product.price_cents)} each</Text>
              <View style={styles.lineFooter}>
                <QuantityStepper value={quantity} min={1} max={maxQuantity(product)} onChange={(q) => setQuantity(product, q)} />
                <Pressable onPress={() => remove(product)} hitSlop={8}>
                  <Text style={styles.remove}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          ready ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Your cart is empty</Text>
              <Button title="Start shopping" variant="ghost" onPress={() => router.navigate("/")} style={{ marginTop: 16 }} />
            </View>
          ) : null
        }
        ListFooterComponent={
          lines.length > 0 ? (
            <View style={{ marginTop: 20, gap: 12 }}>
              <OrderSummary subtotalCents={subtotalCents} />
              <Button title="Checkout" variant="brand" onPress={() => router.push("/checkout")} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  // Full width on phones, centred column on tablets.
  list: { padding: 16, paddingBottom: 32, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
  title: { fontSize: 26, fontWeight: "800", color: colors.ink, marginBottom: 16, paddingHorizontal: 0 },
  line: { flexDirection: "row", gap: 12, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line, padding: 12 },
  // Fixed-size frame centred in the row, so the photo can't stretch or drift to the top.
  thumb: { alignSelf: "center", borderRadius: 12, overflow: "hidden" },
  lineBody: { flex: 1, minWidth: 0, gap: 4 },
  name: { fontSize: 15, fontWeight: "600", color: colors.ink },
  each: { fontSize: 13, color: colors.muted },
  lineFooter: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", rowGap: 8, marginTop: 4 },
  remove: { color: colors.muted, fontSize: 13 },
  empty: { alignItems: "center", paddingTop: 60, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 17, fontWeight: "700", color: colors.ink },
  emptyText: { fontSize: 14, color: colors.muted, textAlign: "center", marginTop: 6 },
});
