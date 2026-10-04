import type { DeviceKind } from "@/lib/types";

/**
 * Product photo when the product has an image_url; otherwise a generated
 * illustration of the device type.
 */
export function ProductVisual({
  kind,
  accent,
  imageUrl,
  alt,
  className = "",
}: {
  kind: DeviceKind;
  accent: string;
  imageUrl?: string | null;
  alt: string;
  className?: string;
}) {
  if (imageUrl) {
    // Photos come in every aspect ratio (tall phones, wide keyboards), so show
    // the whole photo over a blurred copy of itself that fills the frame.
    return (
      <div className="relative h-full w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={alt} loading="lazy" className={`absolute inset-0 h-full w-full object-contain ${className}`} />
      </div>
    );
  }

  const id = `g-${kind}-${accent.replace("#", "")}`;
  return (
    <svg viewBox="0 0 200 150" role="img" aria-label={alt} className={`h-full w-full ${className}`}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity="0.16" />
          <stop offset="1" stopColor={accent} stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id={`${id}-screen`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={accent} />
          <stop offset="1" stopColor="#0b0d12" stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill={`url(#${id}-bg)`} />
      <g stroke="#0b0d12" strokeOpacity="0.14" strokeWidth="1">
        <Device kind={kind} accent={accent} screen={`url(#${id}-screen)`} />
      </g>
    </svg>
  );
}

function Device({ kind, accent, screen }: { kind: DeviceKind; accent: string; screen: string }) {
  switch (kind) {
    case "laptop":
      return (
        <>
          <rect x="44" y="28" width="112" height="74" rx="6" fill="#16181f" />
          <rect x="49" y="33" width="102" height="64" rx="2" fill={screen} />
          <path d="M28 104h144l8 9a3 3 0 0 1-2 5H22a3 3 0 0 1-2-5z" fill={accent} />
          <rect x="88" y="104" width="24" height="3" rx="1.5" fill="#0b0d12" fillOpacity="0.2" />
        </>
      );
    case "phone":
      return (
        <>
          <rect x="74" y="14" width="52" height="122" rx="12" fill={accent} />
          <rect x="78" y="18" width="44" height="114" rx="9" fill={screen} />
          <rect x="91" y="23" width="18" height="5" rx="2.5" fill="#0b0d12" />
          <rect x="88" y="124" width="24" height="2" rx="1" fill="#fff" fillOpacity="0.7" />
        </>
      );
    case "monitor":
      return (
        <>
          <rect x="26" y="18" width="148" height="88" rx="5" fill="#16181f" />
          <rect x="30" y="22" width="140" height="80" rx="2" fill={screen} />
          <path d="M92 106h16l4 18H88z" fill={accent} />
          <rect x="70" y="122" width="60" height="7" rx="3.5" fill={accent} />
        </>
      );
    case "keyboard":
      return (
        <>
          <rect x="18" y="46" width="164" height="62" rx="9" fill={accent} />
          {Array.from({ length: 4 }).flatMap((_, row) =>
            Array.from({ length: 12 }).map((_, col) => (
              <rect
                key={`${row}-${col}`}
                x={26 + col * 12.8 + (row % 2) * 3}
                y={53 + row * 11}
                width="10"
                height="8"
                rx="2"
                fill="#fff"
                fillOpacity="0.85"
              />
            )),
          )}
          <rect x="60" y="97" width="80" height="6" rx="2" fill="#fff" fillOpacity="0.85" />
        </>
      );
    case "mouse":
      return (
        <>
          <rect x="72" y="20" width="56" height="112" rx="28" fill={accent} />
          <path d="M100 20v40" stroke="#0b0d12" strokeOpacity="0.25" />
          <rect x="96" y="34" width="8" height="16" rx="4" fill="#0b0d12" fillOpacity="0.7" />
          <path d="M72 60h56" stroke="#0b0d12" strokeOpacity="0.12" />
        </>
      );
    case "headphones":
      return (
        <>
          <path d="M50 92V74a50 50 0 0 1 100 0v18" fill="none" stroke="#0b0d12" strokeOpacity="0.18" strokeWidth="11" strokeLinecap="round" />
          <path d="M50 92V74a50 50 0 0 1 100 0v18" fill="none" stroke={accent} strokeOpacity="1" strokeWidth="9" strokeLinecap="round" />
          <rect x="36" y="80" width="30" height="48" rx="13" fill={accent} />
          <rect x="134" y="80" width="30" height="48" rx="13" fill={accent} />
          <rect x="44" y="88" width="14" height="32" rx="7" fill="#0b0d12" fillOpacity="0.55" />
          <rect x="142" y="88" width="14" height="32" rx="7" fill="#0b0d12" fillOpacity="0.55" />
        </>
      );
    case "charger":
      return (
        <>
          <rect x="88" y="22" width="6" height="20" rx="2" fill="#9ca3af" />
          <rect x="106" y="22" width="6" height="20" rx="2" fill="#9ca3af" />
          <rect x="66" y="40" width="68" height="76" rx="14" fill={accent} />
          <rect x="84" y="88" width="14" height="6" rx="3" fill="#0b0d12" fillOpacity="0.75" />
          <rect x="102" y="88" width="14" height="6" rx="3" fill="#0b0d12" fillOpacity="0.75" />
          <rect x="88" y="100" width="24" height="5" rx="1" fill="#0b0d12" fillOpacity="0.5" />
          <path d="M100 116c0 14-12 12-12 26" fill="none" stroke="#0b0d12" strokeOpacity="0.5" strokeWidth="3" />
        </>
      );
    case "ssd":
      return (
        <>
          <rect x="22" y="52" width="156" height="46" rx="4" fill="#16181f" />
          {Array.from({ length: 10 }).map((_, i) => (
            <rect key={i} x="24" y={55 + i * 4} width="7" height="2.5" fill="#d4a017" />
          ))}
          <rect x="44" y="60" width="38" height="30" rx="2" fill={accent} />
          <rect x="90" y="60" width="38" height="30" rx="2" fill={accent} />
          <rect x="136" y="64" width="24" height="22" rx="2" fill="#2b2f3a" />
          <circle cx="170" cy="75" r="4" fill="none" stroke="#9ca3af" strokeOpacity="1" />
        </>
      );
  }
}
