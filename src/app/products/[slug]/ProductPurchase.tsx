"use client";

import { useState } from "react";
import Link from "next/link";
import { AddToCartButton } from "@/components/AddToCartButton";
import { maxQuantity, useCart } from "@/components/CartProvider";
import { QuantityStepper } from "@/components/QuantityStepper";
import type { Product } from "@/lib/types";

export function ProductPurchase({ product }: { product: Product }) {
  const { lines } = useCart();
  const inCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
  const available = Math.max(0, maxQuantity(product) - inCart);
  const [qty, setQty] = useState(1);
  const quantity = Math.min(qty, Math.max(available, 1));

  if (product.stock <= 0) return <button className="btn-primary mt-6 w-full sm:w-auto" disabled>Sold out</button>;

  return (
    <div className="mt-6 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} min={1} max={Math.max(available, 1)} onChange={setQty} />
        <AddToCartButton product={product} quantity={quantity} className="btn-primary flex-1 py-3 sm:flex-none sm:px-10" />
      </div>
      {inCart > 0 && (
        <p className="text-sm text-muted">
          {inCart} in your cart · <Link href="/cart" className="font-medium text-brand hover:underline">View cart</Link>
        </p>
      )}
    </div>
  );
}
