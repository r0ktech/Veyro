import { formatPrice, PAYMENT_METHODS } from "./pricing";
import type { Order, OrderItem } from "./types";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export function orderConfirmationEmail(order: Order, items: OrderItem[], siteUrl: string) {
  const orderUrl = `${siteUrl}/orders/${order.id}`;
  const firstName = order.full_name.split(" ")[0];
  const address = [
    order.address_line1,
    order.address_line2,
    `${order.city}, ${order.state} ${order.postal_code}`,
    order.country,
  ].filter(Boolean) as string[];

  const rows = items
    .map(
      (i) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid #eceef2;font-size:14px;color:#0b0d12">
          ${esc(i.product_name)}<br><span style="color:#6b7280;font-size:13px">Qty ${i.quantity} × ${formatPrice(i.unit_price_cents)}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid #eceef2;font-size:14px;text-align:right;color:#0b0d12">${formatPrice(i.line_total_cents)}</td>
      </tr>`,
    )
    .join("");

  const totalRow = (label: string, cents: number, bold = false) => `
      <tr>
        <td style="padding:4px 0;font-size:14px;color:${bold ? "#0b0d12" : "#6b7280"};${bold ? "font-weight:700" : ""}">${label}</td>
        <td style="padding:4px 0;font-size:14px;text-align:right;color:#0b0d12;${bold ? "font-weight:700" : ""}">${cents === 0 && !bold ? "Free" : formatPrice(cents)}</td>
      </tr>`;

  const html = `<!doctype html>
<html><body style="margin:0;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
        <tr><td style="background:#0b0d12;padding:24px 32px;color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.02em">Veyro</td></tr>
        <tr><td style="padding:32px">
          <h1 style="margin:0 0 8px;font-size:22px;color:#0b0d12">Thanks for your order, ${esc(firstName)}!</h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.5;color:#4b5563">
            We've received order <strong>${esc(order.order_number)}</strong> and are getting it ready. We'll email you again when it ships.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px">
            ${totalRow("Subtotal", order.subtotal_cents)}
            ${totalRow("Shipping", order.shipping_cents)}
            ${totalRow("VAT (7.5%)", order.tax_cents)}
            ${totalRow("Total", order.total_cents, true)}
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px">
            <tr>
              <td valign="top" style="font-size:13px;line-height:1.6;color:#4b5563;padding-right:12px">
                <div style="font-weight:700;color:#0b0d12;margin-bottom:4px">Shipping to</div>
                ${esc(order.full_name)}<br>${address.map(esc).join("<br>")}
              </td>
              <td valign="top" style="font-size:13px;line-height:1.6;color:#4b5563">
                <div style="font-weight:700;color:#0b0d12;margin-bottom:4px">Payment</div>
                ${PAYMENT_METHODS[order.payment_method]}
              </td>
            </tr>
          </table>
          <a href="${orderUrl}" style="display:inline-block;margin-top:28px;background:#3355ff;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:600">View your order</a>
        </td></tr>
        <tr><td style="padding:20px 32px;border-top:1px solid #eceef2;font-size:12px;color:#9ca3af">
          You're receiving this because you placed an order at Veyro.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `Thanks for your order, ${firstName}!`,
    ``,
    `Order ${order.order_number}`,
    ...items.map((i) => `- ${i.product_name} x${i.quantity}: ${formatPrice(i.line_total_cents)}`),
    ``,
    `Subtotal: ${formatPrice(order.subtotal_cents)}`,
    `Shipping: ${order.shipping_cents === 0 ? "Free" : formatPrice(order.shipping_cents)}`,
    `VAT (7.5%): ${formatPrice(order.tax_cents)}`,
    `Total: ${formatPrice(order.total_cents)}`,
    ``,
    `Shipping to: ${order.full_name}, ${address.join(", ")}`,
    `Payment: ${PAYMENT_METHODS[order.payment_method]}`,
    ``,
    `View your order: ${orderUrl}`,
  ].join("\n");

  return { subject: `Your Veyro order ${order.order_number} is confirmed`, html, text };
}
