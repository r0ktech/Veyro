import Link from "next/link";
import { getCategories, getProducts } from "@/lib/data";
import { ProductGrid } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { formatPrice, FREE_SHIPPING_MIN_CENTS } from "@/lib/pricing";

const CATEGORY_ACCENTS = ["#94a3b8", "#3355ff", "#fb923c", "#22c55e", "#a855f7", "#f59e0b", "#ec4899", "#0ea5e9", "#14b8a6", "#ef4444"];

export default async function Home() {
  const [categories, featured, all] = await Promise.all([
    getCategories(),
    getProducts({ featuredOnly: true, limit: 8 }),
    getProducts(),
  ]);
  // Each category tile shows the photo of its top product (featured first).
  const coverFor = (categoryId: string) => all.find((p) => p.category_id === categoryId && p.image_url)?.image_url ?? null;

  return (
    <>
      {/* Hero */}
      <section className="container-page pt-10 sm:pt-14">
        <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-white sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 right-40 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-sm font-medium text-white/60">Laptops · Phones · Accessories</p>
              <h1 className="mt-4 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                The tech you use every day.
              </h1>
              <p className="mt-5 max-w-md text-lg text-white/70">
                MacBooks, ThinkPads, iPhones, Galaxys and the accessories that go with them. Free shipping on orders over {formatPrice(FREE_SHIPPING_MIN_CENTS)}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/shop" className="btn bg-white text-ink hover:bg-white/90">Shop all products</Link>
                <Link href="/shop?category=macbooks" className="btn border border-white/25 text-white hover:bg-white/10">Browse MacBooks</Link>
              </div>
            </div>
            <div className="relative hidden aspect-[4/3] lg:block">
              <div className="absolute inset-0 overflow-hidden rounded-2xl ring-1 ring-white/10">
                <ProductVisual kind="laptop" accent="#3355ff" imageUrl="/images/products/macbook-pro-14-m5.jpg" alt="MacBook Pro 14-inch" />
              </div>
              <div className="absolute -bottom-6 -left-8 h-44 w-36 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-2xl">
                <ProductVisual kind="phone" accent="#fb923c" imageUrl="/images/products/iphone-17-pro-max.jpg" alt="iPhone 17 Pro Max" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page mt-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Shop by category</h2>
          <Link href="/shop" className="text-sm font-medium text-brand hover:underline">View all</Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="group card overflow-hidden transition hover:border-ink/25">
              <div className="aspect-[4/3] bg-tint">
                <ProductVisual kind={c.kind} accent={CATEGORY_ACCENTS[i % CATEGORY_ACCENTS.length]} imageUrl={coverFor(c.id)} alt="" className="transition duration-300 group-hover:scale-105" />
              </div>
              <div className="p-3">
                <p className="font-semibold">{c.name}</p>
                <p className="line-clamp-1 text-xs text-muted">{c.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-page mt-16">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured</h2>
          <Link href="/shop" className="text-sm font-medium text-brand hover:underline">See everything</Link>
        </div>
        <div className="mt-6">
          <ProductGrid products={featured} />
        </div>
      </section>

      {/* Perks */}
      <section className="container-page mt-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            ["Free shipping", `On every order over ${formatPrice(FREE_SHIPPING_MIN_CENTS)}.`],
            ["1-year warranty", "Every device is genuine and fully covered."],
            ["Order updates by email", "Instant confirmation as soon as you check out."],
          ].map(([title, body]) => (
            <div key={title} className="card p-6">
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
