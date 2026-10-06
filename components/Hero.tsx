import type { CSSProperties } from "react";
import { profile } from "@/lib/content";
import { LEVEL, TRUNK, splitDepths } from "@/lib/intro";
import { Split } from "./motion/Split";
import { HeroTree } from "./art/HeroTree";

const links = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "CV", href: profile.cv, external: true },
  { label: "GitHub", href: profile.github, external: true },
  { label: "LinkedIn", href: profile.linkedin, external: true },
];

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

/**
 * The name, letter by letter, timed to the tree: each letter rises as the
 * level of the tree at its own depth starts to grow (see lib/intro.ts).
 */
function Name({ words }: { words: string[] }) {
  const letters = words.join("").length;
  const depth = splitDepths(letters);
  // Letters at the same depth arrive a beat apart, left to right.
  const seen = new Map<number, number>();
  let n = 0;
  return words.map((word, w) => (
    <span
      key={word}
      className={w === 0 ? "block" : "block pl-[0.62em] italic md:pl-[1.3em]"}
      data-a="drift"
      data-x={w === 0 ? "-5" : "7"}
    >
      <span className="load-grow block" aria-hidden="true">
        {/* The italic leans past its own box; widen the mask so it is not cut. */}
        <span className={w === 0 ? "split-w whitespace-nowrap" : "split-w whitespace-nowrap pr-[0.14em] mr-[-0.14em]"}>
          {Array.from(word).map((ch, j) => {
            const k = depth[n++];
            const beat = seen.get(k) ?? 0;
            seen.set(k, beat + 1);
            const t = TRUNK + k * LEVEL + beat * 0.045;
            return (
              <span key={j} className="split-c" style={{ "--t": `${t.toFixed(3)}s` } as CSSProperties}>
                {ch}
              </span>
            );
          })}
        </span>
      </span>
    </span>
  ));
}

export function Hero() {
  return (
    <section className="hero-clock relative overflow-hidden">
      {/* Phones and tablets: the name, the tree on its ground with the
          caption under it, then the rest. Desktop: the tree stands on the
          right with the name across its trunk, on the same ground as the
          links. */}
      <div className="shell grid min-h-[100svh] grid-cols-1 grid-rows-[auto_minmax(9rem,1fr)_auto_auto_auto_auto] pb-7 pt-[5.5rem] md:pt-24 lg:grid-cols-12 lg:grid-rows-[minmax(0,1fr)_auto_auto_auto_auto] lg:gap-x-10 lg:pb-10 lg:pt-28">
        <HeroTree />

        <h1
          aria-label={profile.name}
          data-handoff=""
          className="display relative z-10 col-start-1 row-start-1 text-[clamp(3.6rem,22.5vw,12.5rem)] leading-[0.86] lg:col-end-13 lg:row-start-2"
        >
          <Name words={profile.name.split(" ")} />
        </h1>

        <p
          className="lede load-words relative z-10 col-start-1 row-start-5 mt-6 max-w-[34rem] md:mt-8 lg:col-end-8 lg:row-start-3 lg:mt-12 lg:pb-16"
          style={d(1.05)}
        >
          <Split text={profile.headline} by="words" />
        </p>

        <div className="col-start-1 row-start-6 mt-10 flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between lg:col-end-13 lg:row-start-5 lg:mt-0 lg:pt-6">
          <p className="label load-fade" style={d(1.35)}>
            {profile.status}
          </p>
          <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9375rem]">
            {links.map((l, i) => (
              <li key={l.label} className="load-fade" style={d(1.4 + i * 0.06)}>
                <a
                  href={l.href}
                  className="text-link"
                  {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
