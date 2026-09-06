import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main id="main" className="shell flex min-h-[70svh] flex-col justify-center py-40">
        <p className="label">404</p>
        <h1 className="display mt-5 text-[clamp(2.6rem,8vw,6rem)]">
          Nothing here<span className="text-brass">.</span>
        </h1>
        <p className="prose-lede mt-6 max-w-lg">
          That page does not exist — or it did once and the route moved.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex h-12 w-fit items-center gap-3 rounded-full border border-line px-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors duration-500 hover:border-brass hover:text-ink"
        >
          ← Back to the work
        </Link>
      </main>
      <Footer />
    </>
  );
}
