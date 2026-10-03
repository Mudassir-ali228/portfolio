"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SEEDS } from "@/lib/harmonograph";
import { TREE_SEEDS } from "@/lib/art";
import { captionFor, makePainter, type FigureKind, type Painter } from "@/lib/painters";

gsap.registerPlugin(ScrollTrigger);

/** Seeds already on the page, per kind, so two random figures never match. */
const onScreen: Record<string, Set<number>> = { tree: new Set(), harmonograph: new Set() };

/** A seed for `kind` that is not already on screen. */
export function freshSeed(kind: "tree" | "harmonograph", avoid?: number) {
  const all = kind === "tree" ? TREE_SEEDS : SEEDS;
  const pool = all.filter((s) => s !== avoid && !onScreen[kind].has(s));
  return pool[Math.floor(Math.random() * pool.length)] ?? all[0];
}
export function claimSeed(kind: "tree" | "harmonograph", seed: number) {
  onScreen[kind].add(seed);
  return () => {
    onScreen[kind].delete(seed);
  };
}

type Props = {
  /** "Fig. 1" and so on. */
  label: string;
  kind: FigureKind;
  /** Fixed seed. Leave it out on a tree or harmonograph for a new one every visit. */
  seed?: number;
  depth?: number;
  order?: number;
  count?: number;
  note?: string;
  /** Draw on page load, or when scrolled into view (and undraw on the way back). */
  when?: "load" | "view";
  delay?: number;
  duration?: number;
  className?: string;
  captionClassName?: string;
  /** Put the caption inside the frame, bottom right. */
  captionInside?: boolean;
  /** Degrees the drawing turns as its section scrolls away. */
  spin?: number;
  /** How far the drawing pulls back (0 to 1) as its section scrolls away. */
  retract?: number;
  /** Offer a button that swaps in a new random drawing. */
  regrow?: string;
};

export function Figure({
  label,
  kind,
  seed,
  depth,
  order,
  count,
  note,
  when = "view",
  delay = 0,
  duration,
  className = "",
  captionClassName = "",
  captionInside = false,
  spin,
  retract,
  regrow,
}: Props) {
  const box = useRef<HTMLDivElement>(null);
  const base = useRef<HTMLCanvasElement>(null);
  const live = useRef<HTMLCanvasElement>(null);
  const tip = useRef<HTMLSpanElement>(null);
  const random = seed === undefined && (kind === "tree" || kind === "harmonograph");
  const [chosen, setChosen] = useState<number | undefined>(random ? undefined : seed);
  const [again, setAgain] = useState(false);

  useEffect(() => {
    if (!random) return;
    const k = kind as "tree" | "harmonograph";
    const pick = freshSeed(k);
    setChosen(pick);
  }, [random, kind]);

  useEffect(() => {
    if (!random || chosen === undefined) return;
    return claimSeed(kind as "tree" | "harmonograph", chosen);
  }, [random, kind, chosen]);

  useEffect(() => {
    const el = box.current;
    if ((random && chosen === undefined) || !el || !base.current || !live.current) return;
    const painter: Painter = makePainter({ kind, seed: chosen, depth, order, count }, base.current, live.current);
    const state = { load: 0, back: 1 };

    const render = () => {
      const p = state.load * state.back;
      painter.draw(p);
      const pen = painter.pen?.();
      if (tip.current) {
        if (pen) tip.current.style.transform = `translate(${pen.x}px, ${pen.y}px)`;
        tip.current.style.opacity = pen && p > 0 && p < 1 ? "1" : "0";
      }
    };

    painter.fit(el.clientWidth);
    const motion = document.documentElement.classList.contains("motion");
    let tween: gsap.core.Tween | null = null;
    const triggers: ScrollTrigger[] = [];

    if (!motion) {
      state.load = 1;
      render();
    } else {
      tween = gsap.to(state, {
        load: 1,
        duration: duration ?? (kind === "tree" ? 2.6 : 3.6),
        delay: again ? 0 : when === "load" ? delay + (document.documentElement.classList.contains("arriving") ? 0.75 : 0) : 0,
        ease: kind === "tree" ? "power2.out" : "power1.inOut",
        paused: when === "view",
        onUpdate: render,
      });
      if (when === "view") {
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: "top 85%",
            // Undraws faster than it draws: rewinding should feel like rewinding.
            onEnter: () => tween?.timeScale(1).play(),
            onLeaveBack: () => tween?.timeScale(2.4).reverse(),
          }),
        );
      }
      if (retract !== undefined) {
        triggers.push(
          ScrollTrigger.create({
            trigger: el.closest("section") ?? el,
            start: "top top",
            end: "bottom top",
            scrub: 0.6,
            onUpdate: (self) => {
              state.back = 1 - (1 - retract) * self.progress;
              render();
            },
          }),
        );
      }
    }

    // Number labels need the web fonts; draw again once they are in.
    document.fonts?.ready.then(render);

    let size = el.clientWidth;
    const ro = new ResizeObserver(() => {
      if (el.clientWidth === size) return;
      size = el.clientWidth;
      painter.fit(size);
      render();
    });
    ro.observe(el);
    const mo = new MutationObserver(() => {
      painter.fit(size);
      render();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    return () => {
      tween?.kill();
      triggers.forEach((t) => t.kill());
      ro.disconnect();
      mo.disconnect();
    };
  }, [random, chosen, again, kind, depth, order, count, when, delay, duration, retract]);

  const caption = captionFor({ kind, seed: chosen, depth, order, count });

  return (
    <figure className={`harmonograph ${className}`}>
      <div
        ref={box}
        aria-hidden="true"
        className="relative aspect-square w-full"
        {...(spin ? { "data-a": "drift", "data-rot": String(spin) } : {})}
      >
        <canvas ref={base} className="absolute inset-0 h-full w-full" />
        <canvas ref={live} className="absolute inset-0 h-full w-full" />
        <span ref={tip} className="pen-tip" />
      </div>
      <figcaption
        className={`${captionInside ? "absolute bottom-0 right-0 text-right" : "mt-3"} ${captionClassName}`}
        style={{ "--d": `${delay + 1.4}s` } as CSSProperties}
      >
        <span className="label block">
          {label}
          <span className="mx-2 text-line">·</span>
          {caption}
        </span>
        {note ? <span className="mt-1 block text-[0.8125rem] text-faint [text-wrap:balance]">{note}</span> : null}
        {regrow && random ? (
          <button
            type="button"
            onClick={() => {
              setAgain(true);
              setChosen((cur) => freshSeed(kind as "tree" | "harmonograph", cur));
            }}
            className="text-link pointer-events-auto mt-2 text-[0.8125rem]"
          >
            {regrow}
          </button>
        ) : null}
      </figcaption>
    </figure>
  );
}
