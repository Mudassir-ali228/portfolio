import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import type { CSSProperties } from "react";
import { projects, type Project, type Shot } from "@/lib/content";
import { ScrubText, Split } from "@/components/motion/Split";
import { Figure } from "@/components/art/Figure";

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export const dynamicParams = false;

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.blurb,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: { title: project.title, description: project.blurb },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const i = projects.findIndex((p) => p.slug === slug);
  if (i === -1) notFound();

  const project = projects[i];
  const next = projects[(i + 1) % projects.length];
  const { lead, rest } = splitImages(project);

  return (
    <>
      <main id="main">
        <header className="shell pt-32 md:pt-40">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-8">
              <p className="load-fade" style={d(0)}>
                <Link href="/#work" data-title="Selected work" className="label quiet-link">
                  ← All work
                </Link>
              </p>
              <p className="label load-fade mt-12 flex flex-wrap gap-x-3" style={d(0.1)}>
                <span>{project.index}</span>
                <span aria-hidden="true">/</span>
                <span>{project.kind}</span>
              </p>
              <h1
                aria-label={project.title}
                className="display load-chars mt-5 text-[clamp(2.75rem,8vw,6.75rem)] leading-[0.92]"
                style={d(0.15)}
              >
                <Split text={project.title} />
              </h1>
              <p className="lede load-words mt-8 max-w-2xl" style={d(0.55)}>
                <Split text={project.blurb} by="words" />
              </p>
            </div>

            {/* Each project keeps the same figure on every visit. */}
            <div className="hidden lg:col-span-3 lg:col-start-10 lg:block">
              <Figure
                label={`Fig. ${project.index}`}
                kind={project.figure.kind}
                seed={project.figure.seed}
                depth={project.figure.depth}
                order={project.figure.order}
                count={project.figure.count}
                note={project.figure.note}
                when="load"
                delay={0.4}
                captionClassName="load-fade"
              />
            </div>
          </div>

          <div className="relative mt-14 pt-6">
            <span className="load-rule absolute inset-x-0 top-0 h-px bg-line" style={d(0.7)} />
            <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
              <Meta k="Type" v={project.context} delay={0.85} />
              <Meta k="Year" v={project.year} delay={0.9} />
              <div className="load-fade sm:col-span-2" style={d(0.95)}>
                <dt className="label">Stack</dt>
                <dd className="mt-2 text-[0.9375rem]">{project.stack.join(", ")}</dd>
              </div>
            </dl>
          </div>

          {project.href && (
            <p className="load-fade mt-8 text-[0.9375rem]" style={d(1)}>
              <a href={project.href} target="_blank" rel="noopener noreferrer" className="text-link">
                Visit the live site ↗
              </a>
            </p>
          )}
        </header>

        <figure className="shell mt-16 md:mt-24">
          <Lead project={project} images={lead} />
        </figure>

        <section className="shell mt-20 grid gap-6 md:mt-32 lg:grid-cols-12 lg:gap-12">
          <h2 className="label lg:col-span-3" data-a="fade">
            Overview
          </h2>
          <p
            className="display text-[clamp(1.5rem,2.6vw,2.25rem)] leading-[1.25] tracking-[-0.01em] lg:col-span-9"
            data-a="scrub"
          >
            <ScrubText text={project.overview} />
          </p>
        </section>

        <section className="shell mt-20 grid gap-6 md:mt-28 lg:grid-cols-12 lg:gap-12">
          <h2 className="label lg:col-span-3" data-a="fade">
            Details
          </h2>
          <ol className="lg:col-span-9">
            {project.details.map((text, n) => (
              <li key={text} className="relative flex gap-5 py-6 sm:gap-8">
                <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />
                <span className="label shrink-0 pt-1 tabular-nums" data-a="fade" data-d="0.1">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <p className="body-copy max-w-2xl" data-a="lines" data-d="0.12">
                  {text}
                </p>
              </li>
            ))}
            <li aria-hidden="true" className="list-none">
              <span data-a="rule" className="block h-px bg-line" />
            </li>
          </ol>
        </section>

        {rest.length > 0 && (
          <section className="shell mt-20 md:mt-28">
            <h2 className="label mb-6" data-a="fade">
              Screens
            </h2>
            <Gallery project={project} images={rest} />
          </section>
        )}

        <nav className="shell mt-28 md:mt-40" aria-label="Next project">
          <Link href={`/work/${next.slug}`} data-title={next.title} className="group relative block">
            <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />
            <div className="flex flex-col gap-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
              <div>
                <p className="label" data-a="fade">
                  Next project
                </p>
                <p
                  aria-label={next.title}
                  className="display mt-5 text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] transition-colors duration-300 group-hover:text-brass"
                  data-a="chars"
                  data-d="0.1"
                >
                  <Split text={next.title} />
                </p>
              </div>
              <p className="text-[0.875rem] text-faint" data-a="fade" data-d="0.3">
                {next.kind}{" "}
                <span className="inline-block transition-transform duration-500 group-hover:translate-x-1.5">
                  →
                </span>
              </p>
            </div>
          </Link>
        </nav>
      </main>
      <Footer />
    </>
  );
}

