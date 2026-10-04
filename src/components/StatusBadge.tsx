import type { Order } from "@/lib/types";

const STYLES: Record<Order["status"], string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-brand/10 text-brand",
  shipped: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-zinc-200 text-zinc-700",
};

export function StatusBadge({ status }: { status: Order["status"] }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STYLES[status]}`}>{status}</span>;
}
