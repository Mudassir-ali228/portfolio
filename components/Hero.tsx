import type { CSSProperties } from "react";
import { profile } from "@/lib/content";
import { Split } from "./motion/Split";
import { Figure } from "./art/Figure";

const links = [
  { label: "Email", href: `mailto:${profile.email}` },
  { label: "CV", href: profile.cv, external: true },
  { label: "GitHub", href: profile.github, external: true },
  { label: "LinkedIn", href: profile.linkedin, external: true },
];

const d = (s: number) => ({ "--d": `${s}s` }) as CSSProperties;

export function Hero() {
  const [first, last] = profile.name.split(" ");

  return (
    <section className="relative overflow-hidden">
      <div className="shell relative flex min-h-[100svh] flex-col justify-end pb-8 pt-28 md:pb-10">
        <h1
          aria-label={profile.name}
          className="display relative z-10 text-[clamp(4rem,19.5vw,12.5rem)] leading-[0.84]"
        >
          <span className="block" data-a="drift" data-x="-5">
            <span className="load-chars block" style={d(0.1)}>
              <Split text={first} />
            </span>
          </span>
          <span className="block pl-[0.85em] md:pl-[1.5em]" data-a="drift" data-x="7">
            <span className="load-chars block" style={d(0.28)}>
              <Split text={last} />
            </span>
          </span>
        </h1>

        <p className="lede load-words relative z-10 mt-9 max-w-[34rem] md:mt-12" style={d(0.7)}>
          <Split text={profile.headline} by="words" />
        </p>

        <div className="relative mt-12 pt-6 md:mt-16">
          {/* The tree grows from this rule, behind the name, and draws back
              into its trunk as the page scrolls away. */}
          <div className="pointer-events-none absolute bottom-full right-[-10vw] z-0 w-[min(84vw,50svh)] opacity-40 sm:right-0 sm:opacity-60 md:w-[min(46rem,54vw,76svh)] md:opacity-100">
            <Figure
              kind="tree"
              label="Fig. 1"
              note="Each branch splits in two until nine levels deep. A new tree on every visit."
              when="load"
              delay={0.45}
              retract={0.18}
              regrow="Grow another"
              captionInside
              captionClassName="hidden max-w-[17rem] pb-3 md:block load-fade"
            />
          </div>
          <span className="load-rule absolute inset-x-0 top-0 h-px bg-line" style={d(0.85)} />
          <div className="flex flex-col gap-5 sm:flex-row sm:items-baseline sm:justify-between">
            <p className="label load-fade" style={d(1.05)}>
              {profile.status}
            </p>
            <ul className="flex flex-wrap gap-x-7 gap-y-2 text-[0.9375rem]">
              {links.map((l, i) => (
                <li key={l.label} className="load-fade" style={d(1.1 + i * 0.06)}>
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
      </div>
    </section>
  );
}
