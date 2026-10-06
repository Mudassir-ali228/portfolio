"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TreePainter } from "@/lib/painters";
import { LEVEL, LEVELS, TRUNK } from "@/lib/intro";
import { claimSeed, freshSeed } from "./Figure";

gsap.registerPlugin(ScrollTrigger);

const GROW = LEVEL * LEVELS;
/** How far the tree draws back into its trunk as the hero scrolls away. */
const RETRACT = 0.18;

/**
 * How far the hero's CSS entrances have run, in seconds, read from a
 * do-nothing animation on the section. Negative while the page curtain is
 * still up. However late the script arrives, the tree joins the type at the
 * moment it has reached instead of starting over.
 */
function clock(section: Element | null) {
  const a = section
    ?.getAnimations?.()
    .find((x) => (x as CSSAnimation).animationName === "hero-clock");
  if (!a || typeof a.currentTime !== "number") return 0;
  return (a.currentTime - Number(a.effect?.getComputedTiming().delay ?? 0)) / 1000;
}

/**
 * Fig. 1: the recursive tree the hero stands on. It is laid out by the hero's
 * grid as three pieces: the drawing, the ground it grows from, and the
 * caption. On first load a seed lands on the ground, the ground draws out from
 * it, and the tree grows level by level in step with the name.
 */
