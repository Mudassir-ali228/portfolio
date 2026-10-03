/**
 * Draws a harmonograph trace onto two stacked canvases.
 *
 * Ink is committed to the base canvas in fixed chunks of segments, so lines
 * that cross build up the same density however the drawing got there. The
 * unfinished tail since the last chunk lives on the live canvas, which is
 * cleared every frame, so the ink always reaches the pen exactly.
 * Moving backwards repaints the base up to the new point: time can run in
 * either direction.
 */
const CHUNK = 24;

export class Plotter {
  private base: CanvasRenderingContext2D;
  private live: CanvasRenderingContext2D;
  private committed = 0;
  private at = 0;
  private size = 0;
  private dpr = 1;
  readonly total: number;

  constructor(
    private baseCanvas: HTMLCanvasElement,
    private liveCanvas: HTMLCanvasElement,
    private pts: Float32Array,
  ) {
    this.base = baseCanvas.getContext("2d")!;
    this.live = liveCanvas.getContext("2d")!;
    this.total = pts.length / 2 - 1;
  }

  /** Match the canvases to their box and repaint what was drawn. */
  fit(size: number) {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.size = size;
    for (const c of [this.baseCanvas, this.liveCanvas]) {
      c.width = Math.round(size * this.dpr);
      c.height = Math.round(size * this.dpr);
    }
    this.repaint();
  }

  repaint() {
    const at = this.at;
    this.committed = 0;
    this.at = 0;
    this.base.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
    this.drawTo(at);
  }

  /** Where the pen is, in CSS pixels from the top left of the box. */
  pen(at = this.at) {
    const i = Math.min(Math.floor(at), this.total - 1);
    const f = Math.min(at - i, 1);
    const x = this.pts[i * 2] + (this.pts[i * 2 + 2] - this.pts[i * 2]) * f;
    const y = this.pts[i * 2 + 1] + (this.pts[i * 2 + 3] - this.pts[i * 2 + 1]) * f;
    return { nx: x, ny: y, x: this.px(x), y: this.px(y) };
  }

  /** Draw from the start of the trace up to `at`, a fractional sample index. */
  drawTo(at: number) {
    at = Math.max(0, Math.min(at, this.total));
    const whole = Math.floor(at);
    const chunkEnd = at >= this.total ? this.total : Math.floor(whole / CHUNK) * CHUNK;

    if (chunkEnd < this.committed) {
      this.base.clearRect(0, 0, this.baseCanvas.width, this.baseCanvas.height);
      this.committed = 0;
    }
    if (chunkEnd > this.committed) {
      this.stroke(this.base, this.committed, chunkEnd, true);
      this.committed = chunkEnd;
    }

    this.live.clearRect(0, 0, this.liveCanvas.width, this.liveCanvas.height);
    if (at > chunkEnd) this.stroke(this.live, chunkEnd, at, false);
    this.at = at;
  }

  private px(v: number) {
    return this.size / 2 + v * (this.size / 2) * 0.96;
  }

  private stroke(ctx: CanvasRenderingContext2D, from: number, to: number, chunked: boolean) {
    const root = document.documentElement;
    const brass = getComputedStyle(root).getPropertyValue("--brass").trim() || "#d9a441";
    ctx.save();
    ctx.scale(this.dpr, this.dpr);
    ctx.strokeStyle = brass;
    ctx.globalAlpha = root.dataset.theme === "light" ? 0.5 : 0.42;
    ctx.lineWidth = 0.7;
    ctx.lineJoin = "round";
    const step = chunked ? CHUNK : Infinity;
    for (let s = from; s < to; s += step) {
      const e = Math.min(s + step, to);
      ctx.beginPath();
      ctx.moveTo(this.px(this.pts[s * 2]), this.px(this.pts[s * 2 + 1]));
      const last = Math.floor(e);
      for (let i = s + 1; i <= last; i++) ctx.lineTo(this.px(this.pts[i * 2]), this.px(this.pts[i * 2 + 1]));
      if (e > last) {
        const p = this.pen(e);
        ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
    }
    ctx.restore();
  }
}
