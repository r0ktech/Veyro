import { router, Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/Button";
import { Price } from "@/components/Price";
import { ProductImage } from "@/components/ProductImage";
import { QuantityStepper } from "@/components/QuantityStepper";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { MAX_CONTENT_WIDTH, useContentWidth } from "@/lib/layout";
import { maxQuantity } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { PRODUCT_SELECT, type Product } from "@/lib/types";

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { session } = useAuth();
  const { lines, add } = useCart();
  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<"idle" | "busy" | "added">("idle");
  const { contentWidth, height, isCompact } = useContentWidth();
  // 4:3 photo, but never taller than 45% of the screen (landscape, tablets).
  const imageHeight = Math.min((contentWidth * 3) / 4, height * 0.45);

  useEffect(() => {
    supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .maybeSingle()
      .then(({ data }) => setProduct((data as Product | null) ?? null));
  }, [slug]);

  if (product === undefined) return <ActivityIndicator style={{ marginTop: 60 }} color={colors.ink} />;
  if (product === null) return <Text style={styles.missing}>We couldn&apos;t find that product.</Text>;

  const inCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
  const available = Math.max(0, maxQuantity(product) - inCart);
  const quantity = Math.min(qty, Math.max(available, 1));

  async function onAdd() {
    if (!session) {
      Alert.alert("Sign in to add to cart", "Your cart is saved to your account and shared with the website.", [
        { text: "Not now", style: "cancel" },
        { text: "Sign in", onPress: () => router.navigate("/account") },
      ]);
      return;
    }
    setState("busy");
    await add(product!, quantity);
    setState("added");
    setTimeout(() => setState("idle"), 1500);
  }

  const specs = Object.entries(product.specs ?? {});
  const stockText = product.stock > 7 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left in stock` : "Sold out";

  return (
    <>
      <Stack.Screen options={{ title: product.category?.name ?? "" }} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ProductImage product={product} aspectRatio={contentWidth / imageHeight} />
        <View style={styles.body}>
          <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          <Text style={styles.name}>{product.name}</Text>
          <Price cents={product.price_cents} compareAt={product.compare_at_cents} size={22} />
          <Text style={styles.description}>{product.description}</Text>
          <Text style={[styles.stock, { color: product.stock > 0 ? colors.success : colors.danger }]}>{stockText}</Text>

          {specs.length > 0 && (
            <View style={styles.specs}>
              {specs.map(([k, v], i) => (
                <View key={k} style={[styles.spec, i > 0 && styles.specBorder]}>
                  <Text style={[styles.specKey, isCompact && { width: 90 }]}>{k}</Text>
                  <Text style={styles.specValue}>{v}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.bar}>
        {inCart > 0 && <Text style={styles.inCart}>{inCart} in your cart</Text>}
        <View style={styles.barRow}>
          {product.stock > 0 && session && <QuantityStepper value={quantity} min={1} max={Math.max(available, 1)} onChange={setQty} />}
          <Button
            title={product.stock <= 0 ? "Sold out" : available === 0 ? "Max in cart" : state === "added" ? "Added ✓" : "Add to cart"}
            disabled={product.stock <= 0 || (session != null && available === 0)}
            loading={state === "busy"}
            onPress={onAdd}
            style={{ flex: 1 }}
          />
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  missing: { textAlign: "center", marginTop: 60, color: colors.muted },
  scroll: { paddingBottom: 140, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
  body: { padding: 16, gap: 8 },
  brand: { fontSize: 12, letterSpacing: 1, color: colors.muted, fontWeight: "600" },
  name: { fontSize: 24, fontWeight: "800", color: colors.ink },
  description: { fontSize: 15, lineHeight: 22, color: colors.inkSoft, marginTop: 4 },
  stock: { fontSize: 14, fontWeight: "600", marginTop: 4 },
  specs: { marginTop: 16, backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.line },
  spec: { flexDirection: "row", paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
  specBorder: { borderTopWidth: 1, borderTopColor: colors.line },
  specKey: { width: 110, color: colors.muted, fontSize: 14 },
  specValue: { flex: 1, color: colors.ink, fontSize: 14, fontWeight: "500" },
  bar: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.line, paddingHorizontal: 16, paddingTop: 12 },
  barRow: { flexDirection: "row", gap: 12, alignItems: "center", paddingBottom: 12, width: "100%", maxWidth: MAX_CONTENT_WIDTH, alignSelf: "center" },
  inCart: { fontSize: 12, color: colors.muted, marginBottom: 8 },
});
