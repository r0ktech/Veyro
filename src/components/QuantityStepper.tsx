"use client";

export function QuantityStepper({
  value,
  min = 0,
  max,
  onChange,
  disabled,
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-surface">
      <button type="button" className="h-10 w-10 rounded-full text-lg hover:bg-tint disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={disabled || value <= min} aria-label="Decrease quantity">
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className="h-10 w-10 rounded-full text-lg hover:bg-tint disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={disabled || value >= max} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}
