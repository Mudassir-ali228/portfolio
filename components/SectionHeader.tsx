import { GrowRule, Reveal } from "./Reveal";

export function SectionHeader({
  n,
  title,
  aside,
}: {
  n: string;
  title: string;
  aside?: string;
}) {
  return (
    <header className="mb-8 lg:mb-10">
      <Reveal>
        <div className="flex items-baseline justify-between gap-6">
          <span className="label">
            {n} <span className="text-line mx-1">/</span> {title}
          </span>
          {aside ? (
            <span className="label hidden sm:block text-right">{aside}</span>
          ) : null}
        </div>
      </Reveal>
      <GrowRule className="mt-3.5" />
    </header>
  );
}