export function HeroTree() {
  const wrap = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const seedDot = useRef<HTMLSpanElement>(null);
  const ground = useRef<HTMLSpanElement>(null);
  const wet = useRef<HTMLSpanElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const state = useRef({ grow: 0, back: 1 });
  const render = useRef<() => void>(() => {});
  const intro = useRef(true);
  const busy = useRef(false);
  const [seed, setSeed] = useState<number>();

  useEffect(() => setSeed(freshSeed("tree")), []);
  useEffect(() => (seed === undefined ? undefined : claimSeed("tree", seed)), [seed]);

  useEffect(() => {
    const el = box.current;
    if (seed === undefined || !el || !canvas.current) return;
    const painter = new TreePainter(canvas.current, seed);
    const s = state.current;
    const motion = document.documentElement.classList.contains("motion");

    render.current = () => {
      painter.draw(s.grow * s.back);
      const r = painter.readout();
      const text = `Depth ${r.Depth} · ${r.Branches} ${r.n === "1" ? "branch" : "branches"}`;
      if (count.current && count.current.textContent !== text) count.current.textContent = text;
    };

    // Sit the trunk exactly on the ground line, and put the seed under it.
    const place = () => {
      const size = el.clientWidth;
      painter.fit(size);
      const root = painter.root();
      el.style.transform = `translate3d(0, ${(size - root.y).toFixed(2)}px, 0)`;
      if (seedDot.current) {
        seedDot.current.style.left = `${root.x}px`;
        seedDot.current.style.top = `${root.y}px`;
      }
      render.current();
      return root;
    };
    const root = place();

    let size = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === size) return;
      size = el.clientWidth;
      place();
    });
    ro.observe(el);
    const mo = new MutationObserver(() => place());
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    const tweens: (gsap.core.Animation | null)[] = [];
    if (!motion) {
      s.grow = 1;
      render.current();
    } else if (intro.current) {
      // The ground draws outward from the seed, both ways at once.
      const g = ground.current?.getBoundingClientRect();
      const b = el.getBoundingClientRect();
      const origin = g && g.width ? ((b.left + root.x - g.left) / g.width) * 100 : 50;
      const lines = [ground.current, wet.current];
      gsap.set(lines, { transformOrigin: `${origin}% 50%` });

      const tl = gsap
        .timeline({ paused: true })
        .fromTo(seedDot.current, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: "expo.out" }, 0.1)
        .fromTo(lines, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: "expo.inOut" }, 0.2)
        .fromTo(s, { grow: 0 }, { grow: 1, duration: GROW, ease: "none", onUpdate: () => render.current() }, TRUNK)
        // Brass while it is being drawn, then the ink dries to a hairline.
        .to(wet.current, { autoAlpha: 0, duration: 1.6, ease: "power2.out" }, TRUNK + GROW - 0.2)
        .to(seedDot.current, { scale: 0.55, duration: 1.2, ease: "expo.out" }, TRUNK + GROW - 0.2);

      const t = clock(wrap.current?.closest("section") ?? null);
      tl.time(Math.max(0, t));
      tweens.push(tl, gsap.delayedCall(Math.max(0, -t), () => tl.play()));
    } else {
      gsap.set(seedDot.current, { scale: 0.55, autoAlpha: 1 });
      tweens.push(
        gsap.fromTo(s, { grow: 0 }, { grow: 1, duration: GROW, ease: "power1.out", onUpdate: () => render.current() }),
      );
    }

    return () => {
      tweens.forEach((t) => t?.kill());
      ro.disconnect();
      mo.disconnect();
    };
  }, [seed]);

  // As the hero leaves, the tree draws back toward its trunk; scrolling back
  // up grows it out again.
  useEffect(() => {
    const section = wrap.current?.closest("section");
    if (!section || !document.documentElement.classList.contains("motion")) return;
    const st = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom top",
      scrub: 0.6,
      onUpdate: (self) => {
        state.current.back = 1 - (1 - RETRACT) * self.progress;
        render.current();
      },
    });
    return () => st.kill();
  }, []);

  /** Draw the tree back into the ground, then grow a different one. */
  const regrow = () => {
    if (busy.current) return;
    intro.current = false;
    const next = () => {
      busy.current = false;
      setSeed((cur) => freshSeed("tree", cur));
    };
    if (!document.documentElement.classList.contains("motion")) return next();
    busy.current = true;
    const s = state.current;
    gsap.killTweensOf(s);
    gsap.to(s, { grow: 0, duration: 0.55, ease: "power2.in", onUpdate: () => render.current(), onComplete: next });
  };

  return (
    <>
      <div className="harmonograph load-fade z-10 col-start-1 row-start-4 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 pt-4 lg:col-start-9 lg:col-end-13 lg:row-start-3 lg:block lg:self-end lg:justify-self-end lg:pb-16 lg:pt-0 lg:text-right" style={{ "--d": "0.6s" } as CSSProperties}>
        <p className="label whitespace-nowrap leading-relaxed">
          Fig. 1<span className="mx-2 text-line">·</span>Recursive tree
          <span ref={count} className="block tabular-nums text-muted">
            Depth 0 · 0 branches
          </span>
        </p>
        <p className="mt-2 hidden max-w-[16rem] text-[0.8125rem] leading-snug text-faint [text-wrap:balance] lg:ml-auto lg:block">
          Each branch splits in two until nine levels deep. A new tree on every visit.
        </p>
        <button type="button" onClick={regrow} className="text-link shrink-0 text-[0.8125rem] lg:mt-2">
          Grow another
        </button>
      </div>

      <div
        ref={wrap}
        aria-hidden="true"
        className="harmonograph pointer-events-none relative z-0 col-start-1 row-start-2 row-end-4 [container-type:size] lg:col-start-6 lg:col-end-13 lg:row-start-1 lg:row-end-5"
      >
        <div
          ref={box}
          className="absolute bottom-0 left-1/2 aspect-square w-[min(124cqw,100cqh)] -translate-x-1/2 lg:left-auto lg:right-0 lg:w-[min(100cqw,100cqh,46rem)] lg:translate-x-0"
        >
          <canvas ref={canvas} className="absolute inset-0 h-full w-full" />
          <span ref={seedDot} className="hero-seed" />
        </div>
      </div>

      <div className="relative col-start-1 row-start-3 h-px self-end lg:col-end-13 lg:row-start-4">
        <span ref={ground} className="hero-ground absolute inset-0 bg-line" />
        <span ref={wet} className="hero-wet absolute inset-0 bg-brass" />
      </div>
    </>
  );
}
