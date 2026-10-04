import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, getProducts } from "@/lib/data";
import { ProductVisual } from "@/components/ProductVisual";
import { Price } from "@/components/Price";
import { ProductGrid } from "@/components/ProductCard";
import { ProductPurchase } from "./ProductPurchase";
import { formatPrice, FREE_SHIPPING_MIN_CENTS } from "@/lib/pricing";

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = await getProduct((await props.params).slug);
  return product ? { title: product.name, description: product.description } : {};
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = product.category
    ? (await getProducts({ category: product.category.slug, limit: 5 })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const specs = Object.entries(product.specs ?? {});

  return (
    <div className="container-page py-8">
      <nav className="text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-ink">Shop</Link>
        {product.category && (
          <>
            {" / "}
            <Link href={`/shop?category=${product.category.slug}`} className="hover:text-ink">{product.category.name}</Link>
          </>
        )}
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="card aspect-[4/3] overflow-hidden bg-tint">
          <ProductVisual kind={product.category?.kind ?? "laptop"} accent={product.accent} imageUrl={product.image_url} alt={product.name} />
        </div>

        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-muted">{product.brand}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{product.name}</h1>
          <Price cents={product.price_cents} compareAt={product.compare_at_cents} className="mt-4 text-2xl" />
          <p className="mt-5 text-lg leading-relaxed text-ink-soft">{product.description}</p>

          <p className={`mt-6 text-sm font-medium ${product.stock > 0 ? "text-success" : "text-danger"}`}>
            {product.stock > 7 ? "In stock" : product.stock > 0 ? `Only ${product.stock} left in stock` : "Sold out"}
          </p>

          <ProductPurchase product={product} />

          <ul className="mt-8 space-y-2 border-t border-line pt-6 text-sm text-muted">
            <li>Free shipping on orders over {formatPrice(FREE_SHIPPING_MIN_CENTS)}</li>
            <li>1-year manufacturer warranty</li>
            <li>Email confirmation the moment you order</li>
          </ul>
        </div>
      </div>

      {specs.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">Specifications</h2>
          <dl className="card mt-4 divide-y divide-line">
            {specs.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3.5 text-sm sm:grid-cols-[220px_1fr]">
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="text-xl font-bold tracking-tight">More {product.category?.name}</h2>
          <div className="mt-4">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
