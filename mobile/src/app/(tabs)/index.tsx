import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "@/components/ProductCard";
import { supabase } from "@/lib/supabase";
import { colors } from "@/lib/theme";
import { PRODUCT_SELECT, type Category, type Product } from "@/lib/types";

export default function ShopScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("categories")
      .select("*")
      .order("sort_order")
      .then(({ data }) => setCategories((data ?? []) as Category[]));
  }, []);

  // Same queries as the website's shop page.
  const loadProducts = useCallback(async () => {
    setError(null);
    let q = supabase
      .from("products")
      .select(category ? PRODUCT_SELECT.replace("categories(", "categories!inner(") : PRODUCT_SELECT);
    if (category) q = q.eq("category.slug", category);
    const term = query.replace(/[,()*%\\]/g, " ").trim();
    if (term) q = q.or(`name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`);
    const { data, error } = await q.order("featured", { ascending: false }).order("name");
    if (error) setError("Couldn't load products. Check your connection and pull to refresh.");
    setProducts((data ?? []) as unknown as Product[]);
    setLoading(false);
  }, [category, query]);

  useEffect(() => {
    const t = setTimeout(() => void loadProducts(), query ? 250 : 0); // debounce typing
    return () => clearTimeout(t);
  }, [loadProducts, query]);

  const header = (
    <View style={styles.header}>
      <Text style={styles.logo}>
        veyro<Text style={{ color: colors.brand }}>.</Text>
      </Text>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder="Search laptops, phones, accessories…"
        placeholderTextColor={colors.muted}
        style={styles.search}
        returnKeyType="search"
        clearButtonMode="while-editing"
        autoCorrect={false}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        <Chip label="All" active={!category} onPress={() => setCategory(null)} />
        {categories.map((c) => (
          <Chip key={c.id} label={c.name} active={category === c.slug} onPress={() => setCategory(c.slug)} />
        ))}
      </ScrollView>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top"]}>
      {loading ? (
        <View style={styles.list}>
          {header}
          <ActivityIndicator style={{ marginTop: 40 }} color={colors.ink} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(p) => p.id}
          numColumns={2}
          ListHeaderComponent={header}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => <ProductCard product={item} />}
          ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
          refreshControl={<RefreshControl refreshing={false} onRefresh={loadProducts} />}
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  header: { gap: 12, paddingBottom: 12 },
  logo: { fontSize: 26, fontWeight: "800", color: colors.ink, letterSpacing: -0.5, paddingTop: 8 },
  search: { backgroundColor: colors.tint, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: colors.ink },
  chips: { gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  chipActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  chipText: { color: colors.inkSoft, fontSize: 13, fontWeight: "500" },
  chipTextActive: { color: "#fff" },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  row: { gap: 12, marginBottom: 12 },
  empty: { textAlign: "center", color: colors.muted, marginTop: 40 },
  error: { color: colors.danger, fontSize: 13 },
});
