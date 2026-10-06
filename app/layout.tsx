import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { profile } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { Nav } from "@/components/Nav";
import "lenis/dist/lenis.css";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  variable: "--font-fraunces",
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const description =
  "Software engineer in Lahore, Pakistan. Backend services, web interfaces and mobile apps.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} · ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description,
  openGraph: {
    title: `${profile.name} · ${profile.role}`,
    description,
    type: "profile",
    siteName: profile.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${profile.name} · ${profile.role}`,
    description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0a09" },
    { media: "(prefers-color-scheme: light)", color: "#f4efe6" },
  ],
};

/* Before first paint: set the theme so neither flashes, and opt in to scroll
   animations unless the visitor prefers reduced motion. If the animation code
   has not started within four seconds, drop the opt-in so nothing stays
   hidden waiting for it. Scroll restoration starts off so a reload opens at
   the top (MotionProvider hands it back once the page has loaded). */
const headScript = `(function(){var d=document.documentElement;d.classList.add("js");try{history.scrollRestoration="manual";}catch(e){}try{var s=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: light)").matches;d.dataset.theme=s||(m?"light":"dark");}catch(e){d.dataset.theme="dark";}try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.classList.add("motion");setTimeout(function(){if(!d.classList.contains("motion-ready"))d.classList.remove("motion");},4000);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${fraunces.variable} ${instrument.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: headScript }} />
      </head>
      {/* suppressHydrationWarning: browser extensions stamp attributes onto
          body before React loads. */}
      <body suppressHydrationWarning>
        <a
          href="#main"
          className="skip-link border border-brass bg-bg px-4 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink"
        >
          Skip to content
        </a>
        <MotionProvider />
        <PageTransition />
        {/* The header lives here, not in each page: it persists across routes,
            and Next can scroll a new page to its first real element. */}
        <Nav />
        {children}
      </body>
    </html>
  );
}
