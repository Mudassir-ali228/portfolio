"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DijkstraPainter, makePainter, type FigureSpec, type Painter } from "@/lib/painters";
import { Split } from "../motion/Split";

gsap.registerPlugin(ScrollTrigger);

type Plate = {
  id: string;
  fig: string;
  kicker: string;
  title: [string, string];
  /** Time and space, in the notation a reviewer would use. */
  cost: string;
  note: string;
  /** One listing, or two that cross over as the figure changes mode. */
  code?: { label: string; lines: string[] }[];
  spec: FigureSpec;
  readouts: [string, string][];
};

const PLATES: Plate[] = [
  {
    id: "iteration",
    fig: "Fig. 2",
    kicker: "Iteration",
    title: ["Fibonacci,", "iterated"],
    cost: "Time O(n) · Space O(1)",
    note: "Each square is as wide as the two before it. Keep adding and the ratio between neighbours settles on 1.618, the golden ratio.",
    code: [{ label: "Loop", lines: ["let [a, b] = [0, 1];", "for (let i = 0; i < n; i++) {", "  [a, b] = [b, a + b];", "}"] }],
    spec: { kind: "fibonacci", count: 12 },
    readouts: [["n", "1"], ["fib(n)", "1"], ["Ratio", "1.00000"]],
  },
  {
    id: "recursion",
    fig: "Fig. 3",
    kicker: "Recursion",
    title: ["Fibonacci,", "recursed"],
    cost: "Naive O(2\u207f) · Memoised O(n)",
    note: "The same numbers from a function that calls itself. It keeps solving problems it has already solved; remembering each answer cuts fib(6) from 25 calls to 11.",
    code: [
      { label: "Naive", lines: ["function fib(n) {", "  if (n < 2) return n;", "  return fib(n - 1) + fib(n - 2);", "}"] },
      {
        label: "Memoised",
        lines: [
          "const memo = new Map();",
          "function fib(n) {",
          "  if (n < 2) return n;",
          "  if (!memo.has(n))",
          "    memo.set(n, fib(n - 1) + fib(n - 2));",
          "  return memo.get(n);",
          "}",
        ],
      },
    ],
    spec: { kind: "calls" },
    readouts: [["Calls", "0"], ["Stack depth", "0"], ["Mode", "naive"]],
  },
  {
    id: "search",
    fig: "Fig. 4",
    kicker: "Search",
    title: ["Trees,", "traversed"],
    cost: "Time O(V + E) · Space O(V)",
    note: "One tree, one loop. Take from the front of the list and the search spreads out level by level; take from the back and it dives down a branch before backing up.",
    code: [
      {
        label: "Loop",
        lines: [
          "while (frontier.length) {",
          "  const node = bfs",
          "    ? frontier.shift()  // queue",
          "    : frontier.pop();   // stack",
          "  visit(node);",
          "  frontier.push(...node.children);",
          "}",
        ],
      },
    ],
    spec: { kind: "traversal" },
    readouts: [["Visited", "0 / 15"], ["Queue", "1"], ["Stack", "1"]],
  },
  {
    id: "routes",
    fig: "Fig. 5",
    kicker: "Shortest paths",
    title: ["Routes,", "settled"],
    cost: "Time O((V + E) log V)",
    note: "Nodes leave the queue in order of distance, so each one's route is final the moment it does. One run finds the best route to every node: tap any of them to see its route.",
    code: [
      {
        label: "Dijkstra",
        lines: [
          "dist[s] = 0; heap.push([0, s]);",
          "while (heap.size) {",
          "  const [d, u] = heap.pop();",
          "  if (d > dist[u]) continue;",
          "  for (const [v, w] of edges[u])",
          "    if (d + w < dist[v]) {",
          "      dist[v] = d + w; prev[v] = u;",
          "      heap.push([dist[v], v]);",
          "    }",
          "}",
        ],
      },
    ],
    spec: { kind: "dijkstra", seed: 5 },
    readouts: [["Settled", "0 / 30"], ["Queue", "1"], ["To T", "\u221e"]],
  },
];
const RECURSION = 1;
const ROUTES = 3;
const N = PLATES.length;

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t: number) => {
  t = clamp(t);
  return t * t * (3 - 2 * t);
};

