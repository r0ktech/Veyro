"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  placeOrderFromCart,
  sendOrderConfirmation,
  siteUrlFrom,
  validateCheckout,
  type CheckoutField,
} from "@/lib/orders";

export type CheckoutState = {
  error: string | null;
  fieldErrors?: Partial<Record<CheckoutField, string>>;
  values?: Partial<Record<CheckoutField, string>>;
};

export async function placeOrder(_prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const { values, fieldErrors, valid } = validateCheckout((f) => formData.get(f));
  if (!valid) return { error: "Please fix the highlighted fields.", fieldErrors, values };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login?next=/checkout");

  const { orderId, error } = await placeOrderFromCart(supabase, values);
  if (!orderId) return { error, values };

  await sendOrderConfirmation(supabase, orderId, siteUrlFrom(await headers()));
  redirect(`/orders/${orderId}?placed=1`);
}

/** Re-send the confirmation email from the order page. */
export async function resendConfirmation(orderId: string) {
  const supabase = await createClient();
  const ok = await sendOrderConfirmation(supabase, orderId, siteUrlFrom(await headers()));
  return { ok };
}
