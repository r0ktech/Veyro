import Link from "next/link";
import type { Category } from "@/lib/types";

export function Footer({ categories }: { categories: Category[] }) {
  const half = Math.ceil(categories.length / 2);
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="text-xl font-bold tracking-tight">veyro<span className="text-brand">.</span></p>
          <p className="mt-3 max-w-xs text-sm text-muted">
            Laptops, phones and the accessories that make them better. Nothing else.
          </p>
        </div>
        {[categories.slice(0, half), categories.slice(half)].map((group, i) => (
          <ul key={i} className="space-y-2 text-sm">
            {i === 0 && <li className="mb-3 font-semibold">Shop</li>}
            {i === 1 && <li className="mb-3 font-semibold sm:invisible">More</li>}
            {group.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.slug}`} className="text-muted hover:text-ink">{c.name}</Link>
              </li>
            ))}
          </ul>
        ))}
        <ul className="space-y-2 text-sm">
          <li className="mb-3 font-semibold">Account</li>
          <li><Link href="/account" className="text-muted hover:text-ink">Your orders</Link></li>
          <li><Link href="/cart" className="text-muted hover:text-ink">Cart</Link></li>
          <li><Link href="/login" className="text-muted hover:text-ink">Sign in</Link></li>
          <li><Link href="/credits" className="text-muted hover:text-ink">Image credits</Link></li>
        </ul>
      </div>
      <div className="border-t border-line">
        <p className="container-page py-6 text-xs text-muted">© {new Date().getFullYear()} Veyro. A student project.</p>
      </div>
    </footer>
  );
}
