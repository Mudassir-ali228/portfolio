import Link from "next/link";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <main id="main" className="shell flex min-h-[70svh] flex-col justify-center py-40">
        <p className="label">404</p>
        <h1 className="display mt-5 text-[clamp(2.75rem,8vw,6rem)]">Page not found</h1>
        <p className="lede mt-6 max-w-lg">This address does not match any page on the site.</p>
        <p className="mt-10 text-[0.9375rem]">
          <Link href="/" className="text-link">
            Back to the home page
          </Link>
        </p>
      </main>
      <Footer />
    </>
  );
}
