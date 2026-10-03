/**
 * A harmonograph is a drawing machine: a pen moved by two damped pendulums on
 * each axis. Every figure on the site comes from these few lines.
 *
 *   x(t) = sin(f1 t + p1) e^(-d1 t) + sin(f2 t + p2) e^(-d2 t)
 *   y(t) = sin(f3 t + p3) e^(-d3 t) + sin(f4 t + p4) e^(-d4 t)
 */

/** Seeds picked by eye from a few hundred candidates. */
export const SEEDS = [
  7, 166, 219, 325, 590, 643, 696, 749, 961, 1067, 1226, 1279, 1385, 1491, 1544, 1703, 1809,
];

const RATIOS: [number, number][] = [[2, 3], [3, 2], [1, 3], [3, 1], [2, 5], [3, 4], [1, 2]];

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Pendulums = {
  ratio: [number, number];
  f: number[];
  p: number[];
  d: number[];
};

export function pendulums(seed: number): Pendulums {
  const r = mulberry32(seed);
  const [a, b] = RATIOS[Math.floor(r() * RATIOS.length)];
  const detune = () => (r() - 0.5) * 0.02;
  const d = 0.007 + r() * 0.007;
  return {
    ratio: [a, b],
    f: [a + detune(), b + detune(), a + detune(), b + detune()],
    p: [r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2, r() * Math.PI * 2],
    d: [d, d * (0.8 + r() * 0.4), d, d * (0.8 + r() * 0.4)],
  };
}

/** How long the pen stays down: until the slowest swing has decayed to about
 *  a ninth of where it began. */
export function span({ d }: Pendulums) {
  return Math.log(9) / Math.min(...d);
}

/** The pen's path, as interleaved x,y pairs normalised to [-1, 1]. */
export function trace(pd: Pendulums, samplesPerCycle = 36): Float32Array {
  const { f, p, d } = pd;
  const T = span(pd);
  const cycles = (T * Math.max(...f)) / (2 * Math.PI);
  const n = Math.min(12000, Math.ceil(cycles * samplesPerCycle));
  const out = new Float32Array((n + 1) * 2);
  let max = 0;
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * T;
    const x = Math.sin(f[0] * t + p[0]) * Math.exp(-d[0] * t) + Math.sin(f[1] * t + p[1]) * Math.exp(-d[1] * t);
    const y = Math.sin(f[2] * t + p[2]) * Math.exp(-d[2] * t) + Math.sin(f[3] * t + p[3]) * Math.exp(-d[3] * t);
    out[i * 2] = x;
    out[i * 2 + 1] = y;
    max = Math.max(max, Math.abs(x), Math.abs(y));
  }
  for (let i = 0; i < out.length; i++) out[i] /= max;
  return out;
}
