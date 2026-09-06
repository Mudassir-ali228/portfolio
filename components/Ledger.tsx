import { education, experience, lab } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { Reveal, Stagger, StaggerItem } from "./Reveal";

/**
 * Experience, education and the small experiments, in one block. They are all
 * the same kind of information — a date, a place, a line about what happened —
 * so they read better as one ledger than as three sections with headers.
 */
export function Ledger() {
  return (
    <section id="experience" className="shell scroll-mt-20 py-16 sm:py-20 lg:py-28">
      <SectionHeader n="03" title="Track record" aside="Roles, study, side quests" />

      <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <Stagger className="border-t border-line">
            {experience.map((role) => (
              <StaggerItem
                key={role.org}
                className="grid gap-x-8 gap-y-2 border-b border-line py-6 sm:grid-cols-4"
              >
                <div className="sm:col-span-1">
                  <p className="label">{role.period}</p>
                  <p className="mt-1 font-mono text-[0.625rem] uppercase tracking-[0.13em] text-muted">
                    {role.place}
                  </p>
                </div>
                <div className="sm:col-span-3">
                  <h3 className="display text-[1.3rem] leading-tight">{role.org}</h3>
                  <p className="mt-0.5 text-[0.8125rem] text-brass">{role.role}</p>
                  <ul className="mt-3 flex flex-col gap-2">
                    {role.bullets.map((b) => (
                      <li
                        key={b}
                        className="relative pl-5 text-[0.875rem] leading-relaxed text-muted"
                      >
                        <span className="absolute left-0 top-[0.62em] h-px w-2.5 bg-line" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-10">
            <p className="label mb-3">Education</p>
            <ul className="border-t border-line">
              {education.map((e) => (
                <li
                  key={e.school}
                  className="grid gap-x-8 gap-y-0.5 border-b border-line py-4 sm:grid-cols-4"
                >
                  <p className="label sm:col-span-1">{e.period}</p>
                  <div className="sm:col-span-3">
                    <p className="text-[0.9375rem]">{e.school}</p>
                    <p className="mt-0.5 text-[0.8125rem] text-muted">
                      {e.award}
                      <span className="mx-2 text-line">·</span>
                      {e.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <div className="lg:col-span-4 lg:col-start-9">
          <Reveal>
            <p className="label mb-1.5">Side quests</p>
            <p className="mb-5 text-[0.8125rem] leading-relaxed text-muted">
              Small builds that each existed to answer exactly one question.
            </p>
          </Reveal>
          <Stagger className="border-t border-line">
            {lab.map((item) => (
              <StaggerItem key={item.title} className="border-b border-line py-5">
                <h4 className="text-[0.9375rem]">{item.title}</h4>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-muted">
                  {item.blurb}
                </p>
                <p className="mt-2.5 font-mono text-[0.5625rem] uppercase tracking-[0.12em] text-faint">
                  {item.stack.join(" · ")}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </div>
    </section>
  );
}
