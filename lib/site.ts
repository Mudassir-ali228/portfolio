/** Canonical origin. Set NEXT_PUBLIC_SITE_URL in Vercel once a domain is attached. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://mudassirali.dev"
).replace(/\/$/, "");
