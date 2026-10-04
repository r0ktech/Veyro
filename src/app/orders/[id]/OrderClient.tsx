"use client";

import { useEffect, useState, useTransition } from "react";
import { useCart } from "@/components/CartProvider";
import { resendConfirmation } from "@/app/checkout/actions";

/** The server cleared the cart when the order was placed; resync the client copy. */
export function CartReload() {
  const { reload } = useCart();
  useEffect(() => {
    void reload();
  }, [reload]);
  return null;
}

export function ResendEmailButton({ orderId, email }: { orderId: string; email: string }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<"sent" | "failed" | null>(null);

  return (
    <div className="text-sm">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const { ok } = await resendConfirmation(orderId);
            setResult(ok ? "sent" : "failed");
          })
        }
        className="btn-ghost w-full"
      >
        {pending ? "Sending…" : "Resend confirmation email"}
      </button>
      {result === "sent" && <p className="mt-2 text-center text-success">Sent to {email}</p>}
      {result === "failed" && <p className="mt-2 text-center text-danger">Couldn&apos;t send the email. Check the Mailgun settings.</p>}
    </div>
  );
}
