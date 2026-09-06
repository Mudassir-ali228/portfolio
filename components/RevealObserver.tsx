"use client";

import { useEffect } from "react";

/**
 * One observer for every reveal on the page. It watches for elements
 * carrying `data-reveal`, adds `.is-in` when they arrive, and stops watching
 * them — reveals happen once, so there is nothing to keep tracking.
 *
 * A MutationObserver picks up anything React mounts later (route changes),
 * so this can live once in the layout and be forgotten about.
 */
export function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced) {
      // Nothing should be hidden waiting for a transition that will not run.
      document.documentElement.classList.remove("reveal-ready");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          // An attribute, not a class: React owns `className` and will
          // overwrite it on the next re-render, taking the reveal with it.
          entry.target.setAttribute("data-in", "");
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    const observeAll = (root: ParentNode) => {
      root.querySelectorAll("[data-reveal]:not([data-in])").forEach((el) => io.observe(el));
    };

    observeAll(document);

    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) {
          if (node.nodeType !== 1) continue;
          const el = node as Element;
          if (el.hasAttribute("data-reveal")) io.observe(el);
          observeAll(el);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
