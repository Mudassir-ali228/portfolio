import { principles } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { Stagger, StaggerItem } from "./Reveal";

export function Approach() {
  return (
    <section
      id="approach"
      className="scroll-mt-24 border-y border-line bg-surface py-24 md:py-36"
    >
      <div className="shell">
        <SectionHeader
          n="02"
          title="How I work"
          aside="Four things production taught me"
        />

        <Stagger className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {principles.map((p) => (
            <StaggerItem
              key={p.n}
              className="group relative bg-surface p-7 transition-colors duration-500 hover:bg-raised md:p-10"
            >
              <span className="label transition-colors duration-500 group-hover:text-brass">
                {p.n}
              </span>
              <h3 className="display mt-5 text-[1.4rem] leading-tight md:text-[1.7rem]">
                {p.title}
              </h3>
              <p className="mt-4 max-w-md text-[0.9375rem] leading-[1.75] text-muted">
                {p.body}
              </p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
