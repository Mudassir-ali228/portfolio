/**
 * Canonical origin, used for the canonical URL, the sitemap and robots.txt.
 *
 * Order matters. An explicit NEXT_PUBLIC_SITE_URL always wins — set it in the
 * Vercel project once a real domain is attached. Failing that, Vercel exposes
 * the project's own production hostname at build time, which is a great deal
 * better than a hard-coded domain nobody owns: an unowned canonical URL points
 * search engines and every social preview at a site that does not exist.
 */
const explicit = process.env.NEXT_PUBLIC_SITE_URL;
const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const SITE_URL = (
  explicit ?? (vercel ? `https://${vercel}` : "http://localhost:4321")
).replace(/\/$/, "");
