"use client";

import Link from "next/link";
import { maxQuantity, useCart } from "@/components/CartProvider";
import { ProductVisual } from "@/components/ProductVisual";
import { QuantityStepper } from "@/components/QuantityStepper";
import { OrderSummary } from "@/components/OrderSummary";
import { formatPrice } from "@/lib/pricing";

export function CartView() {
  const { lines, ready, setQuantity, remove, subtotalCents, userId } = useCart();

  if (!ready) return <p className="mt-8 text-muted">Loading your cart…</p>;

  if (!lines.length) {
    return (
      <div className="card mt-8 p-12 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-muted">Find a new laptop, phone or accessory to get started.</p>
        <Link href="/shop" className="btn-primary mt-6">Start shopping</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <ul className="card divide-y divide-line">
        {lines.map(({ product, quantity }) => (
          <li key={product.id} className="flex gap-4 p-4 sm:p-5">
            <Link href={`/products/${product.slug}`} className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-tint sm:h-28 sm:w-36">
              <ProductVisual kind={product.category?.kind ?? "laptop"} accent={product.accent} imageUrl={product.image_url} alt={product.name} />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wider text-muted">{product.brand}</p>
                  <Link href={`/products/${product.slug}`} className="font-semibold hover:underline">{product.name}</Link>
                  <p className="text-sm text-muted">{formatPrice(product.price_cents)} each</p>
                </div>
                <p className="shrink-0 font-semibold">{formatPrice(product.price_cents * quantity)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-3">
                <QuantityStepper value={quantity} min={1} max={maxQuantity(product)} onChange={(q) => setQuantity(product, q)} />
                <button type="button" onClick={() => remove(product)} className="text-sm text-muted hover:text-danger">
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <OrderSummary subtotalCents={subtotalCents} />
        <Link href="/checkout" className="btn-brand mt-4 w-full py-3">
          {userId ? "Checkout" : "Sign in to checkout"}
        </Link>
        <Link href="/shop" className="mt-3 block text-center text-sm text-muted hover:text-ink">Continue shopping</Link>
      </aside>
    </div>
  );
}
