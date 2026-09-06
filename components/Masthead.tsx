"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { profile, marqueeItems, projects } from "@/lib/content";
import { RidgeField } from "./RidgeField";
import { LocalTime } from "./LocalTime";

/**
 * Deliberately shorter than a full screen. The old hero took the whole
 * viewport and said one thing; this one says the same thing in two-thirds of
 * the height and lets the work start showing itself sooner, which is the
 * single biggest thing a portfolio can do for a recruiter in a hurry.
 *
 * Everything here animates in CSS — a JS entrance cannot start until React
 * hydrates, and this is the largest contentful paint.
 */
export function Masthead() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let visible = true;
    const apply = () => {
      raf = 0;
      const p = Math.min(Math.max(window.scrollY / (el.offsetHeight || 1), 0), 1);
      el.style.setProperty("--hero-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (!raf && visible) raf = requestAnimationFrame(apply);
    };
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {
      threshold: 0,
    });
    io.observe(el);
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  const meta = [
    { k: "Role", v: profile.role },
    { k: "Based", v: profile.location },
    { k: "Selected work", v: `${projects.length} projects` },
  ];

  return (
    <section
      ref={ref}
      className="hero relative flex min-h-[70svh] flex-col justify-between overflow-hidden pt-24 sm:pt-28"
    >
      <div className="hero-field absolute inset-0">
        <RidgeField />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
      </div>

      <div className="hero-copy shell relative z-10 pt-4">
        <div
          className="fade-up flex flex-wrap items-center gap-x-5 gap-y-2"
          style={{ animationDelay: "0.06s" }}
        >
          <span className="inline-flex items-center gap-2">
            <span className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-brass" />
            <span className="label">{profile.available}</span>
          </span>
          <span className="label hidden sm:inline">
            <LocalTime />
          </span>
        </div>

        <h1 className="display mt-5 text-[clamp(2.6rem,10vw,8rem)]">
          <span className="line-mask">
            <span className="line-rise">{profile.first}</span>
          </span>
          <span className="line-mask">
            <span className="line-rise" style={{ animationDelay: "0.08s" }}>
              <span className="inline-block md:pl-[0.26em]">
                {profile.last}
                <span className="text-brass">.</span>
              </span>
            </span>
          </span>
        </h1>

        <p
          className="prose-lede fade-up mt-6 max-w-2xl text-balance"
          style={{ animationDelay: "0.3s" }}
        >
          {profile.tagline}
        </p>

        <div
          className="fade-up mt-8 flex flex-wrap items-center gap-2.5"
          style={{ animationDelay: "0.38s" }}
        >
          <Link href="#work" className="btn-solid">
            See the work
            <span className="btn-arrow">→</span>
          </Link>
          <a href={`mailto:${profile.email}`} className="btn-ghost">
            Email me
          </a>
          <a
            href={profile.cv}
            target="_blank"
            rel="noreferrer noopener"
            className="btn-ghost"
          >
            CV
          </a>
        </div>

        <dl
          className="fade-up mt-10 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-3"
          style={{ animationDelay: "0.46s" }}
        >
          {meta.map((m) => (
            <div key={m.k}>
              <dt className="label">{m.k}</dt>
              <dd className="mt-1 text-sm text-ink">{m.v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div
        className="marquee fade-up relative z-10 mt-10 overflow-hidden border-y border-line py-2.5"
        style={{ animationDelay: "0.55s" }}
      >
        <div className="marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <ul key={copy} className="flex shrink-0 items-center" aria-hidden={copy === 1}>
              {marqueeItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center whitespace-nowrap font-mono text-[0.5625rem] uppercase tracking-[0.18em] text-faint sm:text-[0.625rem]"
                >
                  <span className="px-4 sm:px-5">{item}</span>
                  <span className="text-brass">◆</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
