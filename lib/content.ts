export const profile = {
  name: "Mudassir Ali",
  first: "Mudassir",
  last: "Ali",
  role: "Software Engineer",
  location: "Lahore, Pakistan",
  timezone: "Asia/Karachi",
  available: "Open to roles",
  email: "amudassir4321@gmail.com",
  phone: "+92 309 0477778",
  linkedin: "https://linkedin.com/in/mudassir-ali",
  github: "https://github.com/Mudassir-ali228",
  cv: "/Mudassir-Ali-CV.pdf",
  tagline:
    "I build production systems where the details are load-bearing — and, after hours, game engines where the details are the whole point.",
  intro: [
    "Rating engines that have to foot to the penny. Log pipelines that cannot drop a row. A dashboard someone is watching while they decide something. Most of my working week goes to systems that have a wrong answer, and I have come to prefer them.",
    "Evenings go on game engines, which is the same problem in a better costume — a city that streams without hitching, a runner whose every generated layout has to be survivable. Nothing teaches you a system like building one from nothing.",
  ],
  /** Scannable substance for the person who reads two paragraphs and skips to
   *  the facts. Keep it to things that are true and checkable. */
  facts: [
    { k: "Status", v: "Graduated June 2026" },
    { k: "Degree", v: "BS Software Engineering, COMSATS" },
    { k: "Focus", v: "Backend & distributed systems" },
    { k: "Also", v: "Unity engines, cross-platform mobile" },
  ],
};

export type Metric = { value: string; label: string };

export type Project = {
  slug: string;
  index: string;
  title: string;
  kind: string;
  period: string;
  context: "Professional" | "Independent" | "Academic";
  blurb: string;
  /** A dry aside. Optional, and better left off than forced. */
  note?: string;
  stack: string[];
  featured?: boolean;
  /** What fills the index plate. `tall` means phone screenshots, which are
   *  shown two or three across rather than cropped into a 16:9 box. */
  plate?: { shape: "wide" | "tall"; images: { src: string; alt: string }[] };
  accentImages?: { src: string; alt: string }[];
  diagram?: string[];
  href?: string;
  study?: {
    problem: string;
    approach: string[];
    decisions: { title: string; body: string }[];
    metrics: Metric[];
  };
};

