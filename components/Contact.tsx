"use client";

import { useState } from "react";
import { contactGroups, profile } from "@/lib/content";
import { MaskLines, Reveal, Stagger, StaggerItem } from "./Reveal";

export function Contact() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — the mailto link still works */
    }
  }

  return (
    <section id="contact" className="shell scroll-mt-20 py-16 sm:py-20 lg:py-28">
      <Reveal>
        <span className="label">05 — Contact</span>
      </Reveal>

      <div className="mt-6 grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <h2 className="display text-[clamp(2.2rem,6.5vw,4.5rem)]">
            <MaskLines
              lines={[
                <span key="1">Come say hi<span className="text-brass">.</span></span>,
              ]}
            />
          </h2>
          <Reveal delay={0.12}>
            <p className="prose-lede mt-5 max-w-lg">
              I graduated in June 2026 and I am looking for a team working on
              something with real constraints. Email is fastest — I answer quicker
              than the invoices do.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <a href={`mailto:${profile.email}`} className="btn-brass">
                Write to me
                <span className="btn-arrow">→</span>
              </a>
              <button type="button" onClick={copyEmail} className="btn-ghost">
                {copied ? "Copied ✓" : "Copy address"}
              </button>
            </div>
          </Reveal>
        </div>

        <Stagger className="grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:col-span-5 lg:col-start-8 lg:grid-cols-1">
          {contactGroups.map((group) => (
            <StaggerItem
              key={group.label}
              className="border-b border-line py-3.5 first:border-t sm:first:border-t-0 lg:first:border-t"
            >
              <p className="label">{group.label}</p>
              {group.links.map((l) => {
                const isExternal = l.href.startsWith("http");
                return (
                  <a
                    key={l.href}
                    href={l.href}
                    target={isExternal || l.href.endsWith(".pdf") ? "_blank" : undefined}
                    rel={isExternal || l.href.endsWith(".pdf") ? "noreferrer noopener" : undefined}
                    className="group mt-1 flex items-baseline gap-2 text-[0.9375rem] text-ink"
                  >
                    <span className="brass-underline">{l.text}</span>
                    <span className="font-mono text-[0.625rem] text-faint opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      {isExternal ? "↗" : "→"}
                    </span>
                  </a>
                );
              })}
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
