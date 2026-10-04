import "server-only";
import { createClient } from "./supabase/server";
import { PRODUCT_SELECT, type Category, type Product } from "./types";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data as Category[];
}

export async function getProducts({
  category,
  q,
  sort = "featured",
  featuredOnly = false,
  limit,
}: { category?: string; q?: string; sort?: SortKey; featuredOnly?: boolean; limit?: number } = {}): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(category ? PRODUCT_SELECT.replace("categories(", "categories!inner(") : PRODUCT_SELECT);

  if (category) query = query.eq("category.slug", category);
  if (featuredOnly) query = query.eq("featured", true);

  // Strip characters that have meaning in PostgREST filter syntax.
  const term = q?.replace(/[,()*%\\]/g, " ").trim();
  if (term) query = query.or(`name.ilike.%${term}%,brand.ilike.%${term}%,description.ilike.%${term}%`);

  switch (sort) {
    case "price-asc":
      query = query.order("price_cents", { ascending: true });
      break;
    case "price-desc":
      query = query.order("price_cents", { ascending: false });
      break;
    case "name":
      query = query.order("name");
      break;
    default:
      query = query.order("featured", { ascending: false }).order("created_at").order("name");
  }
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data as unknown as Product[];
}

export async function getProduct(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}
