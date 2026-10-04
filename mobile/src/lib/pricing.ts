// Mirrors src/lib/pricing.ts in the website. Amounts are in kobo (₦1 = 100).
// The server (place_order) decides what is actually charged.
export const FREE_SHIPPING_MIN_CENTS = 50_000_000; // ₦500,000
export const SHIPPING_FEE_CENTS = 500_000; // ₦5,000
export const TAX_RATE = 0.075;
export const MAX_QTY_PER_ITEM = 20;

const formatter = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function formatPrice(cents: number) {
  return formatter.format(cents / 100);
}

export function computeTotals(subtotalCents: number) {
  const shipping = subtotalCents === 0 || subtotalCents >= FREE_SHIPPING_MIN_CENTS ? 0 : SHIPPING_FEE_CENTS;
  const tax = Math.round((subtotalCents * TAX_RATE) / 100) * 100;
  return { subtotal: subtotalCents, shipping, tax, total: subtotalCents + shipping + tax };
}

export const maxQuantity = (p: { stock: number }) => Math.min(p.stock, MAX_QTY_PER_ITEM);

export const PAYMENT_METHODS = {
  pay_on_delivery: "Pay on delivery (card or cash)",
  bank_transfer: "Bank transfer",
} as const;
