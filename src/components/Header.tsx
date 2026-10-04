import Link from "next/link";
import { CartLink } from "./CartLink";
import type { Category } from "@/lib/types";

type HeaderUser = { name: string; avatarUrl: string | null } | null;

export function Header({ user, categories }: { user: HeaderUser; categories: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          veyro<span className="text-brand">.</span>
        </Link>

        <form action="/shop" className="mx-auto hidden w-full max-w-md md:block" role="search">
          <label className="sr-only" htmlFor="site-search">Search products</label>
          <input id="site-search" name="q" type="search" placeholder="Search laptops, phones, accessories…" className="input rounded-full bg-tint border-transparent" />
        </form>

        <nav className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/shop" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-tint">Shop</Link>
          {user ? (
            <Link href="/account" className="flex items-center gap-2 rounded-full px-2 py-1.5 text-sm font-medium hover:bg-tint" title="Your account">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full" referrerPolicy="no-referrer" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
            </Link>
          ) : (
            <Link href="/login" className="rounded-full px-3 py-2 text-sm font-medium hover:bg-tint">Sign in</Link>
          )}
          <CartLink />
        </nav>
      </div>

      <div className="border-t border-line/70">
        <nav className="container-page flex gap-1 overflow-x-auto py-2 text-sm [scrollbar-width:none]" aria-label="Categories">
          {categories.map((c) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="shrink-0 rounded-full px-3 py-1.5 text-ink-soft hover:bg-tint hover:text-ink">
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
