/** Only allow same-site relative redirects (blocks "//evil.com" and absolute URLs). */
export function safeNext(next: string | null | undefined, fallback = "/") {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : fallback;
}
