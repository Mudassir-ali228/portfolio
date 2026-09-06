/* Scaffolding, not a real page: rendered once at 1200x630 and screenshotted
   into app/opengraph-image.png so the social card uses the site's own fonts
   without a build-time font fetch. Safe to delete; keep it if you ever want
   to regenerate the card after a copy change. */
import { profile } from "@/lib/content";

export const metadata = { robots: { index: false, follow: false } };

const stack = ["TypeScript", "NestJS", "React", "Unity 6", "Spring Boot"];

export default function OgPreview() {
  return (
    <div
      id="og-card"
      className="relative flex flex-col justify-between overflow-hidden bg-bg"
      style={{ width: 1200, height: 630, padding: "72px 80px" }}
    >
      <div className="absolute inset-x-0 top-0 h-1.5 bg-brass" />

      <div className="flex items-baseline justify-between">
        <span className="label">{profile.role}</span>
        <span className="label">{profile.location}</span>
      </div>

      <div>
        <h1 className="display" style={{ fontSize: 132, lineHeight: 0.92 }}>
          Mudassir Ali<span className="text-brass">.</span>
        </h1>
        <p
          className="mt-7 max-w-[880px] text-muted"
          style={{ fontSize: 28, lineHeight: 1.5 }}
        >
          Production platforms where the details are load-bearing — and game
          engines where they are the whole point.
        </p>
      </div>

      <div className="flex items-center gap-5 border-t border-line pt-7">
        {stack.map((s, i) => (
          <span key={s} className="flex items-center gap-5">
            <span className="label" style={{ fontSize: 17 }}>
              {s}
            </span>
            {i < stack.length - 1 && (
              <span className="text-brass" style={{ fontSize: 10 }}>
                ◆
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}