export const projects: Project[] = [
  {
    slug: "voice-portal",
    index: "01",
    title: "Company's Voice Portal",
    kind: "Billing & invoicing platform",
    period: "2026",
    context: "Professional",
    featured: true,
    blurb:
      "Meters usage, prices it against per-client rate plans, and prints an invoice the finance team already knows how to read.",
    note: "I now hold strong views on pulse rounding. This was not the plan.",
    stack: ["React", "Vite", "Tailwind", "Node.js", "Express", "MySQL", "PDFKit"],
    diagram: [
      "provider API ──▶ sync ──▶ rating ──▶ invoice.pdf",
      "                  │         │",
      "             rate plans   units · tax · arrears",
    ],
    study: {
      problem:
        "The client was invoicing by hand. Usage and per-client rate plans lived in one system; line rent, tax numbers and arrears lived in a spreadsheet; the bill itself was assembled in a word processor. Every month the three drifted apart, and nobody could say with confidence why a total was what it was.",
      approach: [
        "Mirror the upstream. A sync pulls accounts, destinations, per-client rate plans and live service status from the provider API and refreshes its own token, so nobody ever pastes a credential.",
        "Rate against the client's own plan, not a global card. The portal layers line rent, add-ons, subscriptions and an ordered tax chain on top, plus a per-client override for the rare destination a plan misses.",
        "Print the bill they already have. The PDF reproduces their existing layout column for column, so the change was invisible to their customers — which is the highest praise a billing migration gets.",
      ],
      decisions: [
        {
          title: "Pulse size is per destination, per client",
          body: "The API returns billing increments as strings like \"30s\", and clients genuinely differ — some bill in 30-second steps, some in 60. Parsing that wrong halves or doubles every unit on the invoice, so it is resolved per destination rather than assumed once.",
        },
        {
          title: "A destination with no rate is flagged, never guessed",
          body: "An earlier global rate card seeded itself with the dearest cost found across every client's plan, which quietly billed some clients at worst-case rates. It was removed. An unpriced destination now charges nothing and is flagged on both the invoice and the usage export — a visible gap beats a plausible wrong number.",
        },
        {
          title: "Arrears carry forward without compounding",
          body: "An invoice's own total never includes its arrears, and arrears sit outside the tax chain — that money was already taxed on the invoice it came from. Rounding happens at each destination line rather than once at the end, which is what makes the printed columns foot against the previous-invoices table.",
        },
      ],
      metrics: [
        { value: "100%", label: "of a month's charges traced to the client's own plan" },
        { value: "0", label: "fallback rates — unpriced destinations are flagged" },
        { value: "1", label: "click from sync to a finished, issued invoice" },
      ],
    },
  },
  {
    slug: "rtp-logger",
    index: "02",
    title: "RTP Logger",
    kind: "High-volume log analytics",
    period: "2026",
    context: "Professional",
    featured: true,
    blurb:
      "Two high-volume feeds landing in one searchable table, on hardware that could never have run Elasticsearch.",
    stack: ["NestJS", "ClickHouse", "Prisma", "React", "Vector", "goflow2", "Docker"],
    diagram: [
      "text    udp/1514 ──▶ Vector  ─┐",
      "                              ├─▶ ClickHouse ──▶ NestJS ──▶ React",
      "binary  udp/2055 ──▶ goflow2 ─┘",
    ],
    study: {
      problem:
        "The client was running Elasticsearch and Logstash on a box that could not really afford either. Two feeds mattered and only one was usable: one carried the rule context, the other carried the volume, and nothing joined them.",
      approach: [
        "Two feeds, one table. A text feed arrives on UDP 1514 and is parsed by Vector; a binary feed arrives on UDP 2055, is decoded by goflow2 and parsed by Vector too. Both land in ClickHouse tagged by source, so they can be searched together or filtered apart.",
        "Keep the old stack alive during the switch. The new collector listens on 1514 rather than the default port, so the incumbent on the same network was never touched while the replacement was proven.",
        "Ship it twice. Docker Compose for the developer, and a native systemd + Nginx deployment for the site that could not take a Docker dependency.",
      ],
      decisions: [
        {
          title: "ClickHouse for logs, SQLite for people",
          body: "Log rows are append-only, enormous and queried by time range — a columnar store answers that in milliseconds. Users, roles and sessions are small, relational and transactional, so they live in SQLite behind Prisma. Using one engine for both would have made one of the two jobs worse.",
        },
        {
          title: "A binary feed fails silently, which is the worst way to fail",
          body: "Pointed at the text port, a binary frame is rejected at the decoder and dropped — no error, no row, nothing in the table. Giving it its own collector and port turned an invisible failure into a visible one.",
        },
        {
          title: "Argon2 and short-lived tokens by default",
          body: "The app ships with a first-run admin and refuses to start on the default secret. For a box sitting inside somebody else's network, the safe default has to be the one you get when nobody reads the manual.",
        },
      ],
      metrics: [
        { value: "2", label: "protocols, text and binary, in one searchable table" },
        { value: "0", label: "Elasticsearch or Logstash nodes required" },
        { value: "4 GB", label: "memory ceiling the whole stack runs inside" },
      ],
    },
  },
  {
    slug: "company-crm",
    index: "03",
    title: "Company's CRM",
    kind: "Multi-tenant SaaS",
    period: "2025 — 26",
    context: "Professional",
    featured: true,
    blurb:
      "A multi-tenant CRM welded to a live call-centre floor, with wallboards that tell a supervisor the truth in real time.",
    stack: ["Express", "Prisma", "PostgreSQL", "Redis", "Socket.IO", "React", "Redux Toolkit"],
    diagram: [
      "third-party DB ─┐",
      "                ├─▶ Redis ──▶ Socket.IO ──▶ wallboard",
      "live event feed ┘",
    ],
    study: {
      problem:
        "Two systems that did not know about each other. Agents worked leads in one and took calls in the other; supervisors reconstructed the floor's state after the fact, from reports, when what they needed was to see it happening.",
      approach: [
        "Read the other system where it lives. Its own MySQL database and management interface are the source of truth for live state — the CRM reads them rather than trying to own them.",
        "Push, don't poll. Live agent state is cached in Redis and pushed to wallboards over Socket.IO, with the Redis adapter so it survives more than one API process.",
        "Scope everything to an organisation. Multi-tenancy is rooted at the organisation model, and permission middleware gates every protected route rather than each handler remembering to.",
      ],
      decisions: [
        {
          title: "Three data stores, each for what it is good at",
          body: "PostgreSQL via Prisma for the application, MySQL read-only for the third-party schema, Redis for live state and socket fan-out. Adding a migration to somebody else's database would have been the fastest available way to break their product.",
        },
        {
          title: "Duration is derived, not stored",
          body: "Wallboards track how long an agent has been in a state from a single timestamp rather than a running counter, so a reconnect or a missed tick cannot drift the number a supervisor is watching.",
        },
      ],
      metrics: [
        { value: "3", label: "data stores held consistent under one API" },
        { value: "Live", label: "agent state, pushed rather than polled" },
        { value: "Org-scoped", label: "access enforced in middleware, not per route" },
      ],
    },
  },
  {
    slug: "i-drive",
    index: "04",
    title: "I Drive",
    kind: "Open-world driving game",
    period: "2026",
    context: "Independent",
    featured: true,
    blurb:
      "A square kilometre of city — streets, traffic, parks, five body styles of car — with not one imported asset. Every surface is written.",
    note: "The scene contains exactly one object. Everything else argues itself into existence at startup.",
    stack: ["Unity 6", "C#", "Procedural generation", "Mesh & texture synthesis", "DSP"],
    plate: { shape: "wide", images: [{ src: "/work/idrive-car.jpg", alt: "A lofted car body in I Drive, generated from cross-sections" }] },
    accentImages: [
      { src: "/work/idrive-drive.jpg", alt: "Driving through downtown at street level" },
      { src: "/work/idrive-car.jpg", alt: "A lofted car body, generated from cross-sections" },
      { src: "/work/idrive-character.jpg", alt: "The procedurally rigged character" },
      { src: "/work/idrive-street.jpg", alt: "A generated street of building facades" },
      { src: "/work/idrive-walk.jpg", alt: "On foot in the Central Green park" },
      { src: "/work/idrive-boundary.jpg", alt: "The boundary wall at the city limit" },
    ],
    study: {
      problem:
        "Open-world prototypes usually die in the asset pipeline — you spend the project importing a city rather than building one. I took the opposite constraint: no external art at all, and see what the code has to become to carry it.",
      approach: [
        "One object in the scene. A single GameBootstrap component builds the sky, the sun, the road network, the blocks, the player, the cars, the pedestrians, every sound and the entire interface at startup. Drop it into an empty scene and you have the game.",
        "Generate, then stream. The layout is answered from a hash of each cell's coordinates rather than stored, so the same city comes back every run and chunks can be built and thrown away freely. 121 cells are alive out of roughly 900.",
        "Spend the budget on light, not triangles. An ACES tone curve, bloom, baked per-vertex ambient occlusion, real contact shadows and gloss in the texture's alpha channel — that is the difference between primitives in a scene and a game.",
      ],
      decisions: [
        {
          title: "The cars are lofted, not stacked",
          body: "A series of cross-sections down the length of the car, joined into a skin — which is how it gets a tapered nose, a curved shoulder, a raked screen and a roof that flows into the tail. Five body styles are described in metres in CarSpec, and the mesh, collider, wheel positions and suspension all come out of the same numbers, so a van is genuinely taller and slower to turn than a coupe rather than the same car with different bodywork.",
        },
        {
          title: "The car turns because the tyres push, not because the transform rotates",
          body: "Four raycasts, each with a spring, a damper and a tyre that resists sliding sideways up to a grip limit set by the load on it. That is what gives it weight transfer, body roll, understeer when you carry too much speed in, and a handbrake that genuinely breaks the back loose. Spring rates are derived so every car sags exactly 10 cm under its own weight, whatever it weighs.",
        },
        {
          title: "Five materials for the entire city",
          body: "Colour lives in the vertices, not in materials, and MeshBuilder writes triangles straight into vertex and index lists — so a block full of buildings, kerbs, trees, lamps, road markings and contact shadows leaves as five meshes rather than two hundred GameObjects. A rebuilt chunk measures about 2.5 ms, so crossing a cell boundary at 150 km/h costs a fraction of a frame.",
        },
        {
          title: "A wall you can see, and a clamp you cannot",
          body: "A 3 m concrete wall runs the full circumference at 1000 m, each cell building its own tangent arc. The player and the car also clamp their own radius: the wall is what you see and feel, the clamp is what guarantees it. An invisible collider alone just feels like a bug.",
        },
      ],
      metrics: [
        { value: "1 km²", label: "of streamed, walkable and drivable city" },
        { value: "0", label: "imported meshes, textures or audio files" },
        { value: "≈2.5 ms", label: "to rebuild a chunk as you cross a cell boundary" },
      ],
    },
  },
  {
    slug: "i-run",
    index: "05",
    title: "I Run",
    kind: "Endless runner",
    period: "2026",
    context: "Independent",
    featured: true,
    blurb:
      "A three-lane endless runner where every generated layout is provably survivable — and the art bakes itself back into editable assets.",
    note: "The interesting part is the proof, not the running.",
    stack: ["Unity 6", "C#", "Object pooling", "Editor tooling"],
    plate: { shape: "wide", images: [{ src: "/work/irun-play.jpg", alt: "I Run in play — three-lane road with obstacles" }] },
    accentImages: [
      { src: "/work/irun-play.jpg", alt: "I Run in play, three lanes with obstacles ahead" },
      { src: "/work/irun-title.jpg", alt: "The attract-mode title screen" },
      { src: "/work/irun-gameover.jpg", alt: "The game-over card with per-run stats" },
    ],
    study: {
      problem:
        "An endless runner is a deceptively good systems exercise: it has to allocate nothing, generate fair layouts forever, and get harder without ever becoming impossible. The last one is the hard one — random obstacles will eventually produce a wall.",
      approach: [
        "Generate against a safe lane. Layout is built row by row against a lane that is never fully blocked, and the safe lane only moves when the row in front of it is empty. Every random layout is therefore survivable by construction rather than by testing.",
        "Never move the player forward. The track scrolls past them instead, so floating-point precision stays perfect no matter how long the run lasts and collision reduces to an overlap test.",
        "Bake the generated art back into the project. An editor pass turns the runtime materials, sprites, prefabs and scene into real assets you can select and edit — the code stays the source of truth for how things look, but the project is inspectable rather than a black box that only exists at play time.",
      ],
      decisions: [
        {
          title: "Hazards announce the answer before you can judge the geometry",
          body: "Every obstacle paints a coloured band on the road ahead of it — amber jump, red roll, blue change lane. A jump pressed just before landing is remembered and fires on touchdown; one pressed just after leaving the ground still counts. Difficulty should come from speed, not from the controls arguing with you.",
        },
        {
          title: "Obstacle behaviour follows from geometry, not from special cases",
          body: "The barrier's collider is 1 m tall so a jump clears it; the beam's hangs high so the shorter rolling body passes underneath. There is no per-obstacle rule anywhere. Adding a new one means adding a case to BuildTemplate and the behaviour comes out for free.",
        },
        {
          title: "One shader path, two render pipelines",
          body: "The primitive builder picks its shader at runtime, so the project renders correctly under both the built-in pipeline and URP. Nothing turns magenta when someone converts it later.",
        },
      ],
      metrics: [
        { value: "100%", label: "of generated layouts survivable by construction" },
        { value: "0", label: "allocations in the steady state" },
        { value: "9 → 27", label: "m/s speed ramp, with the camera widening to match" },
      ],
    },
  },
  {
    slug: "colorvista",
    index: "06",
    title: "ColorVista",
    kind: "Colour-vision screening & assistive app",
    period: "2025",
    context: "Academic",
    blurb:
      "Screens for colour vision deficiency with a 22-plate Ishihara test, then helps you live with the answer — live camera colour naming, image enhancement, and games that drill the axis you are weak on.",
    note: "It refuses to start the test until the lighting is right. An Ishihara plate read in a dim room gives a confident wrong answer.",
    stack: ["React Native", "Expo", "TypeScript", "Flask", "OpenCV", "Firebase", "Azure"],
    plate: {
      shape: "tall",
      images: [
        { src: "/work/colorvista-1.jpg", alt: "ColorVista splash screen" },
        { src: "/work/colorvista-2.jpg", alt: "ColorVista home screen with live detection, quiz and games" },
        { src: "/work/colorvista-3.jpg", alt: "An Ishihara plate asking which number is visible" },
      ],
    },
    accentImages: [
      { src: "/work/colorvista-3.jpg", alt: "An Ishihara plate asking which number is visible" },
      { src: "/work/colorvista-5.jpg", alt: "The test intro screen, with its conditions checklist and medical disclaimer" },
      { src: "/work/colorvista-6.jpg", alt: "The result card naming a deficiency type with a per-axis accuracy breakdown" },
      { src: "/work/colorvista-4.jpg", alt: "Live colour analysis naming the colour the camera is pointed at" },
      { src: "/work/colorvista-2.jpg", alt: "The home screen: live detection, upload, quiz, VR simulation, games, enhancer" },
      { src: "/work/colorvista-1.jpg", alt: "ColorVista splash screen" },
    ],
    study: {
      problem:
        "Tools for colour vision deficiency tend to do exactly one thing: recolour the screen with a fixed filter. That helps a screenshot and not much else. It does not tell you which deficiency you have, it does not adapt to you, and it does not help you find your keys.",
      approach: [
        "Screen first, adapt second. A 22-plate Ishihara test scores the red-green and blue-yellow axes separately and reports a type — Protan, Deutan or Tritan — so everything downstream is tuned to the person rather than to colour blindness in general.",
        "Correct in the world, not on a screenshot. Live detection names the colour the camera is pointed at; upload and enhance do the same for an existing image. A Flask and OpenCV service on Azure runs detection and correction across a 47-colour HSV-mapped palette, grounded in opponent-colour theory rather than an arbitrary hue rotation.",
        "Make the practice bearable. Two games track best score, level and average accuracy per run and surface the trend, so someone can see whether they are actually improving instead of guessing.",
      ],
      decisions: [
        {
          title: "It says out loud that it is not a diagnosis",
          body: "A screening tool that lets someone believe it is a diagnosis is worse than no tool at all. The caveat sits on the result screen, not buried in an about page — and the test will not begin until a short checklist is acknowledged: bright even lighting, full screen brightness, no tinted lenses, screen about 35 cm away. Those conditions are the difference between a screening result and a number.",
        },
        {
          title: "Two axes, scored independently",
          body: "Red-green and blue-yellow are different deficiencies with different corrections. Reporting one overall percentage would have averaged away the only figure that matters, so each axis carries its own score and the type is named from the pair.",
        },
        {
          title: "Lossless output, because the point is accuracy",
          body: "A compression artefact in a colour-correction tool is indistinguishable from the tool being wrong, so the pipeline stays lossless end to end.",
        },
      ],
      metrics: [
        { value: "22", label: "Ishihara plates, scored per axis rather than in total" },
        { value: "47", label: "colours in the HSV-mapped correction palette" },
        { value: "Real time", label: "colour naming from the live camera feed" },
      ],
    },
  },
  {
    slug: "apni-fasal",
    index: "07",
    title: "Apni Fasal",
    kind: "Agriculture platform",
    period: "2025",
    context: "Academic",
    blurb:
      "A two-sided platform for farmers and agronomists — book a consultation, request a soil lab test, read the report back. Agronomists upload credentials and an admin verifies them before anyone can book.",
    stack: ["Flutter", "Firebase", "WebRTC", "Cloudflare R2"],
    plate: {
      shape: "tall",
      images: [
        { src: "/work/apni-fasal-1.jpg", alt: "Apni Fasal splash screen" },
        { src: "/work/apni-fasal-2.jpg", alt: "The farmer home screen: book an agronomist, request a lab test, read reports" },
        { src: "/work/apni-fasal-3.jpg", alt: "An agronomist uploading a degree for admin verification" },
      ],
    },
    accentImages: [
      { src: "/work/apni-fasal-2.jpg", alt: "The farmer home screen: book an agronomist, request a lab test, read reports" },
      { src: "/work/apni-fasal-3.jpg", alt: "An agronomist uploading a degree for admin verification" },
      { src: "/work/apni-fasal-1.jpg", alt: "Apni Fasal splash screen" },
    ],
    study: {
      problem:
        "Agricultural advice reaches a farmer through whoever happens to be nearby — a neighbour's phone number, a shop that recommends what it has in stock, a soil lab across the district that may or may not send the report back. There is no way to tell whether the person advising you is qualified, and nothing is written down afterwards.",
      approach: [
        "Two apps out of one codebase. Farmers get booking, lab requests, reports and chat; agronomists get a request queue, reviews and a profile. Both are Flutter against the same Firebase project, so a message written on one side arrives on the other without a backend keeping them in step.",
        "Verify the expert before anyone can book them. An agronomist uploads a degree or professional certificate and stays invisible to farmers until an admin has reviewed it.",
        "Keep the paperwork. Lab requests, reports and credentials are files, so they live in Cloudflare R2 with the database holding only the key — and a consultation can move to WebRTC video when a chat thread is not enough.",
      ],
      decisions: [
        {
          title: "Verification is a gate, not a badge",
          body: "The obvious design lists everyone and puts a tick next to the checked ones. That makes an unverified profile look like the cheaper option rather than the unchecked one. Nobody appears in search until an admin has passed them, so the directory starts small and starts trustworthy — which is the right way round on a platform where bad advice costs somebody a season.",
        },
        {
          title: "Files in object storage, not in the database",
          body: "Report scans and certificate photos are large, immutable, and occasionally need a signed link. R2 does all three well. Putting the scan itself in Firebase would have made every profile read drag a few megabytes behind it.",
        },
        {
          title: "Chat first, video only when it is needed",
          body: "Most questions are answered in a thread with a photo of a leaf attached. Video is one tap away but never the default, because a WebRTC session costs both sides bandwidth that a rural connection may not have to spare.",
        },
      ],
      metrics: [
        { value: "2", label: "roles — farmer and agronomist — from one Flutter codebase" },
        { value: "Gated", label: "listings: no agronomist is bookable before admin review" },
        { value: "R2", label: "for documents, so a profile read stays a profile read" },
      ],
    },
  },
  {
    slug: "maria-b-bridal",
    index: "08",
    title: "Maria.B Bridal",
    kind: "E-commerce build study",
    period: "2025",
    context: "Academic",
    blurb:
      "A rebuild of a bridal retailer's storefront on a custom Express API, server-rendered so a heavy image catalogue still opens quickly.",
    stack: ["Next.js", "Express", "MongoDB", "JWT"],
    plate: {
      shape: "wide",
      images: [{ src: "/work/maria-b-1.jpg", alt: "The Maria.B storefront home page" }],
    },
    accentImages: [
      { src: "/work/maria-b-1.jpg", alt: "The storefront home page" },
      { src: "/work/maria-b-2.jpg", alt: "The Signature collection page" },
    ],
    study: {
      problem:
        "A couture storefront is mostly photography. Full-bleed editorial images at the top of every page, a catalogue of garments bought with the eyes, and a failure mode where the site looks expensive and arrives slowly — which on a phone means it does not really arrive.",
      approach: [
        "Rebuild it, do not copy it. The layout and tone follow an existing bridal storefront; everything behind it — the data model, the API, the rendering — was written from scratch, so the exercise was engineering rather than markup.",
        "A custom Express and MongoDB API instead of a CMS. Products and collections are documents with a shape I chose, which keeps the front end free of a vendor's idea of what a product is.",
        "Server-driven rendering in Next.js, so the browser receives the page rather than a shell and a spinner. On a catalogue that is mostly imagery, the markup has to land first or the images have nowhere to go.",
      ],
      decisions: [
        {
          title: "A custom API, in a project where a CMS would have been quicker",
          body: "Dropping the catalogue into something off-the-shelf would have finished the build in a weekend and taught nothing. Writing the API meant designing the product document, the collection relationship and the auth around them — which is the part of an e-commerce build that is actually hard.",
        },
        {
          title: "Only the write surfaces are behind a token",
          body: "Browsing is public. JWT guards the endpoints that change data, not the ones that read it, which is what lets the catalogue be rendered ahead of time and served identically to everyone.",
        },
        {
          title: "Listed as a study, because that is what it is",
          body: "The brand is real and the work is not theirs. Calling it a rebuild is the only honest way to show a project whose layout and photography belong to somebody else, and it is a better answer in an interview than being asked the question.",
        },
      ],
      metrics: [
        { value: "Custom", label: "Express API and Mongo schema rather than an off-the-shelf CMS" },
        { value: "Server-rendered", label: "so the markup arrives before the photography does" },
        { value: "Study", label: "a rebuild of an existing storefront, not client work" },
      ],
    },
  },
  {
    slug: "ai-deskbot",
    index: "09",
    title: "AI DeskBot",
    kind: "Product site",
    period: "2025",
    context: "Independent",
    href: "https://aibot18.netlify.app",
    blurb:
      "A deployed storefront for a line of hard-cased desktop AI companions — landing, catalogue and product pages, with Supabase behind it.",
    stack: ["Next.js", "Supabase", "REST"],
    plate: {
      shape: "wide",
      images: [{ src: "/work/ai-deskbot-1.jpg", alt: "The DeskBots landing page" }],
    },
    accentImages: [
      { src: "/work/ai-deskbot-1.jpg", alt: "The landing page" },
      { src: "/work/ai-deskbot-2.jpg", alt: "The product catalogue" },
      { src: "/work/ai-deskbot-3.jpg", alt: "A product detail page with highlights and colour options" },
    ],
    study: {
      problem:
        "A product site is the same shape every time — a hero, a catalogue, a detail page, a way to buy — and it gets rebuilt from scratch every time because the content is baked into the markup. I wanted one where changing the product line means changing rows.",
      approach: [
        "Everything the page says is data. The products, their prices, their colour options and their highlight lists come out of Supabase. The components know how to lay out a product; they do not know which products exist.",
        "Demonstrate it with a plausible line rather than lorem ipsum. Four desk companions with real prices, real copy and real differences between them — a template that has only ever rendered placeholder text falls over the first time it meets a long product name.",
        "Deploy it. It runs at a public URL, so it is judged as a working site rather than as a folder of files with untested assumptions in it.",
      ],
      decisions: [
        {
          title: "Copy lives in rows, not in JSX",
          body: "Writing the hero text straight into the component is faster on day one and a deploy for every change after that. Keeping the copy, pricing and highlights in Supabase means the same build can serve an entirely different product line.",
        },
        {
          title: "The card and the detail page read one record",
          body: "Adding a product is a single row. There is no second place to update, and therefore no way for the grid and the detail page to quietly disagree about what something costs.",
        },
      ],
      metrics: [
        { value: "4", label: "products in the demo line, all rows rather than markup" },
        { value: "1", label: "record behind both the catalogue card and the detail page" },
        { value: "Live", label: "deployed and reachable, not a repository" },
      ],
    },
  },
  {
    slug: "gamelens",
    index: "10",
    title: "GameLens",
    kind: "Cross-platform app",
    period: "2024",
    context: "Academic",
    blurb:
      "Browse and search thousands of titles on the RAWG API — ratings, media galleries, genres and store links, behind Firebase auth.",
    stack: ["Flutter", "Firebase", "RAWG API"],
    plate: {
      shape: "tall",
      images: [
        { src: "/work/gamelens-1.jpg", alt: "GameLens discover screen with popular games and ratings" },
        { src: "/work/gamelens-2.jpg", alt: "Searching the RAWG catalogue" },
        { src: "/work/gamelens-3.jpg", alt: "A game detail page with summary and genres" },
      ],
    },
    accentImages: [
      { src: "/work/gamelens-1.jpg", alt: "Discover, with popular titles and ratings" },
      { src: "/work/gamelens-2.jpg", alt: "Searching the RAWG catalogue" },
      { src: "/work/gamelens-3.jpg", alt: "A game detail page with summary and genres" },
      { src: "/work/gamelens-4.jpg", alt: "The media tab, a grid of screenshots" },
      { src: "/work/gamelens-5.jpg", alt: "The GameLens splash screen" },
    ],
    study: {
      problem:
        "A games catalogue is a hostile thing to put on a phone: hundreds of thousands of titles, every row carrying cover art, and a user who types three letters and expects the list to already be right.",
      approach: [
        "Read from RAWG rather than pretend to own the data. Discover, search, detail and media all come from the same API, so the catalogue is never stale and never has to be seeded.",
        "Design the list around images. Every row is a cover, so the work went into loading and recycling artwork rather than into the text beside it.",
        "Firebase for the parts that are actually yours — auth and the user's own state. The catalogue is not; there is no reason to copy somebody else's database into your own.",
      ],
      decisions: [
        {
          title: "Overview and media are tabs, not one long page",
          body: "A detail page has a summary somebody will read and a gallery they will swipe. Stacking them means everyone scrolls past whichever one they did not want, so they are two tabs — the smaller interface and the faster one.",
        },
        {
          title: "The app does not try to be a store",
          body: "Every detail page ends at the storefront that actually sells the game. Building a purchase flow on top of somebody else's catalogue would have been a great deal of work to arrive somewhere worse than the store already is.",
        },
      ],
      metrics: [
        { value: "0", label: "catalogue rows stored — RAWG stays the source of truth" },
        { value: "3", label: "surfaces from one API: discover, search and detail" },
        { value: "Firebase", label: "for auth and personal state, and nothing else" },
      ],
    },
  },
];

