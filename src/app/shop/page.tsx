import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getProducts, type SortKey } from "@/lib/data";
import { ProductGrid } from "@/components/ProductCard";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "name", label: "Name" },
];

export const metadata: Metadata = { title: "Shop" };

export default async function ShopPage(props: PageProps<"/shop">) {
  const sp = await props.searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort = (SORTS.find((s) => s.key === sp.sort)?.key ?? "featured") as SortKey;

  const [categories, products] = await Promise.all([getCategories(), getProducts({ category, q, sort })]);
  const current = categories.find((c) => c.slug === category);

  const href = (params: Record<string, string | undefined>) => {
    const merged = { category, q, sort: sort === "featured" ? undefined : sort, ...params };
    const qs = new URLSearchParams(Object.entries(merged).filter(([, v]) => v) as [string, string][]).toString();
    return `/shop${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="container-page py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{current?.name ?? (q ? `Results for “${q}”` : "All products")}</h1>
        <p className="text-muted">{current?.description ?? `${products.length} products`}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="min-w-0">
          <form action="/shop" className="mb-6 md:hidden" role="search">
            {category && <input type="hidden" name="category" value={category} />}
            <input name="q" type="search" defaultValue={q} placeholder="Search…" className="input" aria-label="Search products" />
          </form>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Categories</p>
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
            <li>
              <Link href={href({ category: undefined })} className={`block shrink-0 rounded-lg px-3 py-2 text-sm ${!category ? "bg-ink text-white" : "hover:bg-tint"}`}>
                All
              </Link>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={href({ category: c.slug })}
                  className={`block shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-sm ${category === c.slug ? "bg-ink text-white" : "hover:bg-tint"}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {products.length} {products.length === 1 ? "item" : "items"}
              {q && (
                <>
                  {" "}matching “{q}” · <Link href={href({ q: undefined })} className="text-brand hover:underline">clear search</Link>
                </>
              )}
            </p>
            <div className="flex flex-wrap gap-1 text-sm">
              {SORTS.map((s) => (
                <Link
                  key={s.key}
                  href={href({ sort: s.key === "featured" ? undefined : s.key })}
                  className={`rounded-full px-3 py-1.5 ${sort === s.key ? "bg-tint font-semibold text-ink" : "text-muted hover:text-ink"}`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {products.length ? (
            <ProductGrid products={products} />
          ) : (
            <div className="card p-12 text-center">
              <p className="font-semibold">No products found</p>
              <p className="mt-1 text-sm text-muted">Try another search or category.</p>
              <Link href="/shop" className="btn-ghost mt-5">Clear filters</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
