"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { projects, type Project } from "@/lib/content";
import { Split } from "./motion/Split";
import { Scribble } from "./art/Scribble";

const bySlug = (slug: string) => projects.find((p) => p.slug === slug) ?? projects[0];

/**
 * On large pointer screens the row under the cursor drives the plate on the
 * left: the new project wipes up over the last one. Below `lg` there is no
 * plate, so each row carries its own summary.
 */
export function WorkIndex() {
  const [active, setActive] = useState(projects[0].slug);
  const [under, setUnder] = useState<string | null>(null);
  const project = bySlug(active);

  const show = (slug: string) => {
    if (slug === active) return;
    setUnder(active);
    setActive(slug);
  };

  return (
    <section id="work" className="shell scroll-mt-16 pb-24 md:pb-36">
      <div className="relative pt-10 md:pt-14">
        <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />
        <div className="flex items-end justify-between gap-6">
          <h2
            aria-label="Selected work"
            data-a="chars"
            className="display text-[clamp(3rem,8.5vw,7rem)] leading-[0.9]"
          >
            <Split text="Selected" />{" "}
            <em className="relative italic">
              <Split text="work" />
              <Scribble
                kind="swash"
                seed={5}
                className="-left-[3%] top-[88%] h-[0.28em] w-[106%]"
                start="top 82%"
                end="top 52%"
              />
            </em>
          </h2>
          <p className="label shrink-0 pb-2" data-a="fade" data-d="0.4">
            {projects.length} projects
          </p>
        </div>
      </div>

      <div className="mt-12 grid gap-10 lg:mt-20 lg:grid-cols-12 lg:gap-14">
        <div className="hidden lg:col-span-6 lg:block">
          <div className="sticky top-24">
            <div
              className="relative aspect-[16/9] overflow-hidden border border-line bg-surface"
              data-a="clip"
              data-noscale=""
            >
              {under && <Layer key={`u-${under}`} project={bySlug(under)} />}
              <Layer key={active} project={project} enter={under !== null} />
            </div>
            <div key={project.slug} className="fade-swap">
              <p className="body-copy mt-6 max-w-lg text-[0.9375rem]">{project.blurb}</p>
              <dl className="mt-6 border-t border-line">
                <Row k="Type" v={project.context} />
                <Row k="Year" v={project.year} />
                <Row k="Stack" v={project.stack.join(", ")} />
              </dl>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <ol className="work-list">
            {projects.map((p) => (
              <li key={p.slug} className="relative">
                <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />
                <Link
                  href={`/work/${p.slug}`}
                  data-title={p.title}
                  className="index-row flex w-full items-baseline gap-x-4 py-6 sm:gap-x-6"
                  onMouseEnter={() => show(p.slug)}
                  onFocus={() => show(p.slug)}
                >
                  <span className="label w-6 shrink-0 tabular-nums" data-a="fade" data-d="0.15">
                    {p.index}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="row-title block">
                      <span
                        className="display block text-[clamp(1.6rem,4.2vw,2.25rem)] leading-tight"
                        data-a="words"
                        data-d="0.05"
                      >
                        <Split text={p.title} by="words" />
                      </span>
                    </span>
                    <span className="mt-1.5 block text-[0.8125rem] text-faint" data-a="fade" data-d="0.2">
                      {p.kind}
                    </span>
                    <span
                      className="mt-2.5 block max-w-md text-[0.875rem] leading-relaxed text-muted lg:hidden"
                      data-a="fade"
                      data-d="0.25"
                    >
                      {p.blurb}
                    </span>
                  </span>
                  <span className="label hidden shrink-0 tabular-nums sm:block" data-a="fade" data-d="0.2">
                    {p.year}
                  </span>
                  <span className="row-arrow shrink-0 text-brass" aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
          <span data-a="rule" className="block h-px bg-line" />
        </div>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-6 border-b border-line py-2.5">
      <dt className="label w-16 shrink-0 pt-0.5">{k}</dt>
      <dd className="text-[0.875rem] leading-relaxed text-ink">{v}</dd>
    </div>
  );
}

/** One project's plate. `enter` wipes it up over whatever is beneath. */
function Layer({ project, enter = false }: { project: Project; enter?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!enter || !el || !document.documentElement.classList.contains("motion")) return;
    const img = el.querySelectorAll("img");
    const tl = gsap.timeline();
    tl.fromTo(
      el,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.out" },
    );
    if (img.length) tl.fromTo(img, { scale: 1.12 }, { scale: 1, duration: 1.3, ease: "expo.out" }, 0);
    return () => {
      tl.kill();
    };
  }, [enter]);

  const plate = project.plate;

  return (
    <div ref={ref} className="absolute inset-0 bg-surface">
      {plate?.shape === "wide" ? (
        <Image
          src={plate.images[0].src}
          alt={plate.images[0].alt}
          fill
          sizes="(min-width: 1024px) 36rem, 100vw"
          className="object-cover object-top"
        />
      ) : plate?.shape === "tall" ? (
        <div className="flex h-full items-center justify-center gap-3 px-6 py-5">
          {plate.images.slice(0, 3).map((img) => (
            <Image
              key={img.src}
              src={img.src}
              alt={img.alt}
              width={img.w}
              height={img.h}
              sizes="10rem"
              className="h-full w-auto border border-line object-contain"
            />
          ))}
        </div>
      ) : project.diagram ? (
        <div className="flex h-full items-center overflow-x-auto p-7">
          <pre className="font-mono text-[0.6875rem] leading-loose text-muted">
            {project.diagram.join("\n")}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
