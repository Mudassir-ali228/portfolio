"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { profile } from "@/lib/content";

const links = [
  { href: "/#work", label: "Work" },
  { href: "/#profile", label: "Profile" },
  { href: "/#experience", label: "Track record" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const headerRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  /* One passive scroll listener, coalesced into a rAF, writing a transform
     and toggling one class. This was a framer-motion spring plus a second
     listener; on a long page that work happens on every scroll frame. */
  useEffect(() => {
    let raf = 0;
    let lifted = false;

    const apply = () => {
      raf = 0;
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
      const nowLifted = window.scrollY > 24;
      if (nowLifted !== lifted) {
        lifted = nowLifted;
        headerRef.current?.classList.toggle("is-lifted", nowLifted);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };

    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    setTheme((document.documentElement.dataset.theme as "dark" | "light") ?? "dark");
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  /* Light up whichever section is crossing the middle of the viewport. On a
     case-study page none of these exist and the observer watches nothing. */
  useEffect(() => {
    const sections = links
      .map((l) => document.querySelector<HTMLElement>(l.href.replace("/", "")))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        }
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private browsing — the choice just will not persist */
    }
    setTheme(next);
  }

  return (
    <>
      <div
        ref={barRef}
        className="fixed inset-x-0 top-0 z-[60] h-px origin-left bg-brass"
        style={{ transform: "scaleX(0)" }}
        aria-hidden="true"
      />

      <header ref={headerRef} className="site-nav fixed inset-x-0 top-0 z-50">
        <nav className="shell flex h-16 items-center justify-between md:h-20">
          <Link
            href="/"
            className="flex items-baseline gap-2.5"
            aria-label={`${profile.name} — home`}
          >
            <span className="display text-lg leading-none">
              {profile.first}
              <span className="text-brass">.</span>
            </span>
            <span className="label hidden sm:block">{profile.role}</span>
          </Link>

          <div className="flex items-center gap-1 md:gap-2">
            <ul className="mr-2 hidden items-center gap-1 lg:flex">
              {links.map((l) => {
                const isActive = active === l.href.replace("/", "");
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive ? "true" : undefined}
                      className={`relative block px-3 py-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] transition-colors duration-300 hover:text-ink ${
                        isActive ? "text-ink" : "text-muted"
                      }`}
                    >
                      {l.label}
                      <span
                        className={`absolute inset-x-3 bottom-1 h-px origin-left bg-brass transition-transform duration-500 ease-[var(--ease-out-expo)] ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              className="flex h-9 items-center gap-1.5 rounded-full border border-line px-3 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted transition-colors duration-300 hover:border-brass hover:text-ink"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-brass"
                aria-hidden="true"
              />
              {theme === "dark" ? "Dark" : "Light"}
            </button>

            <a
              href={profile.cv}
              target="_blank"
              rel="noreferrer noopener"
              className="hidden h-9 items-center rounded-full border border-brass bg-brass px-4 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-bg transition-opacity duration-300 hover:opacity-85 sm:flex"
            >
              CV
            </a>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="flex h-9 w-9 items-center justify-center lg:hidden"
            >
              <span className="relative block h-3 w-5" aria-hidden="true">
                <span className="absolute inset-x-0 top-0 h-px bg-ink" />
                <span className="absolute inset-x-0 bottom-0 h-px bg-ink" />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Always in the DOM, hidden with `visibility` so its links leave the
          tab order when closed. Cheaper than mounting and unmounting, and
          the transition is the compositor's job rather than JavaScript's. */}
      <div
        className={`mobile-menu fixed inset-0 z-[70] bg-bg lg:hidden ${
          open ? "is-open" : ""
        }`}
      >
        <div className="shell flex h-16 items-center justify-between">
          <span className="display text-lg">
            {profile.first}
            <span className="text-brass">.</span>
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            tabIndex={open ? 0 : -1}
            className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-muted"
          >
            Close
          </button>
        </div>

        <ul className="shell mt-6 flex flex-col">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                onClick={() => setOpen(false)}
                tabIndex={open ? 0 : -1}
                className="display block border-b border-line py-[min(4vh,1.4rem)] text-[clamp(2rem,9vw,3rem)]"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="shell mt-8 flex flex-wrap gap-3">
          <a
            href={profile.cv}
            target="_blank"
            rel="noreferrer noopener"
            tabIndex={open ? 0 : -1}
            className="inline-flex h-11 items-center rounded-full border border-brass bg-brass px-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-bg"
          >
            Open CV
          </a>
          <a
            href={`mailto:${profile.email}`}
            tabIndex={open ? 0 : -1}
            className="inline-flex h-11 items-center rounded-full border border-line px-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted"
          >
            Email
          </a>
        </div>
      </div>
    </>
  );
}
