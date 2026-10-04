// Public config, read from .env.local (see .env.example). EXPO_PUBLIC_ values are bundled into the app.
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL!;
export const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

/** The Veyro website: serves product photos and the /api/checkout endpoint. */
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/** Product photos are stored as site-relative paths (/images/products/…). */
export function imageUrl(path: string | null | undefined) {
  if (!path) return null;
  return /^https?:\/\//.test(path) ? path : API_URL ? `${API_URL}${path}` : null;
}