/**
 * Four figures, each drawn by the code beside it. The section pins and its
 * scroll distance plays them in turn: scrolling down runs each one forward,
 * scrolling back runs it in reverse.
 */
export function Figures() {
  const section = useRef<HTMLElement>(null);
  const plates = useRef<(HTMLElement | null)[]>([]);
  const beds = useRef<(HTMLDivElement | null)[]>([]);
  const bases = useRef<(HTMLCanvasElement | null)[]>([]);
  const lives = useRef<(HTMLCanvasElement | null)[]>([]);
  const counter = useRef<HTMLSpanElement>(null);
  const fills = useRef<(HTMLSpanElement | null)[]>([]);
  const painters = useRef<(Painter | null)[]>(Array(N).fill(null));
  const clock = useRef({ P: 0, entry: 0 });
  /** The progress each plate was last drawn at; -1 forces a repaint. */
  const drawn = useRef<number[]>(Array(N).fill(-1));
  const update = useRef<() => void>(() => {});
  // Painters, made once the canvases exist.
  useEffect(() => {
    PLATES.forEach((plate, i) => {
      const b = bases.current[i], l = lives.current[i], bed = beds.current[i];
      if (!b || !l || !bed) return;
      painters.current[i] = makePainter(plate.spec, b, l);
      painters.current[i]!.fit(bed.clientWidth);
    });
    update.current();
  }, []);

  // Everything that moves, computed from the scroll position.
  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const motion = document.documentElement.classList.contains("motion");

    const readouts = (i: number) => {
      const r = painters.current[i]?.readout();
      if (!r) return;
      plates.current[i]?.querySelectorAll<HTMLElement>("[data-readout]").forEach((dd) => {
        const v = r[dd.dataset.readout!];
        if (v !== undefined && dd.textContent !== v) dd.textContent = v;
      });
    };

    const paint = (i: number, p: number) => {
      const painter = painters.current[i];
      if (!painter) return;
      if (drawn.current[i] !== p) {
        painter.draw(p);
        drawn.current[i] = p;
        readouts(i);
      }
      if (i === RECURSION) {
        const phase = painter.phase?.() ?? 0;
        const [naive, memo] = plates.current[RECURSION]?.querySelectorAll<HTMLElement>("[data-code]") ?? [];
        // One listing hands over to the other; they never overlap.
        if (naive) naive.style.opacity = String(clamp(1 - phase * 2));
        if (memo) memo.style.opacity = String(clamp(phase * 2 - 1));
      }
    };

    if (!motion) {
      update.current = () => PLATES.forEach((_, i) => paint(i, 1));
      update.current();
      return;
    }

    // Looked up once: querying the DOM on every scroll frame is waste.
    const pieces = plates.current.map((plate) => ({
      parts: plate ? [...plate.querySelectorAll<HTMLElement>("[data-part]")] : [],
      chars: plate ? [...plate.querySelectorAll<HTMLElement>(".split-c")] : [],
    }));
    const lastW: number[] = Array(N).fill(-1);

    update.current = () => {
      const { P, entry } = clock.current;
      const seg = P * N;
      let active = 0;
      let best = -1;
      for (let i = 0; i < N; i++) {
        // Plates hand over in sequence: one clears before the next arrives,
        // so two never sit on top of each other half-faded.
        const inA = i === 0 ? entry : smooth((seg - i) / 0.1);
        const outA = i === N - 1 ? 1 : 1 - smooth((seg - (i + 1) + 0.1) / 0.1);
        const w = Math.min(inA, outA);
        if (w > best) {
          best = w;
          active = i;
        }
        const plate = plates.current[i];
        if (!plate) continue;
        const local = clamp((seg - i - 0.08) / 0.8);
        if (w > 0) paint(i, local);
        const f = fills.current[i];
        if (f) f.style.transform = `scaleX(${clamp(seg - i)})`;
        if (w === lastW[i]) continue; // nothing about this plate's entrance changed
        lastW[i] = w;

        plate.style.visibility = w < 0.005 ? "hidden" : "visible";
        plate.style.pointerEvents = w > 0.6 ? "auto" : "none";

        // Arriving pieces rise from below; leaving ones drift up.
        const dir = seg < i + 0.5 ? 1 : -1;
        // Staggers are spread over the pieces there are, so the last one
        // still lands exactly when the plate is fully shown.
        const { parts, chars } = pieces[i];
        parts.forEach((part, j) => {
          const pw = smooth(w * 1.3 - (j / Math.max(1, parts.length - 1)) * 0.3);
          part.style.opacity = String(pw);
          part.style.transform = `translate3d(0, ${(1 - pw) * 22 * dir}px, 0)`;
        });
        chars.forEach((c, j) => {
          const cw = smooth(w * 1.5 - (j / Math.max(1, chars.length - 1)) * 0.5);
          c.style.transform = `translate3d(0, ${(1 - cw) * 115 * dir}%, 0)`;
        });

      }
      if (counter.current) {
        const text = `${String(active + 1).padStart(2, "0")} / ${String(N).padStart(2, "0")}`;
        if (counter.current.textContent !== text) counter.current.textContent = text;
      }
    };

    const small = () => window.innerWidth < 768;
    const run = gsap.to(clock.current, {
      P: 1,
      ease: "none",
      onUpdate: () => update.current(),
      scrollTrigger: {
        trigger: el,
        start: "top top",
        end: () => `+=${window.innerHeight * N * (small() ? 0.78 : 0.95)}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    const entry = ScrollTrigger.create({
      trigger: el,
      start: "top 80%",
      end: "top top",
      scrub: 0.8,
      onUpdate: (self) => {
        clock.current.entry = self.progress;
        update.current();
      },
    });
    update.current();
    // Everything below now sits a pin's length further down.
    ScrollTrigger.refresh();

    return () => {
      run.scrollTrigger?.kill();
      run.kill();
      entry.kill();
    };
  }, []);

  // Keep every canvas matched to its frame, and repaint on theme change.
  useEffect(() => {
    const ro = new ResizeObserver(() => {
      beds.current.forEach((bed, i) => bed && painters.current[i]?.fit(bed.clientWidth));
      update.current();
    });
    beds.current.forEach((bed) => bed && ro.observe(bed));
    const mo = new MutationObserver(() => {
      beds.current.forEach((bed, i) => bed && painters.current[i]?.fit(bed.clientWidth));
      update.current();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.fonts?.ready.then(() => {
      beds.current.forEach((bed, i) => bed && painters.current[i]?.fit(bed.clientWidth));
      update.current();
    });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  /** A new destination on the route plate. Every route is already known,
   *  so this only redraws; if the route was showing, it is traced again. */
  const pick = (v: number) => {
    const painter = painters.current[ROUTES];
    if (!(painter instanceof DijkstraPainter) || v < 0 || v === painter.source) return;
    painter.setTarget(v);
    const repaint = () => {
      drawn.current[ROUTES] = -1;
      update.current();
    };
    if (!document.documentElement.classList.contains("motion")) return repaint();
    const r = { v: 0 };
    gsap.to(r, {
      v: 1,
      duration: 1.1,
      ease: "power2.inOut",
      onUpdate: () => {
        painter.setRetrace(r.v);
        repaint();
      },
      onComplete: () => {
        painter.setRetrace(null);
        repaint();
      },
    });
  };

  const tapRoute = (e: React.MouseEvent<HTMLDivElement>) => {
    const painter = painters.current[ROUTES];
    if (!(painter instanceof DijkstraPainter)) return;
    const box = e.currentTarget.getBoundingClientRect();
    pick(painter.nodeAt(e.clientX - box.left, e.clientY - box.top));
  };

  return (
    <section ref={section} id="figures" className="harmonograph relative" aria-label="Figures">
      <div className="shell flex min-h-[100svh] flex-col justify-center py-6 md:py-10">
        <div className="relative pt-5 md:pt-8">
          <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />
          <div className="flex items-baseline justify-between gap-6">
            <p className="label" data-a="fade">
              Figures
              <span className="hidden sm:inline">
                <span className="mx-2 text-line">·</span>
                <span className="normal-case tracking-normal">four ideas, each drawn by the code beside it</span>
              </span>
            </p>
            <span ref={counter} className="plate-counter label shrink-0 whitespace-nowrap tabular-nums" data-a="fade">
              01 / {String(N).padStart(2, "0")}
            </span>
          </div>

          <div className="plates mt-5 md:mt-8">
            {PLATES.map((plate, i) => (
              <article
                key={plate.id}
                ref={(el) => {
                  plates.current[i] = el;
                }}
                className="plate grid gap-4 md:gap-6 lg:grid-cols-12 lg:gap-x-12 lg:gap-y-6"
                aria-labelledby={`plate-${plate.id}`}
              >
                <div className="lg:col-span-4 lg:row-start-1 lg:self-end">
                  <p className="label" data-part>
                    {plate.fig}
                    <span className="mx-2 text-line">·</span>
                    {plate.kicker}
                  </p>
                  <h3
                    id={`plate-${plate.id}`}
                    aria-label={plate.title.join(" ")}
                    className="display mt-3 text-[clamp(2.1rem,4.4vw,3.9rem)] leading-[0.95] md:mt-4"
                  >
                    <Split text={plate.title[0]} />{" "}
                    <em className="block italic">
                      <Split text={plate.title[1]} />
                    </em>
                  </h3>
                  <p className="mt-3 font-mono text-[0.75rem] tracking-[0.02em] text-brass md:mt-4" data-part>
                    {plate.cost}
                  </p>
                  <p className="plate-note body-copy mt-3 max-w-sm text-[0.9375rem] md:mt-5" data-part>
                    {plate.note}
                  </p>
                </div>

                <div className="lg:col-span-7 lg:col-start-6 lg:row-span-2 lg:row-start-1 lg:self-center" data-part>
                  <div className="mx-auto w-full max-w-[min(100%,40svh)] lg:max-w-[min(100%,68svh)]">
                    <div
                      ref={(el) => {
                        beds.current[i] = el;
                      }}
                      className={`plot-bed relative aspect-square w-full overflow-hidden border border-line ${i === ROUTES ? "cursor-pointer" : ""}`}
                      onClick={i === ROUTES ? tapRoute : undefined}
                    >
                      <canvas
                        ref={(el) => {
                          bases.current[i] = el;
                        }}
                        className="absolute inset-0 h-full w-full"
                      />
                      <canvas
                        ref={(el) => {
                          lives.current[i] = el;
                        }}
                        className="absolute inset-0 h-full w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 lg:row-start-2 lg:self-start">
                  {plate.code && (
                    <div className="plate-code mb-6 hidden lg:grid" data-part>
                      {plate.code.map((listing, k) => (
                        <div
                          key={listing.label}
                          data-code={k}
                          className="[grid-area:1/1]"
                          style={k > 0 ? { opacity: 0 } : undefined}
                        >
                          <p className="label mb-2">{listing.label}</p>
                          <pre className="font-mono text-[0.75rem] leading-[1.7] text-muted">
                            {listing.lines.join("\n")}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                  <dl
                    className="grid grid-cols-3 gap-x-3 gap-y-3 border-t border-line pt-4"
                    data-part
                  >
                    {plate.readouts.map(([k, v]) => (
                      <div key={k}>
                        <dt className="label text-[0.625rem] tracking-[0.1em] sm:text-[0.6875rem] sm:tracking-[0.14em]">{k}</dt>
                        <dd data-readout={k} className="mt-1 font-mono text-[0.8125rem] tabular-nums text-ink sm:text-[0.9375rem]">
                          {v}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {i === ROUTES && (
                    <p className="mt-4 md:mt-6" data-part>
                      <button
                        type="button"
                        onClick={() => {
                          const painter = painters.current[ROUTES];
                          if (painter instanceof DijkstraPainter) pick(painter.randomTarget());
                        }}
                        className="text-link text-[0.9375rem]"
                      >
                        Pick another destination
                      </button>
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* Where you are in the four. */}
          <div
            className="plate-progress mt-5 grid gap-2 md:mt-8"
            style={{ gridTemplateColumns: `repeat(${N}, minmax(0, 1fr))` }}
            aria-hidden="true"
          >
            {PLATES.map((plate, i) => (
              <span key={plate.id} className="relative block h-px bg-line">
                <span
                  ref={(el) => {
                    fills.current[i] = el;
                  }}
                  className="absolute inset-0 origin-left bg-brass"
                  style={{ transform: "scaleX(0)" }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
