/**
 * Canvas renderers for the figures. Each draws its figure at any point in
 * its own time, `p` from 0 to 1, forwards or backwards, so scrolling can run
 * a figure and scrolling back can unrun it. Everything but the harmonograph
 * repaints in full; the geometry is small enough that this costs well under
 * a millisecond.
 */
import { callTree, fibonacci, roads, route, traversal, tree } from "./art";
import { pendulums, trace } from "./harmonograph";
import { Plotter } from "./plotter";

export type Readout = Record<string, string>;

export interface Painter {
  fit(size: number): void;
  draw(p: number): void;
  readout(): Readout;
  /** Where the pen is, in CSS pixels, for figures that have one. */
  pen?(): { x: number; y: number } | null;
  /** Secondary phase for plates that change mode partway (0 to 1). */
  phase?(): number;
  caption: string;
}

type Ink = { bg: string; brass: string; ink: string; muted: string; faint: string; line: string; display: string; mono: string; light: boolean };

let cached: Ink | null = null;
/** Colours and fonts from the CSS, re-read when the theme changes. */
export function ink(): Ink {
  if (cached) return cached;
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const v = (k: string) => cs.getPropertyValue(k).trim();
  cached = {
    bg: v("--bg") || "#0b0a09",
    brass: v("--brass") || "#d9a441",
    ink: v("--ink") || "#efe9de",
    muted: v("--muted") || "#a39a8e",
    faint: v("--faint") || "#756c61",
    line: v("--line") || "#262220",
    display: v("--font-fraunces") || "Georgia, serif",
    mono: v("--font-mono") || "ui-monospace, monospace",
    light: root.dataset.theme === "light",
  };
  return cached;
}
if (typeof window !== "undefined") {
  new MutationObserver(() => (cached = null)).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const out2 = (t: number) => 1 - (1 - t) * (1 - t);
const fmt = (n: number) => n.toLocaleString("en-GB");

/**
 * Text set once into small bitmaps at the screen's pixel ratio and reused.
 * fillText with a font change per label, every frame, is the slowest thing a
 * figure can do on a weak phone.
 */
class Labels {
  private cache = new Map<string, HTMLCanvasElement>();
  private dpr = 1;
  reset(dpr: number) {
    this.dpr = dpr;
    this.cache.clear();
  }
  draw(c: CanvasRenderingContext2D, text: string, x: number, y: number, px: number, font: string, color: string, align: "center" | "left" | "right" = "center") {
    const key = `${px}|${font}|${color}|${text}`;
    let s = this.cache.get(key);
    if (!s) {
      s = document.createElement("canvas");
      const g = s.getContext("2d")!;
      g.font = `${px}px ${font}`;
      const w = Math.ceil(g.measureText(text).width) + 4;
      const h = Math.ceil(px * 1.5);
      s.width = Math.ceil(w * this.dpr);
      s.height = Math.ceil(h * this.dpr);
      g.scale(this.dpr, this.dpr);
      g.font = `${px}px ${font}`;
      g.fillStyle = color;
      g.textBaseline = "middle";
      g.fillText(text, 2, h / 2);
      this.cache.set(key, s);
    }
    const w = s.width / this.dpr;
    const h = s.height / this.dpr;
    const dx = align === "center" ? x - w / 2 : align === "right" ? x - w + 2 : x - 2;
    c.drawImage(s, dx, y - h / 2, w, h);
  }
}

/** Shared canvas bookkeeping: size, pixel ratio, clearing. */
abstract class Canvas {
  protected ctx: CanvasRenderingContext2D;
  protected labels = new Labels();
  protected size = 0;
  protected dpr = 1;
  protected p = 0;
  constructor(protected cv: HTMLCanvasElement) {
    this.ctx = cv.getContext("2d")!;
  }
  fit(size: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size = size;
    this.cv.width = Math.round(size * this.dpr);
    this.cv.height = Math.round(size * this.dpr);
    this.labels.reset(this.dpr);
    this.draw(this.p);
  }
  protected begin() {
    const c = this.ctx;
    c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    c.clearRect(0, 0, this.size, this.size);
    c.lineCap = "round";
    c.lineJoin = "round";
    return c;
  }
  /** Normalised [-1, 1] to CSS pixels. */
  protected px(v: number, pad = 0.96) {
    return this.size / 2 + v * (this.size / 2) * pad;
  }
  abstract draw(p: number): void;
}

/* ---------------------------------------------------------------- tree */

export class TreePainter extends Canvas implements Painter {
  private t;
  caption: string;
  constructor(cv: HTMLCanvasElement, seed: number, depth = 9) {
    super(cv);
    this.t = tree(seed, depth);
    this.caption = `Recursive tree · depth ${depth}`;
  }
  /** Each level grows in turn; a branch starts once its parent is grown. */
  draw(p: number) {
    this.p = p;
    if (!this.size) return;
    const c = this.begin();
    const { segs, depth } = this.t;
    const k = ink();
    const levels = depth + 1;
    const at = p * levels;
    c.strokeStyle = k.brass;
    for (let d = 0; d <= depth; d++) {
      const g = clamp(at - d);
      if (g <= 0) break;
      const grow = out2(g);
      c.globalAlpha = (k.light ? 0.95 : 0.9) - d * 0.045;
      c.lineWidth = Math.max(0.45, 2.4 * Math.pow(0.72, d));
      c.beginPath();
      for (let i = 0; i < segs.length; i += 5) {
        if (segs[i + 4] !== d) continue;
        const x1 = this.px(segs[i]), y1 = this.px(segs[i + 1]);
        c.moveTo(x1, y1);
        c.lineTo(x1 + (this.px(segs[i + 2]) - x1) * grow, y1 + (this.px(segs[i + 3]) - y1) * grow);
      }
      c.stroke();
    }
    c.globalAlpha = 1;
  }
  readout() {
    const d = Math.min(this.t.depth, Math.floor(this.p * (this.t.depth + 1)));
    let n = 0;
    for (let i = 4; i < this.t.segs.length; i += 5) if (this.t.segs[i] <= d) n++;
    return { Depth: String(d), Branches: fmt(n) };
  }
}

/* ----------------------------------------------------------- fibonacci */

export class FibonacciPainter extends Canvas implements Painter {
  private f;
  private sprites = new Map<number, HTMLCanvasElement>();
  private spriteKey = "";
  caption = "Fibonacci squares";
  constructor(cv: HTMLCanvasElement, private count = 12) {
    super(cv);
    this.f = fibonacci(count);
  }
  /** Each number is set once into a small bitmap and scaled from then on:
   *  setting type every frame is the slowest thing this figure could do. */
  private sprite(n: number, k: Ink) {
    const key = `${k.muted}|${k.display}`;
    if (key !== this.spriteKey) {
      this.sprites.clear();
      this.spriteKey = key;
    }
    let s = this.sprites.get(n);
    if (!s) {
      const px = 96;
      s = document.createElement("canvas");
      const g = s.getContext("2d")!;
      g.font = `italic ${px}px ${k.display}`;
      const w = Math.ceil(g.measureText(String(n)).width) + 8;
      s.width = w;
      s.height = Math.ceil(px * 1.3);
      g.font = `italic ${px}px ${k.display}`;
      g.fillStyle = k.muted;
      g.textAlign = "center";
      g.textBaseline = "middle";
      g.fillText(String(n), w / 2, s.height / 2);
      this.sprites.set(n, s);
    }
    return s;
  }

  /** Squares arrive one at a time and the view pulls back to hold them all. */
  draw(p: number) {
    this.p = p;
    if (!this.size) return;
    const c = this.begin();
    const k = ink();
    const { squares, boxes, F } = this.f;
    const t = 1 + p * (this.count - 1);
    const done = Math.floor(t);
    const part = t - done;

    // Camera: ease from the box that holds the finished squares to the next.
    const from = boxes[Math.max(0, done - 1)];
    const to = boxes[Math.min(this.count - 1, done)];
    const e = ease(part);
    const bx0 = from.x0 + (to.x0 - from.x0) * e, bx1 = from.x1 + (to.x1 - from.x1) * e;
    const by0 = from.y0 + (to.y0 - from.y0) * e, by1 = from.y1 + (to.y1 - from.y1) * e;
    const scale = (this.size * 0.84) / Math.max(bx1 - bx0, by1 - by0);
    const ox = this.size / 2 - ((bx0 + bx1) / 2) * scale;
    const oy = this.size / 2 - ((by0 + by1) / 2) * scale;
    const X = (x: number) => ox + x * scale;
    const Y = (y: number) => oy + y * scale;

    for (let i = 0; i < Math.min(this.count, done + 1); i++) {
      const q = squares[i];
      const g = i < done ? 1 : part;
      if (g <= 0) continue;
      // The square's outline fades in, its number follows, then the arc.
      c.globalAlpha = clamp(g * 3) * (k.light ? 0.9 : 0.8);
      c.strokeStyle = k.line;
      c.lineWidth = 1;
      c.strokeRect(X(q.x), Y(q.y), q.s * scale, q.s * scale);

      const fs = Math.min(46, q.s * scale * 0.3);
      if (fs >= 8) {
        const s = this.sprite(F[i], k);
        const r = fs / 96;
        c.globalAlpha = clamp(g * 2.5 - 0.5) * 0.9;
        c.drawImage(s, X(q.x + q.s / 2) - (s.width * r) / 2, Y(q.y + q.s / 2) - (s.height * r) / 2, s.width * r, s.height * r);
      }

      const a = clamp((g - 0.25) / 0.75);
      if (a > 0) {
        c.globalAlpha = 1;
        c.strokeStyle = k.brass;
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(X(q.cx), Y(q.cy), q.s * scale, q.a0, q.a0 + (q.a1 - q.a0) * a, true);
        c.stroke();
      }
    }
    c.globalAlpha = 1;
  }
  readout() {
    const t = 1 + this.p * (this.count - 1);
    const n = Math.min(this.count, Math.max(1, Math.round(t)));
    const { F } = this.f;
    const ratio = n > 1 ? F[n - 1] / F[n - 2] : 1;
    return { n: String(n), "fib(n)": fmt(F[n - 1]), Ratio: ratio.toFixed(5) };
  }
}

/* ----------------------------------------------------------- call tree */

export class CallTreePainter extends Canvas implements Painter {
  private tree;
  caption = "Call tree of fib(6)";
  constructor(cv: HTMLCanvasElement, private n = 6) {
    super(cv);
    this.tree = callTree(n);
  }
  private split(p: number) {
    return { run: clamp(p / 0.56), memo: ease(clamp((p - 0.62) / 0.22)) };
  }
  phase() {
    return this.split(this.p).memo;
  }
  /**
   * First the calls appear in the order the function makes them, with the
   * live call stack lit. Then memoisation: every call that would recompute
   * something already known fades away.
   */
  draw(p: number) {
    this.p = p;
    if (!this.size) return;
    const c = this.begin();
    const k = ink();
    const { calls } = this.tree;
    const { run, memo } = this.split(p);
    const shown = run * calls.length;
    const cur = Math.min(calls.length - 1, Math.floor(shown));
    const onStack = new Set<number>();
    if (run < 1) for (let i = cur; i >= 0; i = calls[i].parent) onStack.add(i);
    const r = Math.max(8, Math.min(13, this.size * 0.021));
    const gone = (i: number) => (calls[i].keep ? 1 : 1 - memo * 0.92);

    // Edges.
    for (let i = 1; i < calls.length; i++) {
      const g = clamp(shown - i);
      if (g <= 0) break;
      const a = calls[calls[i].parent], b = calls[i];
      const lit = onStack.has(i);
      c.globalAlpha = (lit ? 1 : 0.55) * gone(i);
      c.strokeStyle = lit || (memo > 0 && b.keep) ? k.brass : k.faint;
      c.lineWidth = lit ? 1.6 : 1;
      const x1 = this.px(a.x, 0.92), y1 = this.px(a.y, 0.92) + r;
      const x2 = this.px(b.x, 0.92), y2 = this.px(b.y, 0.92) - r;
      c.beginPath();
      c.moveTo(x1, y1);
      c.lineTo(x1 + (x2 - x1) * out2(g), y1 + (y2 - y1) * out2(g));
      c.stroke();
    }

    // Nodes.
    const fs = Math.round(r * 0.95);
    for (let i = 0; i < calls.length; i++) {
      const g = clamp(shown - i);
      if (g <= 0) break;
      const b = calls[i];
      const x = this.px(b.x, 0.92), y = this.px(b.y, 0.92);
      const now = run < 1 && i === cur;
      c.globalAlpha = out2(g) * gone(i);
      c.beginPath();
      c.arc(x, y, r * (0.6 + 0.4 * out2(g)), 0, Math.PI * 2);
      c.fillStyle = now ? k.brass : k.bg;
      c.fill();
      c.lineWidth = b.hit && memo > 0 ? 1.6 : 1;
      c.strokeStyle = onStack.has(i) || (memo > 0 && b.keep) ? k.brass : k.muted;
      if (b.hit && memo > 0) c.setLineDash([2, 2.5]);
      c.stroke();
      c.setLineDash([]);
      this.labels.draw(c, String(b.n), x, y + 0.5, fs, k.mono, now ? k.bg : k.ink);
    }
    c.globalAlpha = 1;
  }
  readout() {
    const { calls, kept } = this.tree;
    const { run, memo } = this.split(this.p);
    const shown = Math.min(calls.length, Math.floor(run * calls.length + 0.001));
    const cur = Math.max(0, Math.min(calls.length - 1, Math.floor(run * calls.length)));
    // Only counts the code really makes: calls so far, then the memoised total.
    const count = memo >= 0.5 ? kept : shown;
    return {
      Calls: String(count),
      "Stack depth": run < 1 && shown > 0 ? String(calls[cur].depth + 1) : "0",
      Mode: memo > 0.5 ? "memoised" : "naive",
    };
  }
}

/* ----------------------------------------------------------- traversal */

export class TraversalPainter extends Canvas implements Painter {
  private t = traversal();
  caption = "Breadth-first and depth-first search";

  private step(p: number) {
    return clamp(p / 0.88) * 15;
  }

  /**
   * The same tree twice: breadth-first above, depth-first below, each with
   * the list the loop is holding drawn under it and a trail through the
   * nodes in the order they were visited.
   */
  draw(p: number) {
    this.p = p;
    if (!this.size) return;
    const c = this.begin();
    const k = ink();
    const at = this.step(p);
    const r = Math.max(6, Math.min(13, this.size * 0.024));
    const fs = Math.max(8, Math.round(r * 0.95));
    const small = this.size < 360;

    const panel = (walk: { order: number[]; frontier: number[][] }, top: number, name: string, end: "front" | "top") => {
      const done = Math.min(15, Math.floor(at));
      const f = at - Math.floor(at);
      const X = (x: number) => this.px(x * 0.86);
      const Y = (lvl: number) => this.px(top + 0.17 + lvl * 0.15);
      const visited = new Set(walk.order.slice(0, done));
      const cur = done < 15 ? walk.order[done] : -1;
      const list = done === 0 ? [0] : walk.frontier[done - 1];
      const waiting = new Set(list);

      this.labels.draw(c, name, this.px(-0.86), this.px(top + 0.04), small ? 8 : 10, k.mono, k.faint, "left");

      // The tree's structure.
      c.strokeStyle = k.line;
      c.lineWidth = 1;
      c.globalAlpha = 1;
      c.beginPath();
      for (const n of this.t.nodes) {
        if (n.parent < 0) continue;
        const pa = this.t.nodes[n.parent];
        c.moveTo(X(pa.x), Y(pa.y * 3));
        c.lineTo(X(n.x), Y(n.y * 3));
      }
      c.stroke();

      // The trail: node to node in visit order, which is where the two
      // searches look nothing alike.
      const reach = Math.min(14, at - 1);
      if (reach > 0) {
        c.strokeStyle = k.brass;
        c.globalAlpha = 0.5;
        c.lineWidth = 1.2;
        c.setLineDash([3, 3]);
        c.beginPath();
        const o = walk.order;
        c.moveTo(X(this.t.nodes[o[0]].x), Y(this.t.nodes[o[0]].y * 3));
        for (let i = 1; i <= Math.floor(reach); i++) c.lineTo(X(this.t.nodes[o[i]].x), Y(this.t.nodes[o[i]].y * 3));
        const fr = reach - Math.floor(reach);
        if (fr > 0 && Math.floor(reach) + 1 < 15) {
          const a = this.t.nodes[o[Math.floor(reach)]], b = this.t.nodes[o[Math.floor(reach) + 1]];
          c.lineTo(X(a.x + (b.x - a.x) * fr), Y((a.y + (b.y - a.y) * fr) * 3));
        }
        c.stroke();
        c.setLineDash([]);
      }

      // Nodes.
      this.t.nodes.forEach((n, i) => {
        const x = X(n.x), y = Y(n.y * 3);
        const isCur = i === cur;
        const seen = visited.has(i);
        c.globalAlpha = isCur ? 0.35 + 0.65 * out2(f) : 1;
        c.beginPath();
        c.arc(x, y, r, 0, Math.PI * 2);
        c.fillStyle = isCur ? k.brass : k.bg;
        c.fill();
        c.lineWidth = seen || isCur ? 1.4 : 1;
        c.strokeStyle = seen || isCur || waiting.has(i) ? k.brass : k.faint;
        if (waiting.has(i) && !seen && !isCur) c.setLineDash([2, 2.5]);
        c.stroke();
        c.setLineDash([]);
        c.globalAlpha = 1;
        if (!small || seen || isCur) this.labels.draw(c, n.label, x, y + 0.5, fs, k.mono, isCur ? k.bg : seen ? k.ink : k.muted);
        if (seen && !small) {
          const order = walk.order.indexOf(i) + 1;
          this.labels.draw(c, String(order), x + r + 2, y - r, Math.max(7, fs - 3), k.mono, k.brass, "left");
        }
      });

      // The list itself: what the loop is holding right now.
      const box = Math.max(12, Math.min(24, this.size * 0.042));
      const y0 = this.px(top + 0.79);
      list.forEach((node, j) => {
        const x = this.px(-0.86) + j * (box + 4);
        const next = end === "front" ? j === 0 : j === list.length - 1;
        c.strokeStyle = next ? k.brass : k.line;
        c.lineWidth = next ? 1.4 : 1;
        c.strokeRect(x, y0 - box / 2, box, box);
        this.labels.draw(c, this.t.nodes[node].label, x + box / 2, y0 + 0.5, Math.max(8, Math.round(box * 0.5)), k.mono, next ? k.ink : k.muted);
      });
      if (list.length && !small) {
        const jx = end === "front" ? 0 : list.length - 1;
        this.labels.draw(c, "next out", this.px(-0.86) + jx * (box + 4) + box / 2, y0 + box / 2 + 8, 8, k.mono, k.brass);
      }
    };

    panel(this.t.bfs, -1, "BREADTH-FIRST · QUEUE", "front");
    panel(this.t.dfs, 0, "DEPTH-FIRST · STACK", "top");
    c.globalAlpha = 1;
  }

  readout() {
    const done = Math.min(15, Math.floor(this.step(this.p)));
    const q = done === 0 ? 1 : this.t.bfs.frontier[done - 1].length;
    const st = done === 0 ? 1 : this.t.dfs.frontier[done - 1].length;
    return { Visited: `${done} / 15`, Queue: String(q), Stack: String(st) };
  }
}

/* ------------------------------------------------------------ dijkstra */

export class DijkstraPainter extends Canvas implements Painter {
  private g;
  private states: { dist: Float64Array; prev: Int16Array; settled: Uint8Array }[] = [];
  private target: number;
  private retrace: number | null = null;
  caption = "Dijkstra’s shortest path";

  constructor(cv: HTMLCanvasElement, seed: number) {
    super(cv);
    this.g = roads(seed);
    this.target = this.g.target;
    // Replay the run once, keeping what the algorithm knew after each settle.
    const n = this.g.pts.length;
    const dist = new Float64Array(n).fill(Infinity);
    const prev = new Int16Array(n).fill(-1);
    const settled = new Uint8Array(n);
    dist[this.g.source] = 0;
    this.states.push({ dist: dist.slice(), prev: prev.slice(), settled: settled.slice() });
    for (const s of this.g.settles) {
      settled[s.node] = 1;
      for (const rx of s.relaxed) {
        dist[rx.to] = rx.dist;
        prev[rx.to] = s.node;
      }
      this.states.push({ dist: dist.slice(), prev: prev.slice(), settled: settled.slice() });
    }
  }

  get source() {
    return this.g.source;
  }
  /** Any node can be the destination: one run already found every route. */
  setTarget(v: number) {
    this.target = v;
    this.draw(this.p);
  }
  /** Replays the route trace (0 to 1) after a new destination; null ends it. */
  setRetrace(t: number | null) {
    this.retrace = t;
  }
  /** The node nearest a point on the canvas, in CSS pixels. */
  nodeAt(x: number, y: number) {
    let best = -1, bd = Infinity;
    this.g.pts.forEach((q, i) => {
      const d = Math.hypot(this.px(q.x, 0.88) - x, this.px(q.y, 0.9) - y);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return bd < Math.max(26, this.size * 0.06) ? best : -1;
  }
  randomTarget() {
    const others = this.g.pts.map((_, i) => i).filter((i) => i !== this.g.source && i !== this.target);
    return others[Math.floor(Math.random() * others.length)];
  }

  private split(p: number) {
    return { run: clamp(p / 0.72), trace: ease(clamp((p - 0.76) / 0.2)) };
  }

  /**
   * Nodes settle in order of distance with their tentative distances
   * showing; the one being settled pulses and relaxes its edges. Then the
   * route to the destination is traced back through the prev pointers.
   */
  draw(p: number) {
    this.p = p;
    if (!this.size) return;
    const c = this.begin();
    const k = ink();
    const { pts, edges, settles } = this.g;
    const n = pts.length;
    const { run, trace: tr } = this.split(p);
    const trace = this.retrace === null ? tr : Math.min(tr, this.retrace);
    const at = run * n;
    const done = Math.min(n, Math.floor(at));
    const f = at - done;
    const st = this.states[done];
    const cur = done < n ? settles[done].node : -1;
    const r = Math.max(5, Math.min(11, this.size * 0.019));
    const small = this.size < 360;
    // Pulled in from the edges so the distance labels beside the outermost
    // nodes stay inside the frame.
    const X = (i: number) => this.px(pts[i].x, 0.88);
    const Y = (i: number) => this.px(pts[i].y, 0.9);
    const path = route(this.states[n].prev as unknown as number[], this.target);
    const onPath = new Set<string>();
    for (let i = 1; i < path.length; i++) onPath.add(`${Math.min(path[i - 1], path[i])}-${Math.max(path[i - 1], path[i])}`);
    const dim = 1 - 0.6 * trace;

    // Streets, with their weights.
    c.lineWidth = 1;
    c.strokeStyle = k.line;
    c.beginPath();
    for (const e of edges) {
      c.moveTo(X(e.a), Y(e.a));
      c.lineTo(X(e.b), Y(e.b));
    }
    c.stroke();
    if (!small) {
      for (const e of edges) {
        this.labels.draw(c, String(e.w), (X(e.a) + X(e.b)) / 2, (Y(e.a) + Y(e.b)) / 2, 9, k.mono, k.faint);
      }
    }

    // The tree of best routes found so far.
    c.strokeStyle = k.brass;
    c.lineWidth = 1.2;
    c.globalAlpha = 0.55 * dim;
    c.beginPath();
    for (let v = 0; v < n; v++) {
      if (!st.settled[v] || st.prev[v] < 0) continue;
      c.moveTo(X(st.prev[v]), Y(st.prev[v]));
      c.lineTo(X(v), Y(v));
    }
    c.stroke();

    // The node being settled relaxes its edges.
    if (cur >= 0 && f > 0) {
      c.globalAlpha = 0.9;
      c.lineWidth = 1.4;
      c.beginPath();
      for (const rx of settles[done].relaxed) {
        const g = out2(clamp(f * 1.6));
        c.moveTo(X(cur), Y(cur));
        c.lineTo(X(cur) + (X(rx.to) - X(cur)) * g, Y(cur) + (Y(rx.to) - Y(cur)) * g);
      }
      c.stroke();
    }

    // The route, traced back from the destination.
    if (trace > 0) {
      const segs = path.length - 1;
      const reach = trace * segs;
      c.globalAlpha = 1;
      c.strokeStyle = k.brass;
      c.lineWidth = 2.6;
      c.beginPath();
      c.moveTo(X(path[0]), Y(path[0]));
      for (let i = 1; i <= Math.floor(reach); i++) c.lineTo(X(path[i]), Y(path[i]));
      const fr = reach - Math.floor(reach);
      if (fr > 0 && Math.floor(reach) < segs) {
        const a = path[Math.floor(reach)], b = path[Math.floor(reach) + 1];
        c.lineTo(X(a) + (X(b) - X(a)) * fr, Y(a) + (Y(b) - Y(a)) * fr);
      }
      c.stroke();
    }

    // Nodes.
    const fs = small ? 8 : 9;
    for (let v = 0; v < n; v++) {
      const x = X(v), y = Y(v);
      const settledNow = !!st.settled[v];
      const frontier = !settledNow && Number.isFinite(st.dist[v]);
      const isCur = v === cur;
      const special = v === this.g.source || v === this.target;
      const inRoute = trace > 0 && path.includes(v);
      c.globalAlpha = settledNow || isCur || inRoute || special ? 1 : frontier ? 0.9 : 0.55 * dim + 0.2;

      if (isCur && f > 0) {
        c.strokeStyle = k.brass;
        c.lineWidth = 1;
        c.globalAlpha = (1 - f) * 0.8;
        c.beginPath();
        c.arc(x, y, r * (1 + f * 1.8), 0, Math.PI * 2);
        c.stroke();
        c.globalAlpha = 1;
      }
      c.beginPath();
      c.arc(x, y, special ? r * 1.25 : r, 0, Math.PI * 2);
      c.fillStyle = isCur || (inRoute && trace >= 1) ? k.brass : k.bg;
      c.fill();
      c.lineWidth = settledNow || special ? 1.5 : 1;
      c.strokeStyle = settledNow || frontier || isCur || special ? k.brass : k.faint;
      if (frontier) c.setLineDash([2, 2.5]);
      c.stroke();
      c.setLineDash([]);

      if (special) {
        this.labels.draw(c, v === this.g.source ? "S" : "T", x, y + 0.5, fs + 1, k.mono, isCur || (inRoute && trace >= 1) ? k.bg : k.ink);
      }
      if (Number.isFinite(st.dist[v]) && (settledNow || frontier) && (!small || settledNow)) {
        this.labels.draw(c, String(st.dist[v]), x + r + 3, y - r - 2, fs, k.mono, settledNow ? k.ink : k.faint, "left");
      }
    }
    c.globalAlpha = 1;
  }

  readout() {
    const n = this.g.pts.length;
    const { run } = this.split(this.p);
    const done = Math.min(n, Math.floor(run * n));
    const st = this.states[done];
    const queue = done === 0 ? 1 : this.g.settles[done - 1].queue;
    const known = st.settled[this.target] ? String(this.states[n].dist[this.target]) : "\u221e";
    return { Settled: `${done} / ${n}`, Queue: String(queue), "To T": known };
  }
}

/* -------------------------------------------------------- harmonograph */

export class HarmonographPainter implements Painter {
  private plot: Plotter;
  private p = 0;
  private T: number;
  private slowest: number;
  caption: string;
  constructor(base: HTMLCanvasElement, live: HTMLCanvasElement, seed: number) {
    const pd = pendulums(seed);
    this.plot = new Plotter(base, live, trace(pd));
    this.T = Math.log(9) / Math.min(...pd.d);
    this.slowest = Math.min(...pd.d);
    this.caption = `Harmonograph ${pd.ratio[0]}:${pd.ratio[1]}`;
  }
  fit(size: number) {
    this.plot.fit(size);
  }
  draw(p: number) {
    this.p = p;
    this.plot.drawTo(p * this.plot.total);
  }
  pen() {
    return this.plot.pen();
  }
  readout() {
    const t = this.p * this.T;
    const pen = this.plot.pen();
    const s = (n: number) => {
      const r = Number(n.toFixed(3));
      return (r < 0 ? "−" : "+") + Math.abs(r).toFixed(3);
    };
    return {
      Time: t.toFixed(1).padStart(5, "0"),
      Amplitude: Math.exp(-this.slowest * t).toFixed(3),
      "Pen x": s(pen.nx),
      "Pen y": s(-pen.ny),
    };
  }
}

export type FigureKind = "tree" | "fibonacci" | "calls" | "traversal" | "dijkstra" | "harmonograph";
export type FigureSpec = { kind: FigureKind; seed?: number; depth?: number; order?: number; count?: number };

/** The caption for a figure, without drawing it (safe on the server). */
export function captionFor(spec: FigureSpec): string {
  switch (spec.kind) {
    case "tree":
      return `Recursive tree · depth ${spec.depth ?? 9}`;
    case "fibonacci":
      return "Fibonacci squares";
    case "calls":
      return "Call tree of fib(6)";
    case "traversal":
      return "Breadth-first and depth-first search";
    case "dijkstra":
      return "Dijkstra’s shortest path";
    default: {
      if (spec.seed === undefined) return "Harmonograph";
      const [a, b] = pendulums(spec.seed).ratio;
      return `Harmonograph ${a}:${b}`;
    }
  }
}

export function makePainter(spec: FigureSpec, base: HTMLCanvasElement, live: HTMLCanvasElement): Painter {
  switch (spec.kind) {
    case "tree":
      return new TreePainter(base, spec.seed ?? 4, spec.depth ?? 9);
    case "fibonacci":
      return new FibonacciPainter(base, spec.count ?? 12);
    case "calls":
      return new CallTreePainter(base, 6);
    case "traversal":
      return new TraversalPainter(base);
    case "dijkstra":
      return new DijkstraPainter(base, spec.seed ?? 3);
    default:
      return new HarmonographPainter(base, live, spec.seed ?? 961);
  }
}
