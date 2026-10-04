import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";
import { placeOrderFromCart, sendOrderConfirmation, siteUrlFrom, validateCheckout } from "@/lib/orders";

/**
 * Checkout for the mobile app. Same logic as the website's checkout form:
 * the order is built from the user's saved cart in Supabase.
 *
 * Auth: `Authorization: Bearer <Supabase access token>` from the app's session.
 * Body: JSON with the checkout fields (full_name, phone, address_line1, …).
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return NextResponse.json({ error: "Sign in to place an order." }, { status: 401 });

  // A client that acts as the user, so row level security and auth.uid() apply.
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user) return NextResponse.json({ error: "Your session has expired. Sign in again." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { values, fieldErrors, valid } = validateCheckout((f) => body[f]);
  if (!valid) return NextResponse.json({ error: "Please fix the highlighted fields.", fieldErrors }, { status: 422 });

  const { orderId, error } = await placeOrderFromCart(supabase, values);
  if (!orderId) return NextResponse.json({ error }, { status: 409 });

  const emailSent = await sendOrderConfirmation(supabase, orderId, siteUrlFrom(request.headers));
  return NextResponse.json({ orderId, emailSent }, { status: 201 });
}
