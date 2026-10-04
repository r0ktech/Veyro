import { computeTotals, formatPrice, FREE_SHIPPING_MIN_CENTS, TAX_RATE } from "@/lib/pricing";

export function OrderSummary({ subtotalCents, children }: { subtotalCents: number; children?: React.ReactNode }) {
  const t = computeTotals(subtotalCents);
  const toFree = FREE_SHIPPING_MIN_CENTS - subtotalCents;
  return (
    <div className="card p-5">
      <h2 className="font-semibold">Order summary</h2>
      {children}
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Subtotal" value={formatPrice(t.subtotal)} />
        <Row label="Shipping" value={t.shipping === 0 ? "Free" : formatPrice(t.shipping)} />
        <Row label={`VAT (${(TAX_RATE * 100).toFixed(1)}%)`} value={formatPrice(t.tax)} />
        <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
          <dt>Total</dt>
          <dd>{formatPrice(t.total)}</dd>
        </div>
      </dl>
      {toFree > 0 && subtotalCents > 0 && (
        <p className="mt-4 rounded-xl bg-tint px-3 py-2 text-xs text-ink-soft">
          Add {formatPrice(toFree)} more for free shipping.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
