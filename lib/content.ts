export const profile = {
  name: "Mudassir Ali",
  role: "Software Engineer",
  location: "Lahore, Pakistan",
  status: "Open to full-time roles",
  email: "amudassir4321@gmail.com",
  phone: "+92 309 0477778",
  phoneHref: "tel:+923090477778",
  linkedin: "https://www.linkedin.com/in/mudassir-ali228",
  github: "https://github.com/Mudassir-ali228",
  cv: "/Mudassir-Ali-CV.pdf",
  headline:
    "Software engineer in Lahore. I build backend services, web interfaces and mobile apps, and I make games in my own time.",
  about: [
    "I’m drawn to the parts of a system where “close enough” isn’t a category: the logic underneath, where something is either right or quietly wrong and somebody finds out much later. I’d rather spend an extra day on that than explain it afterwards.",
    "I learn by building things from scratch, which is how most of what I know arrived. Evenings usually go to something I’m making for no better reason than wanting to know how it works.",
  ],
};

/** A screenshot with its real pixel size, so the browser reserves the
 *  right box before the image arrives. */
import type { FigureSpec } from "./painters";

export type Shot = { src: string; alt: string; w: number; h: number };

export type Project = {
  slug: string;
  index: string;
  title: string;
  kind: string;
  year: string;
  context: "Professional" | "Independent" | "Academic";
  blurb: string;
  stack: string[];
  /** What fills the plate on the index. `tall` is phone screenshots, shown
   *  three across; `wide` is a single landscape screenshot. */
  plate?: { shape: "wide" | "tall"; images: Shot[] };
  /** Screenshots for the project page. */
  images?: Shot[];
  /** Plain-text architecture sketch, for client work with no screenshots. */
  diagram?: string[];
  href?: string;
  overview: string;
  details: string[];
  /** The project's figure, and one line on why it is this one. */
  figure: FigureSpec & { note: string };
};