export const featured = projects.filter((p) => p.featured);
export const archive = projects.filter((p) => !p.featured);
export const caseStudies = projects.filter((p) => p.study);

export const lab = [
  {
    title: "Unity inside React Native",
    blurb:
      "Embedding a Unity scene in an Expo app through Unity as a Library, with the runtime loaded dynamically — reflection on Android, NSBundle on iOS — so the app compiles whether or not a Unity export exists.",
    stack: ["Expo", "React Native", "Kotlin", "Objective-C++"],
  },
  {
    title: "Spring on the current JDK",
    blurb:
      "A Spring Boot service on Java 25, including the afternoon spent learning that a class file the framework's bundled ASM cannot parse kills component scanning and then disguises itself as a login failure.",
    stack: ["Java 25", "Spring Boot", "Spring Security", "Maven"],
  },
  {
    title: "Documents as data",
    blurb:
      "Reading and rewriting Office XML directly, cloning paragraph structures so generated content is indistinguishable from what was already in the template.",
    stack: ["Python", "lxml", "OOXML"],
  },
];

export const experience = [
  {
    role: "Web App Intern",
    org: "SourceLabs",
    place: "Lahore",
    period: "6 weeks",
    bullets: [
      "Built and shipped full-stack features across MongoDB, Express, React and Node.js under senior-engineer review.",
      "Designed REST endpoints and component-based React interfaces with consistent client-side state management.",
    ],
  },
  {
    role: "Web App Intern",
    org: "Coshi Infrastructure",
    place: "Hong Kong · Remote",
    period: "12 weeks",
    bullets: [
      "Delivered assigned modules across several web stacks, ramping quickly on unfamiliar codebases and conventions.",
      "Worked asynchronously with a distributed team across time zones, keeping every module on schedule.",
    ],
  },
];

