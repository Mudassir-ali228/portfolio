import { profile } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { MaskLines, Reveal, Stagger, StaggerItem } from "./Reveal";

export function About() {
  return (
    <section id="about" className="shell scroll-mt-24 py-24 md:py-36">
      <SectionHeader n="00" title="Profile" aside={profile.location} />

      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <h2 className="display text-[clamp(2rem,4.6vw,3.4rem)]">
            <MaskLines
              lines={[
                <span key="1">Systems where</span>,
                <span key="2">
                  <em className="not-italic text-brass">close enough</em>
                </span>,
                <span key="3">is not enough.</span>,
              ]}
            />
          </h2>

          <Reveal delay={0.2}>
            <dl className="mt-12 flex flex-col border-t border-line">
              {[
                { k: "Based in", v: profile.location },
                { k: "Focus", v: "Backend & distributed systems" },
                { k: "Also", v: "Unity engines & cross-platform mobile" },
                { k: "Graduating", v: "June 2026" },
              ].map((row) => (
                <div
                  key={row.k}
                  className="flex items-baseline justify-between gap-6 border-b border-line py-3.5"
                >
                  <dt className="label">{row.k}</dt>
                  <dd className="text-right text-sm text-ink">{row.v}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Stagger className="flex flex-col gap-6 md:col-span-6 md:col-start-7">
          {profile.intro.map((para, i) => (
            <StaggerItem key={i}>
              <p
                className={
                  i === 0
                    ? "prose-lede text-ink"
                    : "text-[0.9375rem] leading-[1.75] text-muted"
                }
              >
                {para}
              </p>
            </StaggerItem>
          ))}

        </Stagger>
      </div>
    </section>
  );
}
