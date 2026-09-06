"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { projects, type Project } from "@/lib/content";
import { GrowRule, Reveal } from "./Reveal";

/**
 * A gallery index rather than a list of cards. Everything is on one screen and
 * the row you point at drives the plate beside it — the spotlight comes from
 * dimming the other rows, not from decorating the active one, which is what
 * keeps a list of ten from reading as noise.
 *
 * Below `lg` the plate is dropped and the dimming with it: there is no hover
 * on a touch screen, so every row carries its own summary at full contrast.
 */
export function WorkIndex() {
  const [activeSlug, setActiveSlug] = useState(projects[0].slug);
  const active = projects.find((p) => p.slug === activeSlug) ?? projects[0];

  return (
    <section id="work" className="shell scroll-mt-20 py-14 sm:py-16 lg:py-24">
      <Reveal>
        <div className="flex items-baseline justify-between gap-6">
          <span className="label">01 — Selected work</span>
          <span className="label tabular-nums">
            <span className="text-brass">{active.index}</span>
            <span className="mx-1 text-line">/</span>
            {String(projects.length).padStart(2, "0")}
          </span>
        </div>
      </Reveal>
      <GrowRule className="mt-3.5" />

      <div className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:gap-14">
        {/* ------------------------------------------------- the plate */}
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-28">
            <div className="flex items-baseline gap-4">
              <span
                key={`n-${active.slug}`}
                className="panel-fade display text-[clamp(2.5rem,4vw,3.5rem)] leading-none text-line"
              >
                {active.index}
              </span>
              <span
                key={`k-${active.slug}`}
                className="panel-fade font-mono text-[0.625rem] uppercase tracking-[0.18em] text-faint"
              >
                {active.kind}
              </span>
            </div>

            <div className="mt-4">
              <Plate project={active} />
            </div>

            <dl
              key={`m-${active.slug}`}
              className="panel-fade mt-6 border-t border-line"
            >
              <Row k="Type" v={active.context} />
              <Row k="Year" v={active.period} />
              <Row k="Stack" v={active.stack.join(" · ")} />
            </dl>

            <p
              key={`b-${active.slug}`}
              className="panel-fade mt-5 max-w-lg text-[0.9375rem] leading-relaxed text-muted"
            >
              {active.blurb}
            </p>

            {active.note && (
              <p
                key={`no-${active.slug}`}
                className="panel-fade mt-3 max-w-lg border-l border-brass/40 pl-3.5 text-[0.8125rem] italic leading-relaxed text-faint"
              >
                {active.note}
              </p>
            )}

            <p className="mt-6 font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted">
              {active.study
                ? "Open the case study →"
                : active.href
                  ? "Visit the site ↗"
                  : "No write-up — ask me about it"}
            </p>
          </div>
        </div>

        {/* ------------------------------------------------- the index */}
        {/* The padding is load-bearing: the sticky plate unsticks when its grid
            column ends, so without room below the last row the plate slides
            out of view exactly when you reach the bottom of the list. */}
        <ol
          className="work-list lg:col-span-6 lg:pb-72"
          onMouseLeave={() => setActiveSlug(projects[0].slug)}
        >
          {projects.map((p) => (
            <IndexRow
              key={p.slug}
              project={p}
              isActive={p.slug === active.slug}
              onFocus={() => setActiveSlug(p.slug)}
            />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-6 border-b border-line py-2">
      <dt className="label w-20 shrink-0">{k}</dt>
      <dd className="text-[0.8125rem] leading-relaxed text-ink">{v}</dd>
    </div>
  );
}

function Plate({ project }: { project: Project }) {
  const plate = project.plate;

  if (plate?.shape === "wide") {
    const img = plate.images[0];
    return (
      <div className="overflow-hidden rounded-sm border border-line bg-surface">
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          width={1600}
          height={900}
          className="plate-fade h-auto w-full"
          sizes="(max-width: 1024px) 100vw, 40rem"
          priority
        />
      </div>
    );
  }

  /* Phone screenshots are roughly 1:2.2. Cropping one into a 16:9 box throws
     away the screen; letterboxing one wastes two thirds of the plate. Three
     of them stood side by side fill it and show three times as much app. */
  if (plate?.shape === "tall") {
    return (
      <div
        key={project.slug}
        className="plate-fade flex aspect-[16/9] items-center justify-center gap-3 overflow-hidden rounded-sm border border-line bg-surface px-5 py-4"
      >
        {plate.images.slice(0, 3).map((img) => (
          <div
            key={img.src}
            className="h-full overflow-hidden rounded-[3px] border border-line"
          >
            <Image
              src={img.src}
              alt={img.alt}
              width={650}
              height={1400}
              className="h-full w-auto object-contain"
              sizes="180px"
              priority
            />
          </div>
        ))}
      </div>
    );
  }

  if (project.diagram) {
    return (
      <div className="flex aspect-[16/9] items-center rounded-sm border border-line bg-surface p-7">
        <pre
          key={project.slug}
          className="plate-fade w-full overflow-x-auto font-mono text-[0.6875rem] leading-loose text-muted"
        >
          {project.diagram.join("\n")}
        </pre>
      </div>
    );
  }

  // Nothing to show but the fact of it — so show that, quietly.
  return (
    <div
      key={project.slug}
      className="plate-fade flex aspect-[16/9] items-end rounded-sm border border-line bg-surface p-7"
    >
      <span className="display text-[clamp(1.6rem,3vw,2.4rem)] leading-tight text-line">
        {project.title}
      </span>
    </div>
  );
}

function IndexRow({
  project,
  isActive,
  onFocus,
}: {
  project: Project;
  isActive: boolean;
  onFocus: () => void;
}) {
  // The write-up wins when a project has both: it says more, and it carries
  // the link out to the live site anyway.
  const href = project.study ? `/work/${project.slug}` : project.href;
  const external = !project.study && Boolean(project.href);

  const inner = (
    <>
      <span className="label shrink-0 pt-[0.42rem] tabular-nums">{project.index}</span>

      <span className="min-w-0 flex-1">
        <span className="display block text-[clamp(1.4rem,4.4vw,2.05rem)] leading-tight">
          {project.title}
        </span>
        <span className="mt-1 block font-mono text-[0.5625rem] uppercase tracking-[0.16em] text-faint sm:text-[0.625rem]">
          {project.kind}
        </span>
        {/* No plate on touch, so the row has to carry the summary itself. */}
        <span className="mt-2 block max-w-md text-[0.8125rem] leading-relaxed text-muted lg:hidden">
          {project.blurb}
        </span>
      </span>

      <span className="label shrink-0 pt-[0.42rem] tabular-nums">{project.period}</span>

      <span
        className="row-arrow shrink-0 pt-[0.3rem] font-mono text-xs text-brass"
        aria-hidden="true"
      >
        {external ? "↗" : "→"}
      </span>
    </>
  );

  const shared =
    "index-row group flex w-full items-start gap-x-4 py-4 text-left sm:gap-x-6 sm:py-5";

  return (
    <li className="border-b border-line first:border-t" data-reveal="">
      {href ? (
        external ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            className={shared}
            onMouseEnter={onFocus}
            onFocus={onFocus}
          >
            {inner}
          </a>
        ) : (
          <Link href={href} className={shared} onMouseEnter={onFocus} onFocus={onFocus}>
            {inner}
          </Link>
        )
      ) : (
        <div className={shared} onMouseEnter={onFocus}>
          {inner}
        </div>
      )}
    </li>
  );
}
