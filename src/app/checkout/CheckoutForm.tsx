"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useCart } from "@/components/CartProvider";
import { OrderSummary } from "@/components/OrderSummary";
import { ProductVisual } from "@/components/ProductVisual";
import { formatPrice, PAYMENT_METHODS } from "@/lib/pricing";
import { placeOrder, type CheckoutState } from "./actions";

const COUNTRIES = [
  "Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States", "Canada",
];

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const { lines, ready, subtotalCents } = useCart();
  const [state, formAction, pending] = useActionState<CheckoutState, FormData>(placeOrder, { error: null });
  const v = state.values ?? {};
  const fe = state.fieldErrors ?? {};

  if (ready && !lines.length) {
    return (
      <div className="card mt-8 p-12 text-center">
        <p className="text-lg font-semibold">Your cart is empty</p>
        <Link href="/shop" className="btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  const field = (
    name: keyof typeof fe,
    label: string,
    { defaultValue, ...props }: React.InputHTMLAttributes<HTMLInputElement> = {},
  ) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input
        id={name}
        name={name}
        defaultValue={v[name] ?? (defaultValue as string | undefined)}
        aria-invalid={Boolean(fe[name])}
        className={`input ${fe[name] ? "border-danger" : ""}`}
        {...props}
      />
      {fe[name] && <p className="mt-1 text-xs text-danger">{fe[name]}</p>}
    </div>
  );

  return (
    <form action={formAction} className="mt-8 grid gap-8 lg:grid-cols-[1fr_400px]">
      <div className="space-y-8">
        <fieldset className="card p-5 sm:p-6">
          <legend className="sr-only">Shipping details</legend>
          <h2 className="font-semibold">Shipping details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {field("full_name", "Full name", { autoComplete: "name", required: true, defaultValue: defaultName })}
            {field("phone", "Phone", { type: "tel", autoComplete: "tel", required: true })}
            <div className="sm:col-span-2">{field("address_line1", "Address", { autoComplete: "address-line1", required: true })}</div>
            <div className="sm:col-span-2">{field("address_line2", "Apartment, suite, etc. (optional)", { autoComplete: "address-line2" })}</div>
            {field("city", "City", { autoComplete: "address-level2", required: true })}
            {field("state", "State / Province", { autoComplete: "address-level1", required: true })}
            {field("postal_code", "Postal code", { autoComplete: "postal-code", required: true })}
            <div>
              <label htmlFor="country" className="label">Country</label>
              <select id="country" name="country" defaultValue={v.country ?? "Nigeria"} className="input" autoComplete="country-name">
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset className="card p-5 sm:p-6">
          <legend className="sr-only">Payment</legend>
          <h2 className="font-semibold">Payment</h2>
          <p className="mt-1 text-sm text-muted">No card details are collected online. Choose how you&apos;d like to pay.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {Object.entries(PAYMENT_METHODS).map(([value, label], i) => (
              <label key={value} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-4 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                <input type="radio" name="payment_method" value={value} defaultChecked={v.payment_method ? v.payment_method === value : i === 0} className="accent-brand" />
                <span className="font-medium">{label}</span>
              </label>
            ))}
          </div>
          {fe.payment_method && <p className="mt-2 text-xs text-danger">{fe.payment_method}</p>}

          <div className="mt-5">
            <label htmlFor="notes" className="label">Order notes (optional)</label>
            <textarea id="notes" name="notes" rows={3} maxLength={500} defaultValue={v.notes} className="input" placeholder="Delivery instructions, gift message…" />
          </div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-32 lg:self-start">
        <OrderSummary subtotalCents={subtotalCents}>
          {!ready ? (
            <p className="mt-4 text-sm text-muted">Loading cart…</p>
          ) : (
            <ul className="mt-4 space-y-3 border-b border-line pb-4">
              {lines.map(({ product, quantity }) => (
                <li key={product.id} className="flex items-center gap-3 text-sm">
                  <div className="relative h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-tint">
                    <ProductVisual kind={product.category?.kind ?? "laptop"} accent={product.accent} imageUrl={product.image_url} alt="" />
                    <span className="absolute -right-0 -top-0 rounded-bl-lg bg-ink px-1.5 text-[10px] font-bold text-white">{quantity}</span>
                  </div>
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  <span className="font-medium">{formatPrice(product.price_cents * quantity)}</span>
                </li>
              ))}
            </ul>
          )}
        </OrderSummary>

        {state.error && (
          <p role="alert" className="mt-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">{state.error}</p>
        )}

        <button type="submit" disabled={!ready || pending} className="btn-brand mt-4 w-full py-3">
          {pending ? "Placing order…" : "Place order"}
        </button>
        <p className="mt-3 text-center text-xs text-muted">Prices, stock and totals are confirmed on our server when you place the order.</p>
      </aside>
    </form>
  );
}
