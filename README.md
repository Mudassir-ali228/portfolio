# Mudassir Ali

Personal site and portfolio. Next.js 15, React 19, TypeScript, Tailwind CSS 4,
GSAP with ScrollTrigger, and Lenis for smooth scrolling.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build
npm run lint       # ESLint with Next's core-web-vitals rules
npm run typecheck
```

## Content

All copy lives in `lib/content.ts`: profile, projects, experience, education and
skills. Each project gets a page at `/work/<slug>`, generated at build time and
listed in the sitemap.

Project images go in `public/work/` and are listed with their pixel size:

```ts
{ src: "/work/example.jpg", alt: "What the screenshot shows", w: 1600, h: 900 }
```

`plate.shape` is `"wide"` for a landscape screenshot or `"tall"` for phone
screenshots, which are shown three across. Projects without screenshots can use
a plain-text `diagram` instead.

## Motion

Entrances on page load are CSS keyframes (`.load-*` in `app/globals.css`), so
they start on the first frame. Everything driven by scroll is declared in markup
with a `data-a` attribute and built by `components/motion/MotionProvider.tsx`:

| `data-a` | Effect |
|---|---|
| `chars`, `words` | Split text rises from behind its mask (use `<Split>`) |
| `fade` | Fades and lifts |
| `rule` | A hairline draws from the left |
| `clip` | An image frame wipes open |
| `stagger` | Children fade in one after another |
| `scrub` | Words brighten as the paragraph scrolls (use `<ScrubText>`) |
| `drift` | Moves across its section (`data-x`, `data-y`, `data-rot`) |
| `parallax` | Shifts inside its frame (`data-speed`) |

`data-d` adds a delay. Scroll reveals play on the way down and reverse when the
reader scrolls back up past them. Visitors who prefer reduced motion get the
finished page with no smooth scrolling.

Anything with `data-a` must be in the markup on the first render: the engine
scans the page once per route, so an element mounted later keeps its hidden
starting state.

## Figures

Every drawing on the site is computed by the algorithm it shows. Geometry lives
in `lib/art.ts` (recursive tree, Fibonacci tiling, the call tree of `fib(6)`,
breadth-first and depth-first search, a street graph with Dijkstra) and
`lib/harmonograph.ts` (pendulums, used on two project pages). `lib/painters.ts` draws any of them at any
point in its own time, forwards or backwards, which is what lets scrolling run
a figure and scrolling back unrun it.

- `components/art/Figure.tsx` is a single figure with a caption. Trees and
  pendulum drawings without a fixed seed pick a new curated one on each visit.
- `components/art/Figures.tsx` is the pinned section of four plates, each
  beside the code that draws it and its time and space complexity. The counts
  are what the listed code really does: 25 calls naive and 11 memoised for
  `fib(6)`, the queue and stack after each visit, the heap after each settle.
  Dijkstra is checked against Bellman-Ford in development; tapping a node shows
  its route, since one run finds the shortest route to every node.
- Each project's figure and the one line on why it fits are in
  `lib/content.ts` under `figure`.
- `components/art/Scribble.tsx` draws the brass pen marks.
- Paragraphs marked `data-a="lines"` rise line by line through GSAP SplitText,
  which re-splits them when a resize reflows the text.

Page changes pass under a short curtain (`components/motion/PageTransition.tsx`);
entrances on the arriving page wait for it to lift.

## Dependencies

`package.json` overrides the PostCSS that Next 15 pins internally (8.4.31) with
a patched 8.5 release, which clears the published advisories without moving to
Next 16. If Next is upgraded to a version that ships a patched PostCSS, the
override can go.

## Deployment

Hosted on Vercel. Set `NEXT_PUBLIC_SITE_URL` to the production domain (for
example `https://example.com`) so canonical URLs, the sitemap and social
previews use it. Without it the build falls back to the Vercel project URL.

## Social card

`app/opengraph-image.png` and `app/twitter-image.png` are screenshots of
`/og-preview` at 1200 x 630. That route only renders in development.
