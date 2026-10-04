import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState } from "react-native";
import { useAuth } from "./auth";
import { maxQuantity } from "./pricing";
import { supabase } from "./supabase";
import { PRODUCT_SELECT, type Product } from "./types";

export type CartLine = { product: Product; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  setQuantity: (product: Product, quantity: number) => Promise<void>;
  add: (product: Product, quantity?: number) => Promise<void>;
  remove: (product: Product) => Promise<void>;
  reload: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

/**
 * The cart is the signed-in user's rows in the `cart_items` table, the same
 * rows the website reads and writes. A Supabase Realtime subscription reloads
 * it the moment it changes anywhere, so items added on the website appear here
 * straight away (and vice versa).
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const userId = session?.user.id ?? null;
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const loadSeq = useRef(0);

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    let next: CartLine[] = [];
    if (userId) {
      const { data, error } = await supabase
        .from("cart_items")
        .select(`quantity, product:products(${PRODUCT_SELECT})`)
        .eq("user_id", userId)
        .order("updated_at");
      if (error) console.warn("Cart load failed", error.message);
      next = (data ?? [])
        .filter((r) => r.product)
        .map((r) => ({ quantity: r.quantity, product: r.product as unknown as Product }));
    }
    if (seq !== loadSeq.current) return; // a newer load superseded this one
    setLines(next);
    setReady(true);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  // Live sync with the website and other devices.
  useEffect(() => {
    if (!userId) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const reload = () => {
      clearTimeout(timer);
      timer = setTimeout(() => void load(), 150);
    };
    const channel = supabase
      .channel(`cart:${userId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "cart_items", filter: `user_id=eq.${userId}` }, reload)
      // Realtime can't filter deletes, but their payload carries the primary key, which includes user_id.
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "cart_items" }, (payload) => {
        if ((payload.old as { user_id?: string }).user_id === userId) reload();
      })
      .subscribe();

    // The connection pauses in the background, so catch up when the app comes back.
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") reload();
    });

    return () => {
      clearTimeout(timer);
      sub.remove();
      void supabase.removeChannel(channel);
    };
  }, [userId, load]);

  const setQuantity = useCallback(
    async (product: Product, quantity: number) => {
      if (!userId) return;
      const q = Math.max(0, Math.min(quantity, maxQuantity(product)));
      setLines((prev) => {
        if (q === 0) return prev.filter((l) => l.product.id !== product.id);
        return prev.some((l) => l.product.id === product.id)
          ? prev.map((l) => (l.product.id === product.id ? { ...l, quantity: q } : l))
          : [...prev, { product, quantity: q }];
      });
      const { error } =
        q === 0
          ? await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", product.id)
          : await supabase
              .from("cart_items")
              .upsert({ user_id: userId, product_id: product.id, quantity: q, updated_at: new Date().toISOString() });
      if (error) {
        console.warn("Cart sync failed", error.message);
        await load();
      }
    },
    [userId, load],
  );

  const add = useCallback(
    (product: Product, quantity = 1) => {
      const current = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
      return setQuantity(product, current + quantity);
    },
    [lines, setQuantity],
  );

  const remove = useCallback((product: Product) => setQuantity(product, 0), [setQuantity]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalCents: lines.reduce((n, l) => n + l.quantity * l.product.price_cents, 0),
      ready,
      setQuantity,
      add,
      remove,
      reload: load,
    }),
    [lines, ready, setQuantity, add, remove, load],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
