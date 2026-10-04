import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/pricing";
import type { Order } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";

export const metadata: Metadata = { title: "Your account" };

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) redirect("/login?next=/account");

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, total_cents, created_at, order_items(count)")
    .order("created_at", { ascending: false })
    .returns<(Pick<Order, "id" | "order_number" | "status" | "total_cents" | "created_at"> & { order_items: { count: number }[] })[]>();

  const meta = user.user_metadata ?? {};
  const name = (meta.full_name ?? meta.name ?? user.email) as string;

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="card flex flex-wrap items-center gap-4 p-6">
        {meta.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={meta.avatar_url} alt="" className="h-14 w-14 rounded-full" referrerPolicy="no-referrer" />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink text-xl font-bold text-white">{name.charAt(0)}</span>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-muted">{user.email} · Signed in with Google</p>
        </div>
        <form action="/auth/signout" method="post">
          <button className="btn-ghost">Sign out</button>
        </form>
      </div>

      <h2 className="mt-10 text-xl font-bold tracking-tight">Your orders</h2>
      {orders?.length ? (
        <ul className="card mt-4 divide-y divide-line">
          {orders.map((o) => {
            const count = o.order_items[0]?.count ?? 0;
            return (
              <li key={o.id}>
                <Link href={`/orders/${o.id}`} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 hover:bg-tint/60">
                  <span className="font-mono font-semibold">{o.order_number}</span>
                  <span className="text-sm text-muted">{new Date(o.created_at).toLocaleDateString("en-NG", { dateStyle: "medium" })}</span>
                  <span className="text-sm text-muted">{count} {count === 1 ? "item" : "items"}</span>
                  <StatusBadge status={o.status} />
                  <span className="ml-auto font-semibold">{formatPrice(o.total_cents)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="card mt-4 p-10 text-center">
          <p className="font-semibold">No orders yet</p>
          <Link href="/shop" className="btn-primary mt-5">Start shopping</Link>
        </div>
      )}
    </div>
  );
}