export const projects: Project[] = [
  {
    slug: "voice-portal",
    index: "01",
    title: "Company’s Voice Portal",
    kind: "Billing and invoicing platform",
    year: "2026",
    context: "Professional",
    blurb:
      "A billing platform that syncs usage from a provider API, prices every record against the client’s own rate plan and issues PDF invoices.",
    stack: ["React", "Vite", "Tailwind CSS", "Node.js", "Express", "MySQL", "PDFKit"],
    diagram: [
      "provider API ──→ sync ──→ rating ──→ invoice.pdf",
      "                  │         │",
      "             rate plans   units · tax · arrears",
    ],
    overview:
      "The client was invoicing by hand. Usage and rate plans lived in one system, line rent, tax numbers and arrears in a spreadsheet, and the bill itself was assembled in a word processor. I built the portal that replaced all three.",
    details: [
      "Billing increments are resolved per destination and per client, because some clients bill in 30-second steps and others in 60.",
      "A destination with no rate charges nothing and is flagged on both the invoice and the usage export. There is no fallback price.",
      "Arrears carry forward outside the tax chain and never compound. Rounding happens on each line, so the printed columns add up.",
      "The PDF reproduces the client’s existing invoice layout column for column, so their customers saw no change.",
    ],
    figure: { kind: "fibonacci", count: 10, note: "Each square is the sum of the two before it." },
  },
  {
    slug: "rtp-logger",
    index: "02",
    title: "RTP Logger",
    kind: "Log analytics platform",
    year: "2026",
    context: "Professional",
    blurb:
      "A self-hosted log analytics platform that brings a text feed and a binary feed into ClickHouse and makes both searchable.",
    stack: ["NestJS", "ClickHouse", "Prisma", "React", "Material UI", "Vector", "goflow2", "Docker"],
    diagram: [
      "text    udp/1514 ──→ Vector  ─┐",
      "                              ├─→ ClickHouse ──→ NestJS ──→ React",
      "binary  udp/2055 ──→ goflow2 ─┘",
    ],
    overview:
      "The client ran Elasticsearch and Logstash on hardware that could barely support either, and only one of their two feeds was usable. I replaced the stack with one that fits the machine and handles both.",
    details: [
      "The text feed arrives on UDP 1514 and is parsed by Vector. The binary feed arrives on UDP 2055 and is decoded by goflow2 first. Both land in one ClickHouse table, tagged by source.",
      "Users, roles and sessions are kept in SQLite behind Prisma, separate from the log store.",
      "The NestJS API uses Argon2 password hashing and short-lived JWTs, and refuses to start with the default secret.",
      "It ships as Docker Compose for development and as a native systemd and Nginx deployment for servers that cannot run Docker.",
    ],
    figure: { kind: "harmonograph", seed: 961, note: "Two signals summed into one trace, like two feeds into one table." },
  },
  {
    slug: "company-crm",
    index: "03",
    title: "Company’s CRM",
    kind: "Multi-tenant SaaS",
    year: "2025–26",
    context: "Professional",
    blurb:
      "A multi-tenant CRM integrated with a third-party call-centre platform, with live wallboards for supervisors.",
    stack: ["Express", "Prisma", "PostgreSQL", "MySQL", "Redis", "Socket.IO", "React", "Redux Toolkit"],
    diagram: [
      "third-party DB ─┐",
      "                ├─→ Redis ──→ Socket.IO ──→ wallboard",
      "live event feed ┘",
    ],
    overview:
      "Agents worked leads in one system and took calls in another, and supervisors only saw what had happened afterwards, in reports. I worked on the CRM that joins the two and shows supervisors what is happening now.",
    details: [
      "The CRM reads the call platform’s own MySQL database and event feed, and never writes to either.",
      "Live agent state is cached in Redis and pushed to wallboards over Socket.IO, with the Redis adapter so it works across several API processes.",
      "Time in each state is calculated from a single timestamp, so a reconnect or a missed update cannot make the number drift.",
      "Every record is scoped to an organisation, and permission middleware guards each protected route.",
    ],
    figure: { kind: "tree", seed: 64, depth: 8, note: "One call fanning out, level by level." },
  },
  {
    slug: "i-drive",
    index: "04",
    title: "I Drive",
    kind: "Open-world driving game",
    year: "2026",
    context: "Independent",
    blurb:
      "An open-world driving game in Unity 6. One square kilometre of city, with every road, building, car, sound and menu generated from code.",
    stack: ["Unity 6", "C#", "Procedural generation", "Mesh synthesis"],
    plate: {
      shape: "wide",
      images: [{ src: "/work/idrive-car.jpg", alt: "A car in I Drive, built from generated cross-sections", w: 1600, h: 900 }],
    },
    images: [
      { src: "/work/idrive-drive.jpg", alt: "Driving through the city centre at street level", w: 1600, h: 900 },
      { src: "/work/idrive-car.jpg", alt: "A car body built from generated cross-sections", w: 1600, h: 900 },
      { src: "/work/idrive-character.jpg", alt: "The generated player character", w: 1600, h: 900 },
      { src: "/work/idrive-street.jpg", alt: "A street of generated building facades", w: 1600, h: 900 },
      { src: "/work/idrive-walk.jpg", alt: "On foot in the central park", w: 1600, h: 900 },
      { src: "/work/idrive-boundary.jpg", alt: "The boundary wall at the edge of the city", w: 1600, h: 900 },
    ],
    overview:
      "Open-world prototypes usually stall in the asset pipeline. I set the opposite constraint: no imported art at all. The scene holds a single bootstrap object, and it builds the sky, roads, buildings, cars, people, audio and interface at startup.",
    details: [
      "The city is generated from a hash of each cell’s coordinates, so the same layout returns every run and chunks can be built and discarded freely. About 121 of 900 cells are active at once.",
      "Cars are lofted from cross-sections. Five body styles are defined in metres, and the mesh, collider, wheel positions and suspension all come from the same numbers.",
      "Each wheel is a raycast with a spring, a damper and a grip limit set by the load on it, which produces weight transfer, body roll and understeer.",
      "Colour is stored in vertex data, so the whole city renders with five materials and a chunk rebuilds in about 2.5 ms.",
    ],
    figure: { kind: "dijkstra", seed: 15, note: "The shortest route across a street graph." },
  },
  {
    slug: "i-run",
    index: "05",
    title: "I Run",
    kind: "Endless runner",
    year: "2026",
    context: "Independent",
    blurb:
      "A three-lane endless runner in Unity 6 whose generated layouts are always survivable, with no allocations during play.",
    stack: ["Unity 6", "C#", "Object pooling", "Editor tooling"],
    plate: {
      shape: "wide",
      images: [{ src: "/work/irun-play.jpg", alt: "I Run in play, three lanes with obstacles ahead", w: 1600, h: 900 }],
    },
    images: [
      { src: "/work/irun-play.jpg", alt: "Three lanes with obstacles ahead", w: 1600, h: 900 },
      { src: "/work/irun-title.jpg", alt: "The title screen", w: 1600, h: 900 },
      { src: "/work/irun-gameover.jpg", alt: "The end-of-run card with stats", w: 1600, h: 900 },
    ],
    overview:
      "Random obstacle placement eventually produces a wall the player cannot pass. I wanted a runner that keeps getting harder without ever becoming impossible, and that allocates no memory once a run has started.",
    details: [
      "Rows are generated against a safe lane that is never blocked, and the safe lane only moves when the row ahead is empty. Every layout is survivable by construction.",
      "The player never moves forward. The track scrolls past instead, which keeps floating-point precision exact however long the run lasts.",
      "Obstacles are pooled, and their behaviour comes from their colliders: a 1 m barrier can be jumped and a high beam can be rolled under.",
      "An editor pass bakes the runtime art into real prefabs, materials and scenes that can be opened and edited.",
    ],
    figure: { kind: "dijkstra", seed: 7, note: "Every route weighed; the cheapest one kept." },
  },
  {
    slug: "colorvista",
    index: "06",
    title: "ColorVista",
    kind: "Colour vision screening app",
    year: "2025",
    context: "Academic",
    blurb:
      "A mobile app that screens for colour vision deficiency, then names colours through the camera and corrects images for the result.",
    stack: ["React Native", "Expo", "TypeScript", "Flask", "OpenCV", "Firebase", "Azure"],
    plate: {
      shape: "tall",
      images: [
        { src: "/work/colorvista-1.jpg", alt: "ColorVista splash screen", w: 650, h: 1400 },
        { src: "/work/colorvista-2.jpg", alt: "ColorVista home screen", w: 629, h: 1400 },
        { src: "/work/colorvista-3.jpg", alt: "An Ishihara plate asking which number is visible", w: 631, h: 1400 },
      ],
    },
    images: [
      { src: "/work/colorvista-3.jpg", alt: "An Ishihara plate asking which number is visible", w: 631, h: 1400 },
      { src: "/work/colorvista-5.jpg", alt: "The test introduction with its conditions checklist", w: 511, h: 1400 },
      { src: "/work/colorvista-6.jpg", alt: "The result screen with a per-axis breakdown", w: 656, h: 1400 },
      { src: "/work/colorvista-4.jpg", alt: "Live colour naming from the camera", w: 651, h: 1400 },
      { src: "/work/colorvista-2.jpg", alt: "The home screen", w: 629, h: 1400 },
      { src: "/work/colorvista-1.jpg", alt: "The splash screen", w: 650, h: 1400 },
    ],
    overview:
      "Most tools for colour vision deficiency apply one fixed filter to the screen. ColorVista first finds out which deficiency a person has, then tunes its corrections to that result.",
    details: [
      "A 22-plate Ishihara test scores the red-green and blue-yellow axes separately and names the likely type: protan, deutan or tritan.",
      "The test only begins once a checklist confirms good lighting, full brightness and a 35 cm viewing distance. The result screen states plainly that it is a screening and cannot give a diagnosis.",
      "Live camera colour naming and image correction run on a Flask and OpenCV service on Azure, using a 47-colour palette mapped in HSV.",
      "Two practice games record score, level and accuracy for each run, so progress is visible over time.",
    ],
    figure: { kind: "harmonograph", seed: 1491, note: "Two axes, measured separately and drawn as one." },
  },
  {
    slug: "apni-fasal",
    index: "07",
    title: "Apni Fasal",
    kind: "Agriculture platform",
    year: "2025",
    context: "Academic",
    blurb:
      "A Flutter platform that connects farmers with verified agronomists for consultations, soil lab tests and reports.",
    stack: ["Flutter", "Firebase", "WebRTC", "Cloudflare R2"],
    plate: {
      shape: "tall",
      images: [
        { src: "/work/apni-fasal-1.jpg", alt: "Apni Fasal splash screen", w: 628, h: 1400 },
        { src: "/work/apni-fasal-2.jpg", alt: "The farmer home screen", w: 628, h: 1400 },
        { src: "/work/apni-fasal-3.jpg", alt: "An agronomist uploading a degree for verification", w: 628, h: 1400 },
      ],
    },
    images: [
      { src: "/work/apni-fasal-2.jpg", alt: "The farmer home screen", w: 628, h: 1400 },
      { src: "/work/apni-fasal-3.jpg", alt: "An agronomist uploading a degree for verification", w: 628, h: 1400 },
      { src: "/work/apni-fasal-1.jpg", alt: "The splash screen", w: 628, h: 1400 },
    ],
    overview:
      "Farmers usually get advice from whoever is nearby, with no way to check whether that person is qualified. Apni Fasal gives them a directory of agronomists who are verified before anyone can book them.",
    details: [
      "Farmers and agronomists use two apps built from one Flutter codebase against the same Firebase project.",
      "Agronomists upload a degree or certificate and stay hidden from search until an admin approves it.",
      "Lab requests, reports and credentials are stored in Cloudflare R2, with only the file key kept in the database.",
      "Consultations start in chat and move to WebRTC video only when needed, which saves bandwidth on rural connections.",
    ],
    figure: { kind: "tree", seed: 88, depth: 8, note: "Growth, one level at a time." },
  },
  {
    slug: "maria-b-bridal",
    index: "08",
    title: "Maria.B Bridal",
    kind: "E-commerce study",
    year: "2025",
    context: "Academic",
    blurb:
      "A study rebuild of a bridal storefront on a custom Express and MongoDB API, rendered with Next.js.",
    stack: ["Next.js", "Express", "MongoDB", "JWT"],
    plate: {
      shape: "wide",
      images: [{ src: "/work/maria-b-1.jpg", alt: "The storefront home page", w: 1600, h: 765 }],
    },
    images: [
      { src: "/work/maria-b-1.jpg", alt: "The storefront home page", w: 1600, h: 765 },
      { src: "/work/maria-b-2.jpg", alt: "A collection page", w: 1600, h: 770 },
    ],
    overview:
      "The layout and photography follow an existing bridal retailer. Everything behind them, from the data model to the API and the rendering, I wrote from scratch as an engineering exercise. It is a study and was never client work.",
    details: [
      "Products and collections are MongoDB documents with a schema I designed, served by an Express API instead of an off-the-shelf CMS.",
      "Pages are rendered on the server with Next.js, so the markup arrives before the heavy photography.",
      "JWT protects the endpoints that change data. Browsing is public, which lets catalogue pages be rendered ahead of time.",
    ],
    figure: { kind: "fibonacci", count: 11, note: "Squares in the golden ratio." },
  },
  {
    slug: "ai-deskbot",
    index: "09",
    title: "AI DeskBot",
    kind: "Product site",
    year: "2025",
    context: "Independent",
    href: "https://aibot18.netlify.app",
    blurb:
      "A live product site for a line of desktop companions, with every product, price and highlight stored in Supabase.",
    stack: ["Next.js", "Supabase", "REST"],
    plate: {
      shape: "wide",
      images: [{ src: "/work/ai-deskbot-1.jpg", alt: "The DeskBots landing page", w: 1600, h: 771 }],
    },
    images: [
      { src: "/work/ai-deskbot-1.jpg", alt: "The landing page", w: 1600, h: 771 },
      { src: "/work/ai-deskbot-2.jpg", alt: "The product catalogue", w: 1600, h: 770 },
      { src: "/work/ai-deskbot-3.jpg", alt: "A product page with highlights and colour options", w: 1600, h: 769 },
    ],
    overview:
      "Product sites are usually rebuilt whenever the product line changes, because the content is written into the markup. I built one where changing the line means editing rows in a database.",
    details: [
      "Products, prices, colour options and highlights all come from Supabase. The components only know how to lay out a product.",
      "The catalogue card and the product page read the same record, so they cannot disagree about a price.",
      "The demo line has four products with real copy and prices, which tests the layout against long names and uneven content.",
    ],
    figure: { kind: "traversal", note: "One loop, two searches: across, then down." },
  },
  {
    slug: "gamelens",
    index: "10",
    title: "GameLens",
    kind: "Cross-platform app",
    year: "2024",
    context: "Academic",
    blurb:
      "A Flutter app for browsing and searching the RAWG games catalogue, with Firebase sign-in.",
    stack: ["Flutter", "Firebase", "RAWG API"],
    plate: {
      shape: "tall",
      images: [
        { src: "/work/gamelens-1.jpg", alt: "The discover screen with popular games", w: 663, h: 1400 },
        { src: "/work/gamelens-2.jpg", alt: "Searching the catalogue", w: 663, h: 1400 },
        { src: "/work/gamelens-3.jpg", alt: "A game page with summary and genres", w: 663, h: 1400 },
      ],
    },
    images: [
      { src: "/work/gamelens-1.jpg", alt: "The discover screen with popular games", w: 663, h: 1400 },
      { src: "/work/gamelens-2.jpg", alt: "Searching the catalogue", w: 663, h: 1400 },
      { src: "/work/gamelens-3.jpg", alt: "A game page with summary and genres", w: 663, h: 1400 },
      { src: "/work/gamelens-4.jpg", alt: "The media tab", w: 663, h: 1400 },
      { src: "/work/gamelens-5.jpg", alt: "The splash screen", w: 663, h: 1400 },
    ],
    overview:
      "GameLens reads its whole catalogue from the RAWG API, so it is always current and nothing has to be seeded. Firebase handles sign-in and the user’s own data.",
    details: [
      "Discover, search, detail and media screens all read from the same API.",
      "Lists are built around cover art, with images loaded and recycled as the user scrolls.",
      "Each game page is split into an overview tab and a media tab.",
      "Game pages link out to the stores that sell each title instead of building a purchase flow.",
    ],
    figure: { kind: "tree", seed: 136, depth: 8, note: "A catalogue branching into categories." },
  },
];

