import { principles, profile } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { MaskLines, Reveal, Stagger, StaggerItem } from "./Reveal";

/**
 * About and How-I-Work used to be two full sections with a lot of air between
 * them. They answer the same question, so they now sit side by side: the
 * story on the left, the rules it produced on the right.
 */
export function Profile() {
  return (
    <section
      id="profile"
      className="scroll-mt-20 border-y border-line bg-surface py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <SectionHeader n="02" title="Profile" aside="And the rules it produced" />

        <div className="grid gap-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 className="display text-[clamp(1.9rem,4vw,2.9rem)]">
              <MaskLines
                lines={[
                  <span key="1">Systems where</span>,
                  <span key="2">
                    <em className="not-italic text-brass">close enough</em>
                  </span>,
                  <span key="3">is not a category.</span>,
                ]}
              />
            </h2>

            <Stagger className="mt-7 flex flex-col gap-4">
              {profile.intro.map((para, i) => (
                <StaggerItem key={i}>
                  <p
                    className={
                      i === 0
                        ? "text-[1.0625rem] leading-[1.68] text-ink"
                        : "text-[0.9375rem] leading-[1.7] text-muted"
                    }
                  >
                    {para}
                  </p>
                </StaggerItem>
              ))}
            </Stagger>

            {/* For the reader who takes two paragraphs and then wants the
                facts. Which is most of them. */}
            <Reveal delay={0.15}>
              <dl className="mt-8 border-t border-line">
                {profile.facts.map((f) => (
                  <div
                    key={f.k}
                    className="flex items-baseline justify-between gap-6 border-b border-line py-2.5"
                  >
                    <dt className="label">{f.k}</dt>
                    <dd className="text-right text-[0.875rem] text-ink">{f.v}</dd>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>

          <div className="lg:col-span-6 lg:col-start-7">
            <Reveal>
              <p className="label mb-4">Four things production taught me</p>
            </Reveal>
            <Stagger className="border-t border-line">
              {principles.map((p) => (
                <StaggerItem
                  key={p.n}
                  className="group flex gap-5 border-b border-line py-5"
                >
                  <span className="label shrink-0 pt-0.5 tabular-nums transition-colors duration-300 group-hover:text-brass">
                    {p.n}
                  </span>
                  <div>
                    <h3 className="display text-[1.15rem] leading-snug md:text-[1.3rem]">
                      {p.title}
                    </h3>
                    <p className="mt-1.5 text-[0.875rem] leading-[1.7] text-muted">
                      {p.body}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </div>
    </section>
  );
}
