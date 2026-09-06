import { capabilities } from "@/lib/content";
import { SectionHeader } from "./SectionHeader";
import { Stagger, StaggerItem } from "./Reveal";

export function Capabilities() {
  const total = capabilities.reduce((n, g) => n + g.items.length, 0);

  return (
    <section
      id="capabilities"
      className="scroll-mt-20 border-y border-line bg-surface py-16 sm:py-20 lg:py-28"
    >
      <div className="shell">
        <SectionHeader
          n="04"
          title="Capabilities"
          aside={`${total} tools · strong opinions about maybe half`}
        />

        <Stagger className="border-t border-line">
          {capabilities.map((group) => (
            <StaggerItem
              key={group.label}
              className="group grid gap-x-10 gap-y-2 border-b border-line py-4 sm:grid-cols-12"
            >
              <h3 className="label pt-0.5 transition-colors duration-300 group-hover:text-brass sm:col-span-3">
                {group.label}
              </h3>
              <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1.5 sm:col-span-9">
                {group.items.map((item, i) => (
                  <li key={item} className="flex items-baseline gap-2">
                    <span className="text-[0.875rem] text-ink">{item}</span>
                    {i < group.items.length - 1 && (
                      <span className="text-[0.4rem] text-line">◆</span>
                    )}
                  </li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
