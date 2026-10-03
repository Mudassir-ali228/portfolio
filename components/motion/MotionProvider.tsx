"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

let lenis: Lenis | null = null;

/** Smooth-scroll to a selector, element or offset; native if motion is off. */
export function scrollToTarget(target: string | number | HTMLElement, offset = 0) {
  if (lenis) {
    lenis.scrollTo(target, { offset, duration: 1.4, easing: (t) => 1 - Math.pow(1 - t, 4) });
    return;
  }
  const el = typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  const top = typeof el === "number" ? el : el ? el.getBoundingClientRect().top + window.scrollY : 0;
  window.scrollTo({ top: top + offset });
}

const EASE = "expo.out";

/**
 * Every animation on a page is declared in markup with `data-a` and built
 * here, so the pages themselves stay server-rendered. Hidden starting states
 * live in globals.css under `html.motion`, which is only set when the visitor
 * has not asked for reduced motion.
 *
 *   chars | words   pieces rise from behind their masks
 *   lines           a paragraph rises line by line (GSAP SplitText, re-split
 *                   whenever a resize reflows it)
 *   fade            fades and lifts
 *   rule            a hairline draws from the left
 *   clip            an image frame wipes open from the bottom
 *   stagger         children fade in one after another
 *   scrub           words brighten as the paragraph scrolls through
 *   drift           moves with scroll across its section (data-x, data-y, data-rot)
 *   parallax        an image shifts inside its frame (data-speed)
 *
 * `data-d` is a delay. Scroll reveals reverse when scrolled back past.
 * Entrances on page load are CSS (see `.load-*` in globals.css) so they start
 * on the first frame instead of after hydration.
 */
function build(scope: HTMLElement) {
  scope.querySelectorAll<HTMLElement>("[data-a]").forEach((el) => {
    const type = el.dataset.a;
    const delay = parseFloat(el.dataset.d ?? "0");
    // Plays on the way down; runs backwards when the reader scrolls back up
    // past the point where it started, so the page rewinds as well as plays.
    const onScroll = {
      trigger: el,
      start: el.dataset.start ?? "top 90%",
      toggleActions: "play none none reverse",
    };

    switch (type) {
      case "chars":
      case "words": {
        const pieces = el.querySelectorAll(".split-c");
        // y: 0 matters. GSAP reads the CSS starting transform as a pixel
        // offset, and without resetting it the text would stop short of home.
        gsap.fromTo(
          pieces,
          { yPercent: 118, y: 0 },
          {
            yPercent: 0,
            duration: type === "chars" ? 1.2 : 1.05,
            ease: EASE,
            stagger: type === "chars" ? 0.03 : 0.022,
            delay,
            scrollTrigger: onScroll,
          },
        );
        break;
      }
      case "lines":
        SplitText.create(el, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          onSplit(self) {
            el.setAttribute("data-split", "");
            return gsap.fromTo(
              self.lines,
              { yPercent: 105 },
              { yPercent: 0, duration: 1.1, ease: EASE, stagger: 0.08, delay, scrollTrigger: onScroll },
            );
          },
        });
        break;
      case "fade":
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 26 },
          { autoAlpha: 1, y: 0, duration: 1.2, ease: EASE, delay, scrollTrigger: onScroll },
        );
        break;
      case "rule":
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "0% 50%" },
          { scaleX: 1, duration: 1.5, ease: "expo.inOut", delay, scrollTrigger: onScroll },
        );
        break;
      case "clip": {
        const img = el.hasAttribute("data-noscale") ? null : el.querySelector("img");
        const tl = gsap.timeline({ delay, scrollTrigger: onScroll });
        tl.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "expo.inOut" },
        );
        if (img) tl.fromTo(img, { scale: 1.22 }, { scale: 1, duration: 2, ease: EASE }, 0.1);
        break;
      }
      case "stagger":
        gsap.fromTo(
          el.children,
          { autoAlpha: 0, y: 22 },
          { autoAlpha: 1, y: 0, duration: 1.1, ease: EASE, stagger: 0.08, delay, scrollTrigger: onScroll },
        );
        break;
      case "scrub":
        gsap.fromTo(
          el.querySelectorAll(".scrub-w"),
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: el, start: "top 82%", end: "bottom 48%", scrub: 0.4 },
          },
        );
        break;
      case "drift":
        gsap.to(el, {
          xPercent: parseFloat(el.dataset.x ?? "0"),
          yPercent: parseFloat(el.dataset.y ?? "0"),
          rotate: parseFloat(el.dataset.rot ?? "0"),
          ease: "none",
          scrollTrigger: {
            trigger: el.closest("section") ?? el,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
        break;
      case "parallax": {
        const speed = parseFloat(el.dataset.speed ?? "8");
        gsap.fromTo(
          el,
          { yPercent: -speed / 2 },
          {
            yPercent: speed / 2,
            ease: "none",
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
        break;
      }
    }
  });
}

export function MotionProvider() {
  const pathname = usePathname();

  // One Lenis instance for the life of the tab, driven by GSAP's clock so
  // ScrollTrigger and the smooth scroll never disagree about a frame.
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("motion")) return;

    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, stopInertiaOnNavigate: true });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  // Rebuild the page's animations on every route.
  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("motion")) return;

    let ctx: gsap.Context | null = null;
    try {
      ctx = gsap.context(() => build(document.body), document.body);
      root.classList.add("motion-ready");
    } catch {
      // Never leave content hidden behind an animation that failed to start.
      root.classList.remove("motion");
    }

    lenis?.resize();
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
