import Link from "next/link";
import { ProductVisual } from "./ProductVisual";
import { Price } from "./Price";
import { AddToCartButton } from "./AddToCartButton";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compare_at_cents != null && product.compare_at_cents > product.price_cents;
  return (
    <article className="group card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-12px_rgba(11,13,18,0.18)]">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] bg-tint">
        <ProductVisual
          kind={product.category?.kind ?? "laptop"}
          accent={product.accent}
          imageUrl={product.image_url}
          alt={product.name}
          className="transition duration-300 group-hover:scale-[1.03]"
        />
        {onSale && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2.5 py-1 text-xs font-semibold text-white">Sale</span>
        )}
        {product.stock > 0 && product.stock <= 7 && (
          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-ink-soft">
            Only {product.stock} left
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">{product.brand}</p>
        <h3 className="font-semibold leading-snug text-ink">
          <Link href={`/products/${product.slug}`} className="hover:underline">
            {product.name}
          </Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          <Price cents={product.price_cents} compareAt={product.compare_at_cents} />
          <AddToCartButton product={product} className="btn-ghost px-4 py-2" label="Add" />
        </div>
      </div>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
