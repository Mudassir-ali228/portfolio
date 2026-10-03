"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

/**
 * A short curtain between pages. Internal links are caught before Next's own
 * handler: the curtain rises, the route changes underneath it, and it lifts
 * off the new page while that page's entrance plays. Back and forward, new
 * tabs, files and same-page links are left alone.
 */
export function PageTransition() {
  const router = useRouter();
  const pathname = usePathname();
  const veil = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLParagraphElement>(null);
  const waiting = useRef<string | null>(null);
  const failsafe = useRef<number>(0);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (!document.documentElement.classList.contains("motion")) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (/\.[a-z0-9]+$/i.test(url.pathname)) return; // the CV and other files

      e.preventDefault();
      const el = veil.current;
      if (!el || waiting.current) return;
      const href = url.pathname + url.search + url.hash;
      waiting.current = url.pathname;
      if (title.current) title.current.textContent = a.dataset.title ?? "";

      gsap.killTweensOf([el, title.current]);
      gsap.set(el, { visibility: "visible", clipPath: "inset(100% 0% 0% 0%)" });
      gsap.set(title.current, { yPercent: 60, opacity: 0 });
      gsap
        .timeline({
          onComplete: () => {
            // The new page's entrances wait for the curtain to lift.
            document.documentElement.classList.add("arriving");
            router.push(href);
          },
        })
        .to(el, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.6, ease: "expo.inOut" })
        .to(title.current, { yPercent: 0, opacity: 1, duration: 0.5, ease: "expo.out" }, 0.25);

      window.clearTimeout(failsafe.current);
      failsafe.current = window.setTimeout(lift, 5000);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  function lift() {
    const el = veil.current;
    if (!el) return;
    waiting.current = null;
    window.clearTimeout(failsafe.current);
    gsap
      .timeline({
        delay: 0.1,
        onComplete: () => {
          gsap.set(el, { visibility: "hidden" });
          window.setTimeout(() => document.documentElement.classList.remove("arriving"), 3500);
        },
      })
      .to(title.current, { yPercent: -40, opacity: 0, duration: 0.35, ease: "power2.in" })
      .to(el, { clipPath: "inset(0% 0% 100% 0%)", duration: 0.75, ease: "expo.inOut" }, 0.1);
  }

  useEffect(() => {
    if (waiting.current && waiting.current === pathname) lift();
  }, [pathname]);

  return (
    <div
      ref={veil}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-surface"
      style={{ visibility: "hidden" }}
    >
      <p ref={title} className="display px-6 text-center text-[clamp(2.25rem,6vw,5rem)]" />
    </div>
  );
}
