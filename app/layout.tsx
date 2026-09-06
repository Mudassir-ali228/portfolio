import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { profile } from "@/lib/content";
import { SITE_URL } from "@/lib/site";
import { RevealObserver } from "@/components/RevealObserver";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  axes: ["WONK", "opsz"],
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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s — ${profile.name}`,
  },
  description:
    "Software engineer. Production platforms where the details are load-bearing, and game engines where they are the whole point. Lahore, Pakistan.",
  openGraph: {
    title: `${profile.name} — ${profile.role}`,
    description:
      "Production platforms where the details are load-bearing, and game engines where they are the whole point.",
    type: "profile",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b0a09" },
    { media: "(prefers-color-scheme: light)", color: "#f4efe6" },
  ],
};

/* Set the theme before first paint so a light-mode visitor never sees a
   black flash, and vice versa. */
const themeScript = `(function(){var d=document.documentElement;try{var s=localStorage.getItem("theme");var m=window.matchMedia("(prefers-color-scheme: light)").matches;d.dataset.theme=s||(m?"light":"dark");}catch(e){d.dataset.theme="dark";}
/* Reveals only hide themselves once we know JS is running to un-hide them. */
try{if(!window.matchMedia("(prefers-reduced-motion: reduce)").matches)d.classList.add("reveal-ready");}catch(e){}})();`;

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body suppressHydrationWarning>
        <RevealObserver />
        <a
          href="#main"
          className="skip-link rounded-full border border-brass bg-bg px-5 py-2.5 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
