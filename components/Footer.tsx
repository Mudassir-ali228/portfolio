import { profile } from "@/lib/content";
import { LocalTime } from "./LocalTime";

export function Footer() {
  return (
    <footer className="overflow-hidden border-t border-line">
      {/* The name at the size it deserves, once, on the way out. */}
      <div className="shell pt-8">
        <p
          className="display select-none whitespace-nowrap text-[clamp(2rem,12.2vw,11rem)] leading-[0.85] text-line"
          aria-hidden="true"
        >
          {profile.first} {profile.last}
          <span className="text-brass">.</span>
        </p>
      </div>

      <div className="shell flex flex-col gap-4 border-t border-line py-6 md:flex-row md:items-center md:justify-between">
        <p className="label">
          {profile.role} <span className="mx-1 text-line">/</span> <LocalTime />
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {[
            { label: "Email", href: `mailto:${profile.email}` },
            { label: "GitHub", href: profile.github },
            { label: "LinkedIn", href: profile.linkedin },
            { label: "CV", href: profile.cv },
          ].map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith("http") || l.href.endsWith(".pdf") ? "_blank" : undefined}
                rel={l.href.startsWith("http") || l.href.endsWith(".pdf") ? "noreferrer noopener" : undefined}
                className="font-mono text-[0.625rem] uppercase tracking-[0.14em] text-muted transition-colors duration-300 hover:text-brass"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="font-mono text-[0.5625rem] uppercase tracking-[0.13em] text-faint">
          Fraunces · Instrument Sans · JetBrains Mono
          <span className="mx-2 text-line">·</span>
          &copy; {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
