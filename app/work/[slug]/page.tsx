import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Reveal, Stagger, StaggerItem, GrowRule } from "@/components/Reveal";
import { caseStudies, projects } from "@/lib/content";

export function generateStaticParams() {
  return caseStudies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return { title: project.title, description: project.blurb };
}

export default async function CaseStudy({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project?.study) notFound();

  const { study } = project;
  const order = caseStudies.findIndex((p) => p.slug === slug);
  const next = caseStudies[(order + 1) % caseStudies.length];

  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        {/* ------------------------------------------------ masthead */}
        <header className="shell pt-32 md:pt-44">
          <Link
            href="/#work"
            className="label transition-colors duration-300 hover:text-brass"
          >
            ← All work
          </Link>

          <div className="mt-8 flex items-baseline gap-5">
            <span className="label">{project.index}</span>
            <GrowRule className="flex-1" />
            <span className="label">{project.context}</span>
          </div>

          {/* CSS, not framer-motion: this is the LCP element and a JS
              animation would not start until hydration. */}
          <h1 className="display mt-6 text-[clamp(2.8rem,9vw,7rem)]">
            <span className="line-mask">
              <span className="line-rise">{project.title}</span>
            </span>
          </h1>

          <p
            className="prose-lede fade-up mt-6 max-w-2xl text-balance"
            style={{ animationDelay: "0.18s" }}
          >
            {project.blurb}
          </p>

          {project.href && (
            <a
              href={project.href}
              target="_blank"
              rel="noreferrer noopener"
              className="btn-ghost fade-up mt-6"
              style={{ animationDelay: "0.22s" }}
            >
              Visit the live site
              <span className="btn-arrow">↗</span>
            </a>
          )}

          <dl
            className="fade-up mt-12 grid gap-x-8 gap-y-7 border-t border-line pt-7 sm:grid-cols-2 lg:grid-cols-4"
            style={{ animationDelay: "0.26s" }}
          >
              <div>
                <dt className="label">Type</dt>
                <dd className="mt-2 text-sm">{project.kind}</dd>
              </div>
              <div>
                <dt className="label">Period</dt>
                <dd className="mt-2 text-sm">{project.period}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="label">Stack</dt>
                <dd className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1.5 text-sm">
                  {project.stack.map((s, i) => (
                    <span key={s} className="flex items-baseline gap-2.5">
                      {s}
                      {i < project.stack.length - 1 && (
                        <span className="text-[0.5rem] text-line">◆</span>
                      )}
                    </span>
                  ))}
                </dd>
              </div>
            </dl>
        </header>

        {/* ------------------------------------------------- metrics */}
        {/* Also CSS: on a short masthead these tiles sit at the fold, and a
            JS reveal made one of the captions the LCP element at ~1.1s. */}
        <section className="shell mt-20 md:mt-28">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {study.metrics.map((m, i) => (
              <div
                key={m.label}
                className="fade-up bg-bg p-7 md:p-9"
                style={{ animationDelay: `${0.06 + i * 0.07}s` }}
              >
                <p className="display text-[clamp(2.2rem,5vw,3.4rem)] text-brass">
                  {m.value}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ------------------------------------------------- diagram */}
        {project.diagram && (
          <section className="shell mt-20 md:mt-28">
            <Reveal>
              <p className="label mb-4">The shape of it</p>
              <div className="overflow-x-auto rounded-sm border border-line bg-surface p-7 md:p-10">
                <pre className="font-mono text-[0.75rem] leading-loose text-muted md:text-[0.8125rem]">
                  {project.diagram.join("\n")}
                </pre>
              </div>
            </Reveal>
          </section>
        )}

        {/* -------------------------------------------------- prose */}
        <section className="shell mt-24 md:mt-32">
          <div className="grid gap-12 lg:grid-cols-12 md:gap-10">
            <div className="lg:col-span-3">
              <Reveal>
                <h2 className="label sticky top-28">The problem</h2>
              </Reveal>
            </div>
            <div className="lg:col-span-8 lg:col-start-5">
              <Reveal>
                <p className="text-[1.0625rem] leading-[1.8] text-ink md:text-[1.125rem]">
                  {study.problem}
                </p>
              </Reveal>
            </div>
          </div>

          <div className="mt-20 grid gap-12 md:mt-28 lg:grid-cols-12 md:gap-10">
            <div className="lg:col-span-3">
              <Reveal>
                <h2 className="label sticky top-28">The approach</h2>
              </Reveal>
            </div>
            <Stagger className="flex flex-col lg:col-span-8 lg:col-start-5">
              {study.approach.map((step, i) => (
                <StaggerItem
                  key={i}
                  className="flex gap-6 border-b border-line py-7 first:border-t"
                >
                  <span className="label pt-1.5">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-[0.9375rem] leading-[1.8] text-muted">
                    {step}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>

          <div className="mt-20 grid gap-12 md:mt-28 lg:grid-cols-12 md:gap-10">
            <div className="lg:col-span-3">
              <Reveal>
                <h2 className="label sticky top-28">Decisions</h2>
              </Reveal>
            </div>
            <Stagger className="flex flex-col gap-10 lg:col-span-8 lg:col-start-5">
              {study.decisions.map((d) => (
                <StaggerItem key={d.title}>
                  <h3 className="display text-[1.35rem] leading-snug md:text-[1.6rem]">
                    {d.title}
                  </h3>
                  <p className="mt-3 text-[0.9375rem] leading-[1.8] text-muted">
                    {d.body}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>

        {/* ------------------------------------------------- gallery */}
        {project.accentImages && (
          <section className="shell mt-24 md:mt-32">
            <Reveal>
              <p className="label mb-5">Stills</p>
            </Reveal>
            <Stagger
              className={
                project.plate?.shape === "tall"
                  ? "grid grid-cols-2 gap-4 sm:grid-cols-3"
                  : "grid gap-4 sm:grid-cols-2"
              }
            >
              {project.accentImages.map((img, i) => (
                <StaggerItem
                  key={img.src}
                  className={
                    i === 0 && project.plate?.shape !== "tall"
                      ? "overflow-hidden rounded-sm border border-line sm:col-span-2"
                      : "overflow-hidden rounded-sm border border-line"
                  }
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    width={project.plate?.shape === "tall" ? 650 : 1600}
                    height={project.plate?.shape === "tall" ? 1400 : 900}
                    className="h-auto w-full"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 22rem"
                  />
                </StaggerItem>
              ))}
            </Stagger>
          </section>
        )}

        {/* ---------------------------------------------------- next */}
        <section className="mt-28 border-t border-line md:mt-40">
          <Link href={`/work/${next.slug}`} className="group block">
            <div className="shell flex flex-col gap-4 py-16 md:flex-row md:items-end md:justify-between md:py-24">
              <div>
                <p className="label mb-4">Next case study</p>
                <h2 className="display text-[clamp(2.2rem,6vw,4.5rem)] transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover:translate-x-3">
                  {next.title}
                </h2>
              </div>
              <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors duration-500 group-hover:text-brass">
                {next.kind}
                <span className="ml-3 inline-block transition-transform duration-500 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </div>
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