function Meta({ k, v, delay }: { k: string; v: string; delay: number }) {
  return (
    <div className="load-fade" style={d(delay)}>
      <dt className="label">{k}</dt>
      <dd className="mt-2 text-[0.9375rem]">{v}</dd>
    </div>
  );
}

/** Wide projects lead with one screenshot; phone projects with three. */
function splitImages(project: Project) {
  const all = project.images ?? [];
  const n = project.plate?.shape === "tall" ? 3 : 1;
  return { lead: all.slice(0, n), rest: all.slice(n) };
}

function Lead({ project, images }: { project: Project; images: Project["images"] & {} }) {
  if (images.length === 0 && project.diagram) {
    return (
      <div className="load-clip overflow-x-auto border border-line bg-surface p-7 md:p-14" style={d(0.9)}>
        <pre className="font-mono text-[0.75rem] leading-loose text-muted md:text-[0.8125rem]">
          {project.diagram.join("\n")}
        </pre>
      </div>
    );
  }

  if (project.plate?.shape === "tall") {
    return (
      <div className="load-fade grid grid-cols-3 gap-3 border border-line bg-surface p-3 sm:gap-6 sm:p-8 md:p-12" style={d(0.8)}>
        {images.map((img, n) => (
          <Phone
            key={img.src}
            img={img}
            priority
            sizes="(min-width: 1216px) 22rem, 30vw"
            className="load-clip"
            style={d(0.95 + n * 0.12)}
          />
        ))}
      </div>
    );
  }

  const img = images[0];
  if (!img) return null;
  // The picture is 12% taller than its frame and drifts inside it on scroll.
  return (
    <div
      className="load-clip relative overflow-hidden border border-line bg-surface"
      style={{ ...d(0.9), aspectRatio: `${img.w} / ${img.h}` }}
    >
      <div className="absolute inset-x-0 -top-[6%] -bottom-[6%]" data-a="parallax" data-speed="9">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          priority
          sizes="(min-width: 1216px) 70rem, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}

/** Phone screenshots differ slightly in aspect. A shared frame keeps a row of
 *  them level; the odd one out is contained, never cropped. */
function Phone({
  img,
  priority,
  sizes,
  className = "",
  style,
  reveal,
}: {
  img: Shot;
  priority?: boolean;
  sizes: string;
  className?: string;
  style?: CSSProperties;
  reveal?: boolean;
}) {
  return (
    <div
      className={`relative aspect-[23/50] overflow-hidden border border-line bg-bg ${className}`}
      style={style}
      {...(reveal ? { "data-a": "clip" } : {})}
    >
      <Image src={img.src} alt={img.alt} fill priority={priority} sizes={sizes} className="object-contain" />
    </div>
  );
}

function Gallery({ project, images }: { project: Project; images: Project["images"] & {} }) {
  if (project.plate?.shape === "tall") {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-6">
        {images.map((img) => (
          <Phone key={img.src} img={img} reveal sizes="(min-width: 640px) 30vw, 50vw" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      {images.map((img, n) => {
        const wide = images.length % 2 === 1 && n === 0;
        return (
          <div
            key={img.src}
            className={`relative overflow-hidden border border-line bg-surface ${wide ? "sm:col-span-2" : ""}`}
            style={{ aspectRatio: `${img.w} / ${img.h}` }}
            data-a="clip"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes={wide ? "(min-width: 1216px) 70rem, 100vw" : "(min-width: 640px) 50vw, 100vw"}
              className="object-cover"
            />
          </div>
        );
      })}
    </div>
  );
}
