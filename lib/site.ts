/**
 * Canonical origin for canonical URLs, the sitemap and robots.txt.
 *
 * NEXT_PUBLIC_SITE_URL wins when set: set it in Vercel once a custom domain
 * is attached. Otherwise Vercel's production hostname is used, and local
 * builds fall back to localhost.
 */
const explicit = process.env.NEXT_PUBLIC_SITE_URL;
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  explicit ?? (vercel ? `https://${vercel}` : "http://localhost:4321")
).replace(/\/$/, "");
