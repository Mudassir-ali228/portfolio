"use client";

import { profile } from "@/lib/content";
import { scrollToTarget } from "./motion/MotionProvider";

export function Footer() {
  return (
    <footer className="shell">
      <div className="grid gap-3 border-t border-line py-8 sm:grid-cols-3 sm:items-baseline">
        <p className="label">
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className="label sm:text-center">Figures drawn from code, in your browser</p>
        <p className="sm:text-right">
          <button
            type="button"
            onClick={() => scrollToTarget(0)}
            className="label quiet-link cursor-pointer"
          >
            Back to top ↑
          </button>
        </p>
      </div>
    </footer>
  );
}