export const education = [
  {
    school: "COMSATS University Islamabad",
    detail: "Lahore Campus",
    award: "BS, Software Engineering",
    period: "2022 — 26",
  },
  {
    school: "Punjab Group of Colleges",
    detail: "Lahore",
    award: "Intermediate, Computer Science",
    period: "2020 — 22",
  },
];

export const capabilities = [
  {
    label: "Web & backend",
    items: [
      "React", "Next.js", "Node.js", "Express", "NestJS", "REST design", "JWT", "RBAC",
      "Socket.IO", "Prisma", "Vite", "Tailwind", "Material UI", "Redux Toolkit",
      "TanStack Query", "Supabase",
    ],
  },
  {
    label: "Mobile",
    items: [
      "Flutter", "React Native", "Expo (Router, Modules, Config Plugins)",
      "Unity as a Library", "Native modules (Kotlin, Objective-C++)", "Firebase Auth",
    ],
  },
  {
    label: "Java & Spring",
    items: [
      "Java 25", "Spring Boot", "Spring MVC", "Spring Security", "Thymeleaf", "JDBC",
      "Bean Validation", "Maven", "JUnit",
    ],
  },
  {
    label: "Games",
    items: [
      "Unity 6", "C#", "Procedural world generation", "Runtime mesh & texture synthesis",
      "Vehicle physics", "Procedural audio", "Object pooling", "Editor tooling",
    ],
  },
  {
    label: "Data & infra",
    items: [
      "MySQL", "PostgreSQL", "MongoDB", "ClickHouse", "SQLite", "Redis", "Firebase",
      "Docker", "Nginx", "systemd", "Vector", "Vercel", "Netlify", "Azure", "Cloudflare R2",
    ],
  },
  {
    label: "Protocols & integration",
    items: [
      "Third-party API sync", "Webhooks", "Real-time fan-out", "Rating & invoicing",
      "Binary & text log ingestion", "SIP", "NetFlow v9", "Syslog",
    ],
  },
  {
    label: "Languages",
    items: ["JavaScript", "TypeScript", "Dart", "Python", "Java", "C++", "C#", "SQL"],
  },
  {
    label: "Tools",
    items: [
      "Git", "Claude Code", "OpenCV", "PDFKit", "Zod", "Swagger", "Selenium",
      "Playwright", "JIRA", "Trello",
    ],
  },
];

