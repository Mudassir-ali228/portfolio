"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { profile } from "@/lib/content";
import { scrollToTarget } from "./motion/MotionProvider";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* Private browsing: the choice just will not persist. */
  }
}

/** Names the theme it switches to. Both labels are rendered and CSS shows
 *  one, so the right word is there from the first paint. */
function ThemeButton({ className = "", tabIndex }: { className?: string; tabIndex?: number }) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Switch colour theme"
      tabIndex={tabIndex}
      className={className}
    >
      <span className="when-dark">Light theme</span>
      <span className="when-light">Dark theme</span>
    </button>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  // Lifts onto a ground once the page moves; hides while reading down and
  // comes back as soon as the reader scrolls up.
  useEffect(() => {
    let raf = 0;
    let last = window.scrollY;
    const apply = () => {
      raf = 0;
      const y = window.scrollY;
      const h = headerRef.current;
      if (!h) return;
      h.classList.toggle("is-lifted", y > 16);
      if (y > 240 && y > last + 4) h.classList.add("is-hidden");
      else if (y < last - 4 || y <= 240) h.classList.remove("is-hidden");
      last = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* On the home page, glide to the section instead of jumping. */
  const go = (href: string) => (e: MouseEvent) => {
    setOpen(false);
    if (pathname !== "/") return;
    e.preventDefault();
    const hash = href.slice(1);
    history.replaceState(null, "", hash);
    scrollToTarget(hash);
  };

  const item = "quiet-link block text-[0.875rem] leading-6";

  return (
    <>
      <header ref={headerRef} className="site-nav fixed inset-x-0 top-0 z-50">
        <nav className="shell flex h-16 items-center justify-between" aria-label="Main">
          <Link
            href="/"
            onClick={pathname === "/" ? (e) => (e.preventDefault(), scrollToTarget(0)) : undefined}
            className="display text-[1.25rem] leading-none tracking-[-0.01em]"
          >
            {profile.name}
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <ul className="flex items-center gap-8">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={go(l.href)} className={item}>
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={profile.cv} target="_blank" rel="noopener noreferrer" className={item}>
                  CV
                </a>
              </li>
            </ul>
            <span className="h-4 w-px bg-line" aria-hidden="true" />
            <ThemeButton className={item} />
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="quiet-link text-[0.875rem] md:hidden"
          >
            Menu
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={`mobile-menu fixed inset-0 z-[70] flex flex-col bg-bg md:hidden ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="shell flex h-16 shrink-0 items-center justify-between">
          <span className="display text-[1.25rem] leading-none">{profile.name}</span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            tabIndex={open ? 0 : -1}
            className="quiet-link text-[0.875rem]"
          >
            Close
          </button>
        </div>

        <ul className="shell mt-8 flex flex-col border-t border-line">
          {links.map((l, i) => (
            <li key={l.href} className="overflow-hidden border-b border-line">
              <Link
                href={l.href}
                onClick={go(l.href)}
                tabIndex={open ? 0 : -1}
                className="menu-rise display block py-5 text-[2.5rem]"
                style={{ "--i": i } as CSSProperties}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="shell mt-8 flex flex-wrap gap-x-7 gap-y-3 text-[0.9375rem]">
          <a
            href={profile.cv}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            className="text-link"
          >
            CV
          </a>
          <a href={`mailto:${profile.email}`} tabIndex={open ? 0 : -1} className="text-link">
            Email
          </a>
          <ThemeButton className="text-link" tabIndex={open ? 0 : -1} />
        </div>
      </div>
    </>
  );
}
