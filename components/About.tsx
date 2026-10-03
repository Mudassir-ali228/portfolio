import type { ReactNode } from "react";
import { education, experience, profile, skills } from "@/lib/content";
import { ScrubText } from "./motion/Split";

export function About() {
  return (
    <section id="about" className="shell scroll-mt-16 pb-24 md:pb-36">
      <div className="relative pt-10 md:pt-14">
        <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 className="label lg:col-span-3 lg:pt-3" data-a="fade">
            About
          </h2>
          <p
            className="display text-[clamp(1.85rem,3.6vw,3.25rem)] leading-[1.12] tracking-[-0.015em] lg:col-span-9"
            data-a="scrub"
          >
            <ScrubText text={profile.about[0]} />
          </p>
        </div>

        <div className="mt-10 grid lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <p className="body-copy max-w-xl lg:col-span-6 lg:col-start-4" data-a="lines">
            {profile.about[1]}
          </p>
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-16 md:mt-28 md:gap-20">
        <Block title="Experience">
          {experience.map((r) => (
            <Entry key={r.org} when={r.period}>
              <h4 className="display display-sm text-[1.5rem] leading-tight">{r.org}</h4>
              <p className="mt-1 text-[0.875rem] text-faint">
                {r.role}, {r.place}
              </p>
              <ul className="mt-4 flex max-w-2xl flex-col gap-2">
                {r.points.map((pt) => (
                  <li key={pt} className="body-copy text-[0.9375rem]">
                    {pt}
                  </li>
                ))}
              </ul>
            </Entry>
          ))}
        </Block>

        <Block title="Education">
          {education.map((e) => (
            <Entry key={e.school} when={e.period}>
              <h4 className="text-[1.0625rem] text-ink">{e.award}</h4>
              <p className="mt-1 text-[0.875rem] text-faint">{e.school}</p>
            </Entry>
          ))}
        </Block>

        <Block title="Skills">
          {skills.map((g) => (
            <Entry key={g.label} when={g.label}>
              <p className="text-[0.9375rem] leading-relaxed text-ink">{g.items.join(", ")}</p>
            </Entry>
          ))}
        </Block>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-4 lg:grid-cols-12 lg:gap-12">
      <h3 className="label lg:col-span-3 lg:pt-6" data-a="fade">
        {title}
      </h3>
      <div className="lg:col-span-9">
        {children}
        <span data-a="rule" className="block h-px bg-line" />
      </div>
    </div>
  );
}

function Entry({ when, children }: { when: string; children: ReactNode }) {
  return (
    <article className="relative grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[11rem_1fr]">
      <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />
      <p className="label pt-1.5 tabular-nums" data-a="fade" data-d="0.1">
        {when}
      </p>
      <div data-a="fade" data-d="0.18">
        {children}
      </div>
    </article>
  );
}
