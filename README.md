# Mudassir Ali — Portfolio

A portfolio site for a software engineer who works on telecom billing, ISP log
pipelines and real-time CRM systems, and writes Unity engines for fun.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build && npm start
```

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (tokens declared in `app/globals.css`) |
| Motion | CSS only — no runtime motion library |
| Type | Fraunces, Instrument Sans, JetBrains Mono via `next/font` |
| Hosting | Vercel (zero config) |

## Where the content lives

**Everything editorial is in [`lib/content.ts`](lib/content.ts)** — profile, projects,
case studies, experience, capabilities, principles. Change a project's copy there and
both the home page and its case-study page follow. No content is hard-coded in
components.

Adding a project: append to `projects`. Give it a `study` object and it gets its own
page at `/work/<slug>` plus a sitemap entry, both generated at build time. All ten
projects currently have one. A project with both a `study` and an `href` links to the
write-up from the index and carries the live link inside it — the write-up says more,
and sending someone straight out of the site loses them. `note` is
an optional dry aside — better left off than forced.

**Images go through `plate`**, which is aspect-aware:
`plate: { shape: "wide" | "tall", images: [...] }`. `wide` is a web screenshot and
fills the 16:9 plate; `tall` is phone screenshots, shown three across inside it,
because cropping a 1:2.2 screen into 16:9 throws the screen away and letterboxing one
wastes two thirds of the plate. A project with no `plate` falls back to its ASCII
`diagram`, then to a typographic card. `accentImages` feeds the case-study gallery,
which switches to a three-column portrait grid when the plate is `tall`.

Source screenshots live in `.screenshots-source/` — gitignored and outside `public/`,
so 11MB of originals never reach the build. Crop the browser chrome off web
screenshots before they go into `public/work/`; there is a detector in the session
history, but by eye is fine.

## Layout

The page is one masthead and five sections, and it is deliberately short: about
5,200px at desktop, down from ~7,800 before the redesign.

**The work index is the centrepiece.** All ten projects sit in a single list; pointing
at a row swaps the panel beside it, so the whole body of work can be browsed without a
page load or a scroll. That replaced five tall featured rows followed by five short
archive rows, which said less in twice the height. Below `lg` the panel is dropped
entirely — a preview you cannot hover is just something in the way — and each row
carries its own summary instead.

About and How-I-Work were merged into one Profile section (the story, and the rules it
produced) and Experience, Education and the side projects into one Track record. They
answer the same questions; they read better adjacent than stacked.

## Design notes

The palette is a single accent — brass — over warm near-black or bone paper. It is
spent sparingly so it still means something by the bottom of the page. Both themes
are defined as CSS custom properties on `:root` / `:root[data-theme="light"]`; a tiny
inline script in `app/layout.tsx` sets the theme before first paint so neither theme
flashes.

`components/RidgeField.tsx` draws the hero's topographic field on a canvas: each row
is a polyline whose height is a sum of sines, filled with the page background before
it is stroked so the row in front occludes the one behind. It reads its colours from
the CSS variables and repaints when the theme changes. Under
`prefers-reduced-motion` it draws one static frame and stops, and it pauses entirely
when scrolled out of view or when the tab is hidden.

## Performance

Two things were measured and fixed, and both are easy to undo by accident:

**The canvas fills a band, not a shape closed to the bottom of the viewport.** The
first version closed each row's path to the canvas floor, which meant roughly
seventeen full-screen fills per frame — the home page ran at **5fps** (200ms frames)
while every other page sat at 60. A row can only be overlapped by the handful of rows
immediately behind it, so `OCCLUSION_ROWS` deep is all the fill that is needed. The
canvas also ignores device pixel ratio, caps its backing store at `MAX_RENDER_W` and
runs at 24fps — the drift takes tens of seconds to cross the screen, and a 4K display
should not pay four times the fill cost for a texture at 5–29% opacity. Frame time
went 200ms → 16.7ms.

**Nothing animates in JavaScript.** A JS animation cannot start until React hydrates,
so the hero headline — the LCP element — was landing at **1.86s**. `.line-rise` and
`.fade-up` in `globals.css` start on the browser's first painted frame instead. LCP is
now ~200ms on the home page and ~110ms on a case study. The same trap caught the
case-study masthead and its metric tiles; if you add a reveal above the fold anywhere,
re-measure LCP.

**Scroll reveals are one observer, not sixty components.** Every reveal on the site is
a `data-reveal` attribute, a handful of CSS rules, and the single
`IntersectionObserver` in `components/RevealObserver.tsx`. It replaced ~60 individual
framer-motion components, which took the home page's first-load JS from **172kB to
125kB** and let the motion library be dropped entirely. `Reveal`, `Stagger`,
`StaggerItem`, `GrowRule` and `MaskLines` are now plain server components that emit
markup and nothing else.

The hidden state is scoped to a `.reveal-ready` class that an inline script adds, so
with JavaScript disabled — or under `prefers-reduced-motion` — nothing is ever hidden.
Verified: 0 stuck hidden, in all three modes.

**The observer marks revealed elements with a `data-in` attribute, not a class.** This
is not a style preference. React owns `className`, and it rewrites it wholesale on
re-render — so any class added imperatively is silently dropped the next time that
component's props change. It cost an afternoon: hovering a work row re-rendered its
`<li>`, React overwrote the class, and the row vanished mid-list. React never touches
attributes it does not render, so `data-in` survives. Do not turn it back into a
class.

**The nav does not use `backdrop-filter` unconditionally.** A full-width blur
re-rasterises on every scroll frame and is the first thing to stutter on integrated
graphics. It is behind an `@supports` with a translucent fallback, at a radius small
enough to be cheap.

Fonts are 135kB for three variable families — the largest thing the page downloads.
Fraunces is requested with only the `WONK` and `opsz` axes; adding `SOFT` back costs
about 50kB for an axis the CSS pins to its default anyway.

Measured with a 4x CPU throttle at 1440px, 2560px and on a 6x-throttled phone
viewport, scrolling holds a 16.7ms median frame throughout.

## Responsive

Breakpoints are `sm` 640 / `md` 768 / `lg` 1024. **The dense twelve-column layouts
start at `lg`, not `md`.** Between 768 and 1023 — iPad portrait, small laptops in a
split window — twelve columns leaves the project blurbs four words wide. Everything in
that range gets the comfortable stacked layout instead, and the row metadata that sits
in a right-hand column on desktop moves up beside the index number.

Checked for horizontal overflow at 320, 360, 390, 414, 640, 768, 834, 1024, 1280,
1440, 1920 and 2560: zero at every width.

## Naming and domain

Client work is named generically on purpose — **Company's Voice Portal**, **RTP
Logger**, **Company's CRM** — and the case studies say "the client" rather than naming
anyone. Keep it that way when editing: the technical substance is the point, the
client's identity is not ours to publish.

The site is also deliberately **not positioned around one industry**. The work happens
to include billing, log pipelines and real-time dashboards, but the framing is
"production systems where the details are load-bearing", not a sector. Section copy,
the marquee and the capability group headers are all domain-neutral; specific
protocols appear only where they are a genuine skill, under "Protocols &
integration".

## Voice

The copy is meant to sound like one person wrote it, on a day when they were paying
attention. Dry rather than jokey: the aside lands once per section at most, and never
in place of the actual information. Contact links are grouped under labels a human
would use — "Where the code lives", "The formal version" — which is the one place the
tone is allowed to be obvious.

If you edit copy, the test is whether it would survive being read aloud to the person
who is about to interview you.

## The social card

`app/opengraph-image.png` is a static file, captured from `/og-preview` — a scaffolding
route that renders the card at 1200x630 using the site's real fonts. Generating it at
build time with `next/og` would have meant fetching a font on every build; a checked-in
PNG cannot fail. To regenerate after a copy change, run the site, screenshot
`#og-card` from that route at 1200x630, and overwrite `app/opengraph-image.png` and
`app/twitter-image.png`.

