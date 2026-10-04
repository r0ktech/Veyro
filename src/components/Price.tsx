import { formatPrice } from "@/lib/pricing";

export function Price({ cents, compareAt, className = "" }: { cents: number; compareAt?: number | null; className?: string }) {
  const onSale = compareAt != null && compareAt > cents;
  return (
    <span className={`inline-flex items-baseline gap-2 ${className}`}>
      <span className="font-semibold text-ink">{formatPrice(cents)}</span>
      {onSale && <span className="text-sm text-muted line-through">{formatPrice(compareAt)}</span>}
    </span>
  );
}