export const experience = [
  {
    role: "Junior Developer",
    org: "Coshi Infrastructure",
    place: "Hong Kong, remote",
    period: "Mar 2026 – Jul 2026",
    points: [
      "Delivered assigned modules across several web stacks, ramping up quickly on unfamiliar codebases and conventions.",
      "Worked asynchronously with a distributed team across time zones and kept every module on schedule.",
    ],
  },
  {
    role: "Web App Intern",
    org: "SourceLabs",
    place: "Lahore",
    period: "Jul 2025 – Sep 2025",
    points: [
      "Built and shipped full-stack features with MongoDB, Express, React and Node.js under senior-engineer review.",
      "Designed REST endpoints and component-based React interfaces with consistent client-side state.",
    ],
  },
];

export const education = [
  {
    school: "COMSATS University Islamabad, Lahore Campus",
    award: "BS Software Engineering",
    period: "2022–26",
  },
  {
    school: "Punjab Group of Colleges, Lahore",
    award: "Intermediate, Computer Science",
    period: "2020–22",
  },
];

export const skills = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "Python", "SQL", "C#", "Dart"] },
  {
    label: "Web and backend",
    items: ["React", "Next.js", "Node.js", "Express", "NestJS", "REST API design", "JWT", "Socket.IO", "GSAP"],
  },
  {
    label: "Mobile and games",
    items: ["Flutter", "React Native", "Expo", "Native modules (Kotlin, Objective-C++)", "Unity 6"],
  },
  {
    label: "Data and infrastructure",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "ClickHouse", "Docker", "Nginx", "Firebase"],
  },
  {
    label: "Tools",
    items: ["Git", "GitHub", "Claude Code", "Playwright", "Swagger/OpenAPI", "Zod", "Jira"],
  },
];