export const principles = [
  {
    n: "01",
    title: "A visible gap beats a plausible wrong number",
    body: "A rating engine taught me this the expensive way. When a system cannot compute something it should say so, not reach for the nearest fallback and produce a number that looks fine and is not.",
  },
  {
    n: "02",
    title: "Reconcile, don't diff",
    body: "A feed that sends the whole set is safe to repeat and self-heals after a dropped message. A delta feed diverges silently the first time one goes missing, and you find out weeks later.",
  },
  {
    n: "03",
    title: "The dangerous failures are the quiet ones",
    body: "A binary frame rejected at a decoder. A generated city with no roads. Neither throws. Most of the tests I write exist to make silence audible.",
  },
  {
    n: "04",
    title: "Ship it the way it will actually be run",
    body: "Docker Compose is a lovely developer experience and no help whatsoever to the site that cannot install Docker. Real deployments get a real path.",
  },
];

/** Grouped with labels that sound like a person wrote them, because one did. */
export const contactGroups = [
  {
    label: "Say something",
    links: [{ text: "amudassir4321@gmail.com", href: "mailto:amudassir4321@gmail.com" }],
  },
  {
    label: "If it's urgent",
    links: [{ text: "+92 309 0477778", href: "tel:+923090477778" }],
  },
  {
    label: "Where the code lives",
    links: [{ text: "GitHub", href: "https://github.com/Mudassir-ali228" }],
  },
  {
    label: "Where the suits are",
    links: [{ text: "LinkedIn", href: "https://linkedin.com/in/mudassir-ali" }],
  },
  {
    label: "The formal version",
    links: [{ text: "Curriculum vitae — PDF", href: "/Mudassir-Ali-CV.pdf" }],
  },
];

export const marqueeItems = [
  "TypeScript", "React", "Next.js", "NestJS", "Node.js", "PostgreSQL", "ClickHouse",
  "Prisma", "Redis", "Socket.IO", "React Native", "Flutter", "Unity 6", "C#",
  "Java 25", "Spring Boot", "Docker", "Tailwind",
];
