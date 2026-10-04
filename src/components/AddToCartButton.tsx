"use client";

import { useState } from "react";
import { maxQuantity, useCart } from "./CartProvider";
import type { Product } from "@/lib/types";

export function AddToCartButton({
  product,
  quantity = 1,
  className = "btn-primary",
  label = "Add to cart",
}: {
  product: Product;
  quantity?: number;
  className?: string;
  label?: string;
}) {
  const { lines, add } = useCart();
  const [state, setState] = useState<"idle" | "busy" | "added">("idle");

  const inCart = lines.find((l) => l.product.id === product.id)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const atLimit = inCart >= maxQuantity(product);

  async function onClick() {
    setState("busy");
    await add(product, quantity);
    setState("added");
    setTimeout(() => setState("idle"), 1600);
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={soldOut || atLimit || state === "busy"}
      className={className}
      aria-live="polite"
    >
      {soldOut ? "Sold out" : atLimit ? "Max in cart" : state === "added" ? "Added ✓" : label}
    </button>
  );
}
