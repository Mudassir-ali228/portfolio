"use client";

import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useState } from "react";
import { archive, featured, type Project } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Work() {
  const [active, setActive] = useState<Project | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 220, damping: 26, mass: 0.45 });
  const sy = useSpring(y, { stiffness: 220, damping: 26, mass: 0.45 });

  function track(e: React.MouseEvent) {
    x.set(e.clientX);
    y.set(e.clientY);
  }

  return (
    <section id="work" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeader
        n="01"
        title="Selected work"
        aside={`${featured.length} case studies`}
      />

      <div onMouseMove={track}>
        {featured.map((p, i) => (
          <WorkRow
            key={p.slug}
            project={p}
            i={i}
            onEnter={() => setActive(p)}
            onLeave={() => setActive(null)}
          />
        ))}
      </div>

      {/* Follows the pointer, never touches it. Desktop only — a preview
          that chases a finger is just a thing in the way. */}
      <AnimatePresence>
        {active && (
          <motion.div
            key={active.slug}
            className="pointer-events-none fixed left-0 top-0 z-40 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
            style={{ x: sx, y: sy }}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Preview project={active} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-24 md:mt-32">
        <Reveal>
          <h3 className="label mb-5">Also built</h3>
        </Reveal>
        <ul className="border-t border-line">
          {archive.map((p, i) => (
            <ArchiveRow key={p.slug} project={p} i={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function Preview({ project }: { project: Project }) {
  const shot = project.accentImages?.[0];

  if (shot) {
    return (
      <div className="w-[26rem] overflow-hidden rounded-sm border border-line bg-surface shadow-[var(--shadow-lift)]">
        <Image
          src={shot.src}
          alt=""
          width={1600}
          height={900}
          className="h-auto w-full"
          sizes="26rem"
        />
      </div>
    );
  }

  return (
    <div className="w-[30rem] rounded-sm border border-line bg-surface p-6 shadow-[var(--shadow-lift)]">
      <p className="label mb-4">Pipeline</p>
      <pre className="overflow-hidden font-mono text-[0.6875rem] leading-relaxed text-muted">
        {project.diagram?.join("\n")}
      </pre>
    </div>
  );
}

function WorkRow({
  project,
  i,
  onEnter,
  onLeave,
}: {
  project: Project;
  i: number;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const inner = (
    <div className="relative grid grid-cols-1 items-start gap-x-6 gap-y-4 py-8 md:grid-cols-12 md:py-10">
      <span className="label transition-colors duration-500 group-hover:text-brass md:col-span-1">
        {project.index}
      </span>

      <div className="md:col-span-5">
        <h3 className="display text-[clamp(1.9rem,4.6vw,3.1rem)] transition-transform duration-700 ease-[var(--ease-out-expo)] md:group-hover:translate-x-2">
          {project.title}
        </h3>
        <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-faint">
          {project.kind}
        </p>
      </div>

      <div className="md:col-span-4">
        <p className="max-w-md text-[0.9375rem] leading-relaxed text-muted">
          {project.blurb}
        </p>
        <ul className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1">
          {project.stack.slice(0, 5).map((s, n) => (
            <li
              key={s}
              className="flex items-baseline gap-2 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-faint"
            >
              {s}
              {n < Math.min(project.stack.length, 5) - 1 && (
                <span className="text-[0.4rem] text-line">◆</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center justify-between md:col-span-2 md:flex-col md:items-end md:gap-3">
        <span className="label">{project.period}</span>
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors duration-500 group-hover:text-brass">
          Read
          <span className="ml-2 inline-block transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px -10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: Math.min(i, 3) * 0.05 }}
      className="border-t border-line last:border-b"
    >
      <Link
        href={`/work/${project.slug}`}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        className="group relative block"
      >
        <span className="pointer-events-none absolute inset-x-[-1.5rem] inset-y-0 -z-10 rounded-sm bg-brass-soft opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        {inner}
      </Link>
    </motion.div>
  );
}

function ArchiveRow({ project, i }: { project: Project; i: number }) {
  const body = (
    <div className="grid grid-cols-1 items-baseline gap-x-6 gap-y-1 py-5 md:grid-cols-12">
      <span className="label md:col-span-1">{project.index}</span>
      <h4 className="text-base md:col-span-3">{project.title}</h4>
      <p className="text-sm text-muted md:col-span-5">{project.blurb}</p>
      <p className="font-mono text-[0.625rem] uppercase tracking-[0.12em] text-faint md:col-span-2">
        {project.stack.slice(0, 3).join(" · ")}
      </p>
      <span className="label md:col-span-1 md:text-right">{project.period}</span>
    </div>
  );

  return (
    <motion.li
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px" }}
      transition={{ duration: 0.7, ease: EASE, delay: Math.min(i, 4) * 0.04 }}
      className="border-b border-line"
    >
      {project.href ? (
        <a
          href={project.href}
          target="_blank"
          rel="noreferrer noopener"
          className="group block transition-colors duration-500 hover:text-brass"
        >
          {body}
        </a>
      ) : project.study ? (
        <Link
          href={`/work/${project.slug}`}
          className="group block transition-colors duration-500 hover:text-brass"
        >
          {body}
        </Link>
      ) : (
        body
      )}
    </motion.li>
  );
}
