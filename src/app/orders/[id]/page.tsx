import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, PAYMENT_METHODS } from "@/lib/pricing";
import type { Order, OrderItem } from "@/lib/types";
import { StatusBadge } from "@/components/StatusBadge";
import { CartReload, ResendEmailButton } from "./OrderClient";

export const metadata: Metadata = { title: "Order" };

export default async function OrderPage(props: PageProps<"/orders/[id]">) {
  const { id } = await props.params;
  const { placed } = await props.searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const supabase = await createClient();
  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle<Order>(),
    supabase.from("order_items").select("*").eq("order_id", id).returns<OrderItem[]>(),
  ]);
  if (!order) notFound();

  return (
    <div className="container-page max-w-4xl py-10">
      {placed && <CartReload />}

      {placed ? (
        <div className="card flex flex-col items-start gap-3 border-success/30 bg-success/5 p-6 sm:flex-row sm:items-center">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success text-xl text-white">✓</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Thank you, your order is confirmed!</h1>
            <p className="text-ink-soft">
              {order.email_sent_at
                ? <>A confirmation email has been sent to <strong>{order.email}</strong>.</>
                : <>Your order is placed, but we couldn&apos;t send the confirmation email to {order.email} just now.</>}
            </p>
          </div>
        </div>
      ) : (
        <Link href="/account" className="text-sm text-muted hover:text-ink">← All orders</Link>
      )}

      <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted">Order</p>
          <p className="font-mono text-xl font-semibold">{order.order_number}</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted">
          {new Date(order.created_at).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[1fr_300px]">
        <div className="card divide-y divide-line">
          {(items ?? []).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-4 p-4 text-sm">
              <div>
                {i.product_slug ? (
                  <Link href={`/products/${i.product_slug}`} className="font-medium hover:underline">{i.product_name}</Link>
                ) : (
                  <span className="font-medium">{i.product_name}</span>
                )}
                <p className="text-muted">Qty {i.quantity} × {formatPrice(i.unit_price_cents)}</p>
              </div>
              <span className="font-semibold">{formatPrice(i.line_total_cents)}</span>
            </div>
          ))}
          <dl className="space-y-1.5 p-4 text-sm">
            <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(order.subtotal_cents)}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{order.shipping_cents ? formatPrice(order.shipping_cents) : "Free"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">VAT</dt><dd>{formatPrice(order.tax_cents)}</dd></div>
            <div className="flex justify-between pt-2 text-base font-bold"><dt>Total</dt><dd>{formatPrice(order.total_cents)}</dd></div>
          </dl>
        </div>

        <div className="space-y-4">
          <div className="card p-4 text-sm">
            <p className="font-semibold">Shipping to</p>
            <p className="mt-2 leading-relaxed text-ink-soft">
              {order.full_name}<br />
              {order.address_line1}<br />
              {order.address_line2 && <>{order.address_line2}<br /></>}
              {order.city}, {order.state} {order.postal_code}<br />
              {order.country}<br />
              {order.phone}
            </p>
          </div>
          <div className="card p-4 text-sm">
            <p className="font-semibold">Payment</p>
            <p className="mt-2 text-ink-soft">{PAYMENT_METHODS[order.payment_method]}</p>
            {order.notes && (
              <>
                <p className="mt-4 font-semibold">Notes</p>
                <p className="mt-2 text-ink-soft">{order.notes}</p>
              </>
            )}
          </div>
          <ResendEmailButton orderId={order.id} email={order.email} />
        </div>
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/shop" className="btn-primary">Continue shopping</Link>
        <Link href="/account" className="btn-ghost">View all orders</Link>
      </div>
    </div>
  );
}
