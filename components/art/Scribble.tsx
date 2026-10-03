"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type Pt = [number, number];

function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** A smooth curve through the points (Catmull-Rom as cubic Béziers). */
function smooth(pts: Pt[]) {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/** A loop drawn round a phrase the way a hand does it: a little tilted, not
 *  quite closed, and wider on the second pass than the first. */
function loop(w: number, h: number, seed: number): string {
  const r = rng(seed);
  const cx = w / 2;
  const cy = h / 2 + h * 0.05;
  const rx = w / 2 + Math.min(18, w * 0.06);
  const ry = h / 2 + Math.min(5, h * 0.09);
  const start = Math.PI * (0.78 + r() * 0.12);
  const sweep = Math.PI * 2 + 0.5 + r() * 0.35;
  const tilt = (-2.5 - r() * 2.5) * (Math.PI / 180);
  const ph1 = r() * 6;
  const ph2 = r() * 6;
  const pts: Pt[] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const a = start + sweep * k;
    const wob = 1 + 0.028 * Math.sin(a * 2.3 + ph1) + 0.016 * Math.sin(a * 4.7 + ph2);
    const grow = 0.97 + 0.08 * k;
    const x = rx * Math.cos(a) * wob * grow;
    const y = ry * Math.sin(a) * wob * grow;
    pts.push([cx + x * Math.cos(tilt) - y * Math.sin(tilt), cy + x * Math.sin(tilt) + y * Math.cos(tilt)]);
  }
  return smooth(pts);
}

/** A quick underline: dips, rises, and flicks back at the end. */
function swash(w: number, h: number, seed: number): string {
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const x = w * (0.02 + 0.94 * t);
    const y = h * (0.62 - 0.34 * t + 0.14 * Math.sin(t * Math.PI * 1.15 + 0.3) + (r() - 0.5) * 0.04);
    pts.push([x, y]);
  }
  pts.push([w * 0.975, h * 0.16], [w * 0.9, h * 0.3]);
  return smooth(pts);
}

type Props = {
  kind: "loop" | "swash";
  seed?: number;
  /** Positioning relative to the host, which must be `relative`. */
  className?: string;
  /** Scroll range over which the stroke is drawn. */
  start?: string;
  end?: string;
};

/** A brass pen mark around or under a piece of text, drawn with the scroll
 *  and taken back when the reader scrolls up. */
export function Scribble({ kind, seed = 7, className = "", start = "top 78%", end = "top 48%" }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const path = useRef<SVGPathElement>(null);

  useEffect(() => {
    const el = svg.current;
    const p = path.current;
    if (!el || !p) return;
    const host = el.parentElement ?? el;

    const draw = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      el.setAttribute("viewBox", `0 0 ${w} ${h}`);
      p.setAttribute("d", kind === "loop" ? loop(w, h, seed) : swash(w, h, seed));
    };
    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(el);

    let tween: gsap.core.Tween | null = null;
    if (document.documentElement.classList.contains("motion")) {
      tween = gsap.fromTo(
        p,
        // A dash of the whole length followed by a long gap: at 1.05 even the
        // round cap sits off the end, so nothing shows until drawing begins.
        { strokeDashoffset: 1.05 },
        {
          strokeDashoffset: 0,
          ease: "power1.inOut",
          scrollTrigger: { trigger: host, start, end, scrub: 0.8 },
        },
      );
    } else {
      p.style.strokeDashoffset = "0";
    }

    return () => {
      ro.disconnect();
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [kind, seed, start, end]);

  return (
    <svg
      ref={svg}
      aria-hidden="true"
      className={`scribble pointer-events-none absolute overflow-visible ${className}`}
    >
      <path
        ref={path}
        pathLength={1}
        fill="none"
        stroke="var(--brass)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1 3"
        strokeDashoffset="1.05"
      />
    </svg>
  );
}
