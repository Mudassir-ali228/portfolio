import type { CSSProperties, ReactNode } from "react";

/**
 * Server components, all of them. They emit `data-reveal` markers and let
 * CSS do the animating; a single IntersectionObserver (RevealObserver) flips
 * `.is-in` when they scroll into view.
 *
 * This used to be ~60 framer-motion components, each with its own observer
 * and its own JS-driven animation. That was the bulk of the page's hydration
 * cost and none of it needed to run on the client at all.
 */

type Delay = { delay?: number };

function delayStyle(delay?: number): CSSProperties | undefined {
  return delay ? ({ "--reveal-delay": `${delay}s` } as CSSProperties) : undefined;
}

export function Reveal({
  children,
  delay,
  className,
  as: As = "div",
}: Delay & {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "li";
}) {
  return (
    <As className={className} data-reveal="" style={delayStyle(delay)}>
      {children}
    </As>
  );
}

/** Marks a group whose children reveal in sequence. Delays come from CSS
 *  `nth-child`, so nothing here has to know how many children there are. */
export function Stagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className} data-stagger="">
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  as: As = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li";
}) {
  return (
    <As className={className} data-reveal="">
      {children}
    </As>
  );
}

export function GrowRule({ className = "" }: { className?: string }) {
  return <div className={`hairline rule-grow ${className}`} data-reveal="rule" />;
}

/** A heading that uncovers itself line by line from behind a mask. */
export function MaskLines({
  lines,
  className,
  delay = 0,
}: Delay & { lines: ReactNode[]; className?: string }) {
  return (
    <span className={className}>
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span data-reveal="line" style={delayStyle(delay + i * 0.09)}>
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}
