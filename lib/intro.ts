/**
 * The home page's opening, shared by the server-rendered type and the tree
 * drawn in the browser so the two keep time. In seconds from the first frame.
 *
 * The tree grows one level every LEVEL seconds from TRUNK. The name's letters
 * arrive in the same recursive order: the middle letter with the trunk, the
 * middles of each half with the first fork, and so on down.
 */
export const TRUNK = 0.35;
export const LEVEL = 0.22;
export const LEVELS = 10;

/** Each letter's depth when the name is split in half, then each half in half. */
export function splitDepths(n: number) {
  const depth = new Array<number>(n).fill(0);
  const split = (lo: number, hi: number, d: number) => {
    if (lo > hi) return;
    const mid = (lo + hi) >> 1;
    depth[mid] = d;
    split(lo, mid - 1, d + 1);
    split(mid + 1, hi, d + 1);
  };
  split(0, n - 1, 0);
  return depth;
}
