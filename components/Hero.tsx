"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { profile, marqueeItems } from "@/lib/content";
import { RidgeField } from "./RidgeField";
import { MaskLines } from "./Reveal";

const EASE = [0.16, 1, 0.3, 1] as const;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const fieldY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const fieldFade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);
  const copyY = useTransform(scrollYProgress, [0, 1], ["0%", "-14%"]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[94svh] flex-col justify-between overflow-hidden pt-28 md:pt-32"
    >
      <motion.div
        className="absolute inset-0"
        style={{ y: fieldY, opacity: fieldFade }}
      >
        <RidgeField />
        {/* Let the field dissolve into the page rather than stopping dead. */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-bg via-bg/85 to-transparent" />
      </motion.div>

      <motion.div className="shell relative z-10" style={{ y: copyY }}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.15 }}
          className="inline-flex items-center gap-2.5 rounded-full border border-line bg-surface/60 px-3.5 py-1.5 backdrop-blur-sm"
        >
          <span className="status-dot inline-block h-1.5 w-1.5 rounded-full bg-brass" />
          <span className="font-mono text-[0.625rem] uppercase tracking-[0.16em] text-muted">
            {profile.available}
          </span>
        </motion.div>

        <h1 className="display mt-8 text-[clamp(3.4rem,13vw,10.5rem)]">
          <MaskLines
            delay={0.1}
            lines={[
              <span key="a">{profile.first}</span>,
              <span key="b" className="inline-block md:pl-[0.28em]">
                {profile.last}
                <span className="text-brass">.</span>
              </span>,
            ]}
          />
        </h1>

        <div className="mt-10 grid gap-8 border-t border-line pt-6 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-4">
            <p className="label">
              {profile.role} <span className="mx-1 text-line">/</span>{" "}
              {profile.location}
            </p>
          </div>
          <motion.p
            className="prose-lede max-w-xl text-balance md:col-span-7 md:col-start-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.5 }}
          >
            {profile.tagline}
          </motion.p>
        </div>

        <motion.div
          className="mt-10 flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.65 }}
        >
          <Link
            href="#work"
            className="group inline-flex h-12 items-center gap-3 rounded-full bg-ink px-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-bg transition-transform duration-500 hover:-translate-y-0.5"
          >
            See the work
            <span className="transition-transform duration-500 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex h-12 items-center rounded-full border border-line px-6 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-muted transition-colors duration-500 hover:border-brass hover:text-ink"
          >
            {profile.email}
          </a>
        </motion.div>
      </motion.div>

      <motion.div
        className="marquee relative z-10 mt-16 overflow-hidden border-y border-line py-3.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.9 }}
      >
        <div className="marquee-track flex w-max">
          {[0, 1].map((copy) => (
            <ul
              key={copy}
              className="flex shrink-0 items-center"
              aria-hidden={copy === 1}
            >
              {marqueeItems.map((item) => (
                <li
                  key={item}
                  className="flex items-center whitespace-nowrap font-mono text-[0.6875rem] uppercase tracking-[0.18em] text-faint"
                >
                  <span className="px-6">{item}</span>
                  <span className="text-brass">◆</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
