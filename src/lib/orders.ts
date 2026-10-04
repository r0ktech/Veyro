import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { sendEmail } from "./mailgun";
import { orderConfirmationEmail } from "./emails";
import { PAYMENT_METHODS } from "./pricing";
import type { Order, OrderItem } from "./types";

// Shared by the website's checkout form (server action) and the mobile app's
// POST /api/checkout, so both place orders exactly the same way.

export const CHECKOUT_FIELDS = [
  "full_name",
  "phone",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "postal_code",
  "country",
  "payment_method",
  "notes",
] as const;
export type CheckoutField = (typeof CHECKOUT_FIELDS)[number];
export type CheckoutValues = Record<CheckoutField, string>;
const OPTIONAL: CheckoutField[] = ["address_line2", "notes"];

export function validateCheckout(get: (field: CheckoutField) => unknown) {
  const values = Object.fromEntries(
    CHECKOUT_FIELDS.map((f) => [f, String(get(f) ?? "").trim().slice(0, f === "notes" ? 500 : 120)]),
  ) as CheckoutValues;

  const fieldErrors: Partial<Record<CheckoutField, string>> = {};
  for (const f of CHECKOUT_FIELDS) if (!OPTIONAL.includes(f) && !values[f]) fieldErrors[f] = "Required";
  if (values.phone && !/^[+()\d\s-]{7,20}$/.test(values.phone)) fieldErrors.phone = "Enter a valid phone number";
  if (values.payment_method && !(values.payment_method in PAYMENT_METHODS)) fieldErrors.payment_method = "Choose a payment method";

  return { values, fieldErrors, valid: Object.keys(fieldErrors).length === 0 };
}

/** Turns the signed-in user's saved cart into an order (see place_order() in schema.sql). */
export async function placeOrderFromCart(supabase: SupabaseClient, values: CheckoutValues) {
  const { data, error } = await supabase.rpc("place_order", {
    p_full_name: values.full_name,
    p_phone: values.phone,
    p_address_line1: values.address_line1,
    p_address_line2: values.address_line2,
    p_city: values.city,
    p_state: values.state,
    p_postal_code: values.postal_code,
    p_country: values.country,
    p_payment_method: values.payment_method,
    p_notes: values.notes,
  });
  if (error || !data) {
    return { orderId: null, error: error?.message ?? "We couldn't place your order. Please try again." };
  }
  return { orderId: data as string, error: null };
}

/** Emails the order confirmation. Never throws: a failed email must not fail checkout. */
export async function sendOrderConfirmation(supabase: SupabaseClient, orderId: string, siteUrl: string): Promise<boolean> {
  try {
    const [{ data: order, error: orderError }, { data: items, error: itemsError }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("order_items").select("*").eq("order_id", orderId),
    ]);
    if (orderError || itemsError || !order) throw orderError ?? itemsError ?? new Error("Order not found");

    const email = orderConfirmationEmail(order as Order, (items ?? []) as OrderItem[], siteUrl);
    await sendEmail({ to: order.email, ...email });
    await supabase.rpc("mark_order_emailed", { p_order_id: orderId });
    return true;
  } catch (err) {
    console.error(`Order ${orderId}: confirmation email failed`, err);
    return false;
  }
}

/** Public site URL for links in emails. */
export function siteUrlFrom(headers: Headers) {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const host = headers.get("x-forwarded-host") ?? headers.get("host");
  const proto = headers.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
