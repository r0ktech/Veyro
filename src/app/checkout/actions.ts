"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/mailgun";
import { orderConfirmationEmail } from "@/lib/emails";
import { PAYMENT_METHODS } from "@/lib/pricing";
import type { Order, OrderItem } from "@/lib/types";

const FIELDS = [
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
type Field = (typeof FIELDS)[number];
const OPTIONAL: Field[] = ["address_line2", "notes"];

export type CheckoutState = {
  error: string | null;
  fieldErrors?: Partial<Record<Field, string>>;
  values?: Partial<Record<Field, string>>;
};

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const values = Object.fromEntries(
    FIELDS.map((f) => [f, String(formData.get(f) ?? "").trim().slice(0, f === "notes" ? 500 : 120)]),
  ) as Record<Field, string>;

  const fieldErrors: CheckoutState["fieldErrors"] = {};
  for (const f of FIELDS) if (!OPTIONAL.includes(f) && !values[f]) fieldErrors[f] = "Required";
  if (values.phone && !/^[+()\d\s-]{7,20}$/.test(values.phone)) fieldErrors.phone = "Enter a valid phone number";
  if (values.payment_method && !(values.payment_method in PAYMENT_METHODS)) fieldErrors.payment_method = "Choose a payment method";
  if (Object.keys(fieldErrors).length) return { error: "Please fix the highlighted fields.", fieldErrors, values };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/checkout");

  const { data: orderId, error } = await supabase.rpc("place_order", {
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
  if (error || !orderId) {
    return { error: error?.message ?? "We couldn't place your order. Please try again.", values };
  }

  await sendOrderConfirmation(orderId as string);
  redirect(`/orders/${orderId}?placed=1`);
}

/** Re-send the confirmation email from the order page. */
export async function resendConfirmation(orderId: string) {
  const sent = await sendOrderConfirmation(orderId);
  return { ok: sent };
}

async function sendOrderConfirmation(orderId: string): Promise<boolean> {
  const supabase = await createClient();
  try {
    const [{ data: order, error: orderError }, { data: items, error: itemsError }] = await Promise.all([
      supabase.from("orders").select("*").eq("id", orderId).single(),
      supabase.from("order_items").select("*").eq("order_id", orderId),
    ]);
    if (orderError || itemsError || !order) throw orderError ?? itemsError ?? new Error("Order not found");

    const email = orderConfirmationEmail(order as Order, (items ?? []) as OrderItem[], await siteUrl());
    await sendEmail({ to: order.email, ...email });
    await supabase.rpc("mark_order_emailed", { p_order_id: orderId });
    return true;
  } catch (err) {
    // The order is already placed; a failed email must not fail checkout.
    console.error(`Order ${orderId}: confirmation email failed`, err);
    return false;
  }
}

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}