## Deploying

Push to a Git remote and import the repo at [vercel.com/new](https://vercel.com/new) —
the defaults are correct. If you attach a custom domain, set `NEXT_PUBLIC_SITE_URL` to
it in the Vercel project settings; `lib/site.ts` feeds that one value to the canonical
URL, the sitemap and robots.txt.

## The CV

`public/Mudassir-Ali-CV.pdf` is what the site links to, and every CV link on the site
opens it in a new tab rather than downloading it — a PDF opens in the browser's own
viewer, which is what someone skimming applications actually wants, and the viewer
still offers them the download.

The .docx is the artifact you edit, in Word, and `public/Mudassir-Ali-CV.pdf` is what
gets served. To update: change the .docx, export to PDF from Word, and replace the file
in `public/` under the same name. Nothing in the code needs touching.

**The template is generated**, because hand-building small-caps headings with rules and
right-flushed tab stops in Word is miserable. `scripts/make-cv.py` writes the whole
.docx — Skills first, small-caps section headings with a rule beneath, two-column
entries, dot bullets under Experience and asterisk bullets under Projects, Education
last. Bullet text takes `**bold**` markers for the terms a skim-reader is looking for.
Content lives in dicts at the top of that file.

`scripts/cv-preview.py` renders the same content to a PDF through Chrome. It exists
because **QuickLook does not render tab stops**, so a two-column resume looks broken in
Finder's preview even when the file is correct — the preview is how you actually check
the layout without opening Word.

```bash
python3 scripts/make-cv.py ~/Downloads/Mudassir_CV.docx   # needs python-docx
python3 scripts/cv-preview.py /tmp/preview.pdf            # look before you export
```
# portfolio
