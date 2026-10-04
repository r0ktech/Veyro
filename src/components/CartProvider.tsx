"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { MAX_QTY_PER_ITEM } from "@/lib/pricing";
import { PRODUCT_SELECT, type Product } from "@/lib/types";

export type CartLine = { product: Product; quantity: number };
type StoredLine = { productId: string; quantity: number };

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  ready: boolean;
  userId: string | null;
  add: (product: Product, quantity?: number) => Promise<void>;
  setQuantity: (product: Product, quantity: number) => Promise<void>;
  remove: (product: Product) => Promise<void>;
  reload: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "veyro-cart";

export const maxQuantity = (p: Pick<Product, "stock">) => Math.min(p.stock, MAX_QTY_PER_ITEM);

function readLocal(): StoredLine[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed)
      ? parsed.filter((l) => typeof l?.productId === "string" && Number.isInteger(l?.quantity) && l.quantity > 0)
      : [];
  } catch {
    return [];
  }
}

function writeLocal(lines: CartLine[]) {
  try {
    const stored: StoredLine[] = lines.map((l) => ({ productId: l.product.id, quantity: l.quantity }));
    if (stored.length) localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable (private mode); the in-memory cart still works.
  }
}

/**
 * Guests: cart lives in localStorage.
 * Signed-in users: cart lives in the `cart_items` table, and any guest cart is
 * merged into it on sign-in, so it follows them across devices and checkout
 * reads it server-side.
 */
export function CartProvider({ initialUserId, children }: { initialUserId: string | null; children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [userId, setUserId] = useState(initialUserId);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const loadSeq = useRef(0);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user.id ?? null);
    });
    return () => data.subscription.unsubscribe();
  }, [supabase]);

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    let next: CartLine[] = [];

    if (userId) {
      // Take the guest cart out of storage synchronously so a concurrent load can't merge it twice.
      const guest = readLocal();
      writeLocal([]);
      if (guest.length) {
        const ids = guest.map((l) => l.productId);
        const [{ data: existing }, { data: stock }] = await Promise.all([
          supabase.from("cart_items").select("product_id, quantity").eq("user_id", userId).in("product_id", ids),
          supabase.from("products").select("id, stock").in("id", ids),
        ]);
        const rows = guest.flatMap((l) => {
          const p = stock?.find((s) => s.id === l.productId);
          if (!p) return [];
          const prev = existing?.find((e) => e.product_id === l.productId)?.quantity ?? 0;
          const quantity = Math.min(prev + l.quantity, maxQuantity(p));
          return quantity > 0 ? [{ user_id: userId, product_id: l.productId, quantity }] : [];
        });
        if (rows.length) await supabase.from("cart_items").upsert(rows);
      }

      const { data } = await supabase
        .from("cart_items")
        .select(`quantity, product:products(${PRODUCT_SELECT})`)
        .eq("user_id", userId)
        .order("updated_at");
      next = (data ?? [])
        .filter((r) => r.product)
        .map((r) => ({ quantity: r.quantity, product: r.product as unknown as Product }));
    } else {
      const guest = readLocal();
      if (guest.length) {
        const { data } = await supabase
          .from("products")
          .select(PRODUCT_SELECT)
          .in("id", guest.map((l) => l.productId));
        next = guest.flatMap((l) => {
          const product = data?.find((p) => p.id === l.productId) as Product | undefined;
          const quantity = product ? Math.min(l.quantity, maxQuantity(product)) : 0;
          return product && quantity > 0 ? [{ product, quantity }] : [];
        });
      }
    }

    if (seq !== loadSeq.current) return; // a newer load superseded this one
    setLines(next);
    setReady(true);
  }, [supabase, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setQuantity = useCallback(
    async (product: Product, quantity: number) => {
      const q = Math.max(0, Math.min(quantity, maxQuantity(product)));
      const exists = lines.some((l) => l.product.id === product.id);
      const next =
        q === 0
          ? lines.filter((l) => l.product.id !== product.id)
          : exists
            ? lines.map((l) => (l.product.id === product.id ? { ...l, quantity: q } : l))
            : [...lines, { product, quantity: q }];
      setLines(next);

      if (!userId) {
        writeLocal(next);
        return;
      }
      const { error } =
        q === 0
          ? await supabase.from("cart_items").delete().eq("user_id", userId).eq("product_id", product.id)
          : await supabase
              .from("cart_items")
              .upsert({ user_id: userId, product_id: product.id, quantity: q, updated_at: new Date().toISOString() });
      if (error) {
        console.error("Cart sync failed", error);
        await load();
      }
    },
    [lines, userId, supabase, load],
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
      userId,
      add,
      setQuantity,
      remove,
      reload: load,
    }),
    [lines, ready, userId, add, setQuantity, remove, load],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
