/**
 * Geometry for the site's figures. Each is computed by the algorithm it
 * depicts; nothing here is drawn by hand. Coordinates are normalised to a
 * [-1, 1] box with y pointing down, and every generator is deterministic for
 * a given seed.
 */

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ---------------------------------------------------------------- tree */

/** Trees picked by eye from a few hundred candidates. */
export const TREE_SEEDS = [4, 22, 31, 34, 37, 43, 58, 64, 67, 82, 85, 88, 109, 112, 136, 142];

export type Tree = { segs: Float32Array; depth: number; count: number };

/**
 * branch(x, y, angle, length): draw a line, then call branch twice from its
 * end, a little shorter and turned either way, until the depth runs out.
 * Segments are stored as x1, y1, x2, y2, depth.
 */
export function tree(seed: number, depth = 9): Tree {
  const r = rng(seed);
  const spread = 0.24 + r() * 0.22;
  const ratio = 0.68 + r() * 0.08;
  const bias = (r() - 0.5) * 0.5; // favours one side, the way real trees do
  const lift = 0.04 + r() * 0.1; // and reaches back toward the light
  const lean = (r() - 0.5) * 0.14;
  const up = -Math.PI / 2;
  const out: number[] = [];

  const branch = (x: number, y: number, a: number, len: number, d: number) => {
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    out.push(x, y, x2, y2, d);
    if (d >= depth) return;
    if (d > 3 && r() < 0.07) return; // the odd branch simply stops
    let left = a - spread * (1 + bias) * (0.65 + r() * 0.7);
    let right = a + spread * (1 - bias) * (0.65 + r() * 0.7);
    left += (up - left) * lift;
    right += (up - right) * lift;
    branch(x2, y2, left, len * ratio * (0.85 + r() * 0.3), d + 1);
    branch(x2, y2, right, len * ratio * (0.85 + r() * 0.3), d + 1);
  };
  branch(0, 0, up + lean, 1, 0);

  // Fit into the box: tallest or widest side spans 1.9, base on the floor.
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < out.length; i += 5) {
    for (const [x, y] of [[out[i], out[i + 1]], [out[i + 2], out[i + 3]]]) {
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    }
  }
  const s = 1.9 / Math.max(maxX - minX, maxY - minY);
  const cx = (minX + maxX) / 2;
  const segs = new Float32Array(out.length);
  for (let i = 0; i < out.length; i += 5) {
    segs[i] = (out[i] - cx) * s;
    segs[i + 1] = 0.96 + (out[i + 1] - maxY) * s;
    segs[i + 2] = (out[i + 2] - cx) * s;
    segs[i + 3] = 0.96 + (out[i + 3] - maxY) * s;
    segs[i + 4] = out[i + 4];
  }
  return { segs, depth, count: out.length / 5 };
}

/* ----------------------------------------------------------- fibonacci */

export type Square = { x: number; y: number; s: number; cx: number; cy: number; a0: number; a1: number };
export type Box = { x0: number; y0: number; x1: number; y1: number };

/**
 * The Fibonacci tiling: each square is as wide as the two before it put
 * together, laid right, up, left and down in turn. A quarter circle through
 * each one makes the golden spiral. `boxes[i]` bounds squares 0..i.
 */
