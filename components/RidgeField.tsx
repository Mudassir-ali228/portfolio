"use client";

import { useEffect, useRef } from "react";

/**
 * Slow topographic ridges. It is the one ornamental thing on the page, and
 * it is here because the work it sits above is terrain generation and flow
 * telemetry — a gradient blob would have meant nothing.
 *
 * Each row is a polyline whose height is a sum of sines. Rows are filled with
 * the page background before they are stroked, so the row in front occludes
 * the one behind and the field reads as depth rather than noise.
 *
 * Performance notes, because the naive version of this ran at 5fps:
 *
 *  - The fill is a *band*, not a shape closed to the bottom of the canvas.
 *    Closing to the bottom made every row repaint most of the viewport —
 *    around seventeen full-screen fills per frame. A row can only ever be
 *    overlapped by the few rows immediately behind it, so a band a fixed
 *    multiple of the row gap deep occludes exactly as well for a fraction of
 *    the pixels.
 *  - It renders at 1x regardless of device pixel ratio. On a retina screen
 *    that is four times less fill for a low-contrast texture nobody inspects
 *    at the pixel level.
 *  - It runs at 30fps. The drift takes tens of seconds to cross the screen;
 *    the extra frames were invisible and cost half the budget.
 *  - It stops entirely when scrolled out of view or when the tab is hidden.
 */

const FPS = 24;
const FRAME_MS = 1000 / FPS;
/** How far below its own line a row must paint to hide the rows behind it. */
const OCCLUSION_ROWS = 5;
/** Backing-store cap. Past this the field is upscaled by the browser, which
 *  nobody can see on a 5–29% opacity texture and which keeps the fill cost
 *  flat on a 4K display instead of quadrupling it. */
const MAX_RENDER_W = 1280;

export function RidgeField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let raf = 0;
    let onScreen = true;
    let lastPaint = 0;
    let palette = readPalette();

    function readPalette() {
      const s = getComputedStyle(document.documentElement);
      return {
        bg: s.getPropertyValue("--bg").trim() || "#0b0a09",
        brass: s.getPropertyValue("--brass").trim() || "#d9a441",
      };
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      // Deliberately below 1x on wide screens — see the note above.
      const scale = Math.min(1, MAX_RENDER_W / Math.max(rect.width, 1));
      width = Math.max(1, Math.ceil(rect.width * scale));
      height = Math.max(1, Math.ceil(rect.height * scale));
      canvas!.width = width;
      canvas!.height = height;
    }

    // Three incommensurate sines never line up, so the field does not
    // visibly loop.
    function ridge(x: number, row: number, t: number) {
      return (
        Math.sin(x * 1.7 + row * 0.55 + t * 0.22) +
        Math.sin(x * 3.3 - row * 0.31 + t * 0.15) * 0.45 +
        Math.sin(x * 0.9 + row * 0.87 - t * 0.09) * 0.7
      );
    }

    function draw(time: number) {
      const t = time / 1000;
      const narrow = width < 640;
      const rows = narrow ? 15 : 22;
      const step = narrow ? 20 : 14;
      const topPad = height * 0.16;
      const rowGap = (height - topPad) / rows;
      const bandDepth = rowGap * OCCLUSION_ROWS;

      ctx!.clearRect(0, 0, width, height);
      ctx!.lineJoin = "round";

      for (let r = 0; r < rows; r++) {
        const depth = r / (rows - 1); // 0 far, 1 near
        const baseY = topPad + r * rowGap;
        // Amplitude swells toward the middle of the field and dies at the edges.
        const amp = rowGap * (0.9 + 2.6 * Math.sin(Math.PI * depth) ** 1.5);

        // Walk the line once, keeping the points so the band can be closed
        // back along itself without recomputing them.
        const ys: number[] = [];
        ctx!.beginPath();
        for (let x = -20, i = 0; x <= width + 20; x += step, i++) {
          const nx = x / width;
          // Horizontal falloff keeps the ridge off the page edges.
          const edge = Math.sin(Math.PI * Math.min(Math.max(nx, 0), 1)) ** 0.8;
          const y = baseY - ridge(nx * 2.4, r, t) * amp * edge;
          ys[i] = y;
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        // Close the band downward and fill it, then stroke the line itself.
        const lastX = -20 + (ys.length - 1) * step;
        ctx!.lineTo(lastX, ys[ys.length - 1] + bandDepth);
        for (let i = ys.length - 1; i >= 0; i--) {
          ctx!.lineTo(-20 + i * step, ys[i] + bandDepth);
        }
        ctx!.closePath();
        ctx!.fillStyle = palette.bg;
        ctx!.fill();

        ctx!.beginPath();
        for (let i = 0; i < ys.length; i++) {
          const x = -20 + i * step;
          if (i === 0) ctx!.moveTo(x, ys[i]);
          else ctx!.lineTo(x, ys[i]);
        }
        ctx!.strokeStyle = palette.brass;
        // Near rows are brighter; far rows dissolve into the background.
        ctx!.globalAlpha = 0.05 + depth * 0.24;
        ctx!.lineWidth = 0.7 + depth * 0.5;
        ctx!.stroke();
        ctx!.globalAlpha = 1;
      }
    }

    function loop(time: number) {
      raf = requestAnimationFrame(loop);
      if (!onScreen || document.hidden) return;
      if (time - lastPaint < FRAME_MS) return;
      lastPaint = time;
      draw(time);
    }

    resize();

    if (reduced) {
      draw(0);
    } else {
      raf = requestAnimationFrame(loop);
    }

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        resize();
        if (reduced) draw(0);
      }, 120);
    };
    window.addEventListener("resize", onResize);

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    // Repaint in the new palette the moment the theme flips.
    const mo = new MutationObserver(() => {
      palette = readPalette();
      if (reduced) draw(0);
    });
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
