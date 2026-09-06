import { education, experience, lab } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { Stagger, StaggerItem, Reveal } from "./Reveal";

export function Experience() {
  return (
    <section id="experience" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeader n="03" title="Experience" aside="Internships & education" />

      <div className="grid gap-16 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-7">
          <Stagger className="border-t border-line">
            {experience.map((role) => (
              <StaggerItem
                key={role.org}
                className="grid gap-x-8 gap-y-3 border-b border-line py-8 md:grid-cols-3"
              >
                <div>
                  <p className="label">{role.period}</p>
                  <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-[0.13em] text-muted">
                    {role.place}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="display text-[1.6rem] leading-tight">
                    {role.org}
                  </h3>
                  <p className="mt-1 text-sm text-brass">{role.role}</p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {role.bullets.map((b) => (
                      <li
                        key={b}
                        className="relative pl-5 text-[0.9375rem] leading-relaxed text-muted"
                      >
                        <span className="absolute left-0 top-[0.65em] h-px w-2.5 bg-line" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal className="mt-14">
            <h3 className="label mb-5">Education</h3>
            <ul className="border-t border-line">
              {education.map((e) => (
                <li
                  key={e.school}
                  className="grid gap-x-8 gap-y-1 border-b border-line py-5 md:grid-cols-3"
                >
                  <p className="label">{e.period}</p>
                  <div className="md:col-span-2">
                    <p className="text-base">{e.school}</p>
                    <p className="mt-1 text-sm text-muted">
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

        <div className="md:col-span-4 md:col-start-9">
          <Reveal>
            <h3 className="label mb-5">Lab</h3>
            <p className="mb-8 text-sm leading-relaxed text-muted">
              Smaller builds that existed to answer one question each.
            </p>
          </Reveal>
          <Stagger className="flex flex-col border-t border-line">
            {lab.map((item) => (
              <StaggerItem key={item.title} className="border-b border-line py-6">
                <h4 className="text-[0.9375rem]">{item.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.blurb}
                </p>
                <p className="mt-3 font-mono text-[0.625rem] uppercase tracking-[0.12em] text-faint">
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