export function fibonacci(count = 12) {
  const F = [1, 1];
  while (F.length < count) F.push(F[F.length - 1] + F[F.length - 2]);
  const squares: Square[] = [];
  const boxes: Box[] = [];
  let b: Box = { x0: 0, y0: 0, x1: 1, y1: 1 };
  const Q = Math.PI / 2;
  // First square: the spiral enters at its top-left and leaves bottom-right.
  squares.push({ x: 0, y: 0, s: 1, cx: 1, cy: 0, a0: Math.PI, a1: Q });
  boxes.push({ ...b });
  for (let i = 1; i < count; i++) {
    const s = F[i];
    let sq: Square;
    switch ((i - 1) % 4) {
      case 0: // right; centre top-left
        sq = { x: b.x1, y: b.y0, s, cx: b.x1, cy: b.y0, a0: Q, a1: 0 };
        break;
      case 1: // up; centre bottom-left
        sq = { x: b.x0, y: b.y0 - s, s, cx: b.x0, cy: b.y0, a0: 0, a1: -Q };
        break;
      case 2: // left; centre bottom-right
        sq = { x: b.x0 - s, y: b.y0, s, cx: b.x0, cy: b.y0 + s, a0: -Q, a1: -Math.PI };
        break;
      default: // down; centre top-right
        sq = { x: b.x0, y: b.y1, s, cx: b.x0 + s, cy: b.y1, a0: Math.PI, a1: Q };
    }
    squares.push(sq);
    b = {
      x0: Math.min(b.x0, sq.x), y0: Math.min(b.y0, sq.y),
      x1: Math.max(b.x1, sq.x + s), y1: Math.max(b.y1, sq.y + s),
    };
    boxes.push({ ...b });
  }
  return { F, squares, boxes };
}

/* ----------------------------------------------------------- call tree */

export type Call = {
  n: number;
  depth: number;
  parent: number;
  x: number;
  y: number;
  /** Still made once answers are remembered. */
  keep: boolean;
  /** Answered from memory rather than recomputed. */
  hit: boolean;
};

/**
 * Every call naive recursive fib(n) makes, in the order it makes them (so
 * index = execution order), laid out as a tree. With memoisation only the
 * leftmost chain recurses; each chain call's second child becomes a lookup.
 */
export function callTree(n = 6) {
  const calls: Call[] = [];
  const chain = new Set<number>();
  const visit = (k: number, depth: number, parent: number, onChain: boolean) => {
    const id = calls.length;
    const parentOnChain = parent >= 0 && chain.has(parent);
    calls.push({ n: k, depth, parent, x: 0, y: 0, keep: onChain || parentOnChain, hit: false });
    if (onChain) chain.add(id);
    if (!onChain && parentOnChain) calls[id].hit = k >= 2;
    if (k >= 2) {
      visit(k - 1, depth + 1, id, onChain);
      visit(k - 2, depth + 1, id, false);
    }
    return id;
  };
  visit(n, 0, -1, true);

  // x from leaf order, parents centred over children; y by depth.
  const kids = calls.map(() => [] as number[]);
  calls.forEach((c, i) => c.parent >= 0 && kids[c.parent].push(i));
  const leaves = calls.filter((_, i) => kids[i].length === 0).length;
  let leaf = 0;
  const maxDepth = Math.max(...calls.map((c) => c.depth));
  const place = (i: number): number => {
    const c = calls[i];
    c.y = -0.82 + (c.depth / maxDepth) * 1.64;
    c.x = kids[i].length === 0
      ? -0.9 + (leaf++ / (leaves - 1)) * 1.8
      : kids[i].map(place).reduce((a, b) => a + b, 0) / kids[i].length;
    return c.x;
  };
  place(0);
  return { calls, kept: calls.filter((c) => c.keep).length };
}

/* ----------------------------------------------------------- traversal */

export type TreeNode = { label: string; x: number; y: number; parent: number; children: number[] };
export type Walk = { order: number[]; frontier: number[][] };

/**
 * A complete binary tree of 15 nodes, searched by one loop two ways:
 *
 *   while (frontier.length) {
 *     const node = bfs ? frontier.shift() : frontier.pop();
 *     visit(node);
 *     frontier.push(...node.children);
 *   }
 *
 * `frontier[k]` is the list after the k-th visit, exactly as the loop holds it.
 */
export function traversal() {
  const nodes: TreeNode[] = [];
  for (let i = 0; i < 15; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const first = (1 << level) - 1;
    const across = 1 << level;
    nodes.push({
      label: String.fromCharCode(65 + i),
      x: ((i - first + 0.5) / across) * 2 - 1,
      y: level / 3,
      parent: i === 0 ? -1 : Math.floor((i - 1) / 2),
      children: 2 * i + 2 < 15 ? [2 * i + 1, 2 * i + 2] : [],
    });
  }
  const walk = (bfs: boolean): Walk => {
    const frontier = [0];
    const order: number[] = [];
    const states: number[][] = [];
    while (frontier.length) {
      const node = bfs ? frontier.shift()! : frontier.pop()!;
      order.push(node);
      frontier.push(...nodes[node].children);
      states.push([...frontier]);
    }
    return { order, frontier: states };
  };
  return { nodes, bfs: walk(true), dfs: walk(false) };
}

