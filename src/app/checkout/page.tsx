import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/data";
import { CheckoutForm } from "./CheckoutForm";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/checkout");
  const meta = user.user_metadata ?? {};

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="mt-1 text-muted">
        Signed in as <span className="font-medium text-ink">{user.email}</span>. Your confirmation email goes here.
      </p>
      <CheckoutForm defaultName={(meta.full_name ?? meta.name ?? "") as string} />
    </div>
  );
}