/* ------------------------------------------------------------ dijkstra */

export type Edge = { a: number; b: number; w: number };
export type Settle = { node: number; dist: number; relaxed: { to: number; dist: number }[]; queue: number };

/**
 * A street-like weighted graph: a jittered grid, mostly joined to its
 * neighbours with a few diagonals, weights from the drawn lengths. Dijkstra
 * runs on it exactly as listed beside the figure (a binary heap with lazy
 * deletion), and every settle is recorded so the drawing can replay it.
 */
export function roads(seed: number, cols = 6, rows = 5) {
  const r = rng(seed);
  const pts: { x: number; y: number }[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++)
      pts.push({
        x: -0.82 + (i / (cols - 1)) * 1.64 + (r() - 0.5) * 0.2,
        y: -0.8 + (j / (rows - 1)) * 1.6 + (r() - 0.5) * 0.2,
      });
  const id = (i: number, j: number) => j * cols + i;
  const edges: Edge[] = [];
  const add = (a: number, b: number) => {
    const w = Math.max(1, Math.round(Math.hypot(pts[a].x - pts[b].x, pts[a].y - pts[b].y) * 11));
    edges.push({ a, b, w });
  };
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      // Grid streets, a few closed; the odd diagonal cut-through.
      if (i < cols - 1 && (r() > 0.12 || j === 0 || j === rows - 1)) add(id(i, j), id(i + 1, j));
      if (j < rows - 1 && (r() > 0.12 || i === 0 || i === cols - 1)) add(id(i, j), id(i, j + 1));
      if (i < cols - 1 && j < rows - 1 && r() < 0.3) {
        if (r() < 0.5) add(id(i, j), id(i + 1, j + 1));
        else add(id(i + 1, j), id(i, j + 1));
      }
    }
  const adj: [number, number][][] = pts.map(() => []);
  for (const e of edges) {
    adj[e.a].push([e.b, e.w]);
    adj[e.b].push([e.a, e.w]);
  }
  const source = id(0, 1);
  const target = id(cols - 1, rows - 2);
  return { pts, edges, adj, source, target, ...dijkstra(adj, source) };
}

/** Binary-heap Dijkstra with lazy deletion, recording each settle. */
export function dijkstra(adj: [number, number][][], s: number) {
  const n = adj.length;
  const dist = new Array<number>(n).fill(Infinity);
  const prev = new Array<number>(n).fill(-1);
  const heap: [number, number][] = [];
  const push = (item: [number, number]) => {
    heap.push(item);
    for (let i = heap.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (heap[p][0] <= heap[i][0]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, rr = l + 1;
        let m = i;
        if (l < heap.length && heap[l][0] < heap[m][0]) m = l;
        if (rr < heap.length && heap[rr][0] < heap[m][0]) m = rr;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };

  const settles: Settle[] = [];
  dist[s] = 0;
  push([0, s]);
  while (heap.length) {
    const [d, u] = pop();
    if (d > dist[u]) continue;
    const relaxed: { to: number; dist: number }[] = [];
    for (const [v, w] of adj[u]) {
      if (d + w < dist[v]) {
        dist[v] = d + w;
        prev[v] = u;
        push([dist[v], v]);
        relaxed.push({ to: v, dist: dist[v] });
      }
    }
    settles.push({ node: u, dist: d, relaxed, queue: heap.length });
  }
  return { dist, prev, settles };
}

/** The route from the source to `t`, following prev pointers back. */
export function route(prev: number[], t: number) {
  const path: number[] = [];
  for (let v = t; v !== -1; v = prev[v]) path.unshift(v);
  return path;
}
