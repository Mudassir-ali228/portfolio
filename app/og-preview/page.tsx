/* Source for app/opengraph-image.png and app/twitter-image.png. Render at
   1200x630 in development and screenshot #og-card after a copy change.
   It returns 404 in production builds. */
import { notFound } from "next/navigation";
import { profile } from "@/lib/content";
import { Figure } from "@/components/art/Figure";

export const metadata = { robots: { index: false, follow: false } };

export default function OgPreview() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div
      id="og-card"
      className="relative flex flex-col justify-between overflow-hidden bg-bg"
      style={{ width: 1200, height: 630, padding: "76px 84px" }}
    >
      <div className="absolute" style={{ right: 60, top: 70, width: 470 }}>
        <Figure kind="tree" label="Fig. 1" seed={37} when="load" captionClassName="text-right" />
      </div>
      <p className="label relative" style={{ fontSize: 17 }}>
        {profile.role}, {profile.location}
      </p>
      <div className="relative">
        <h1 className="display" style={{ fontSize: 132, lineHeight: 0.86 }}>
          Mudassir
          <br />
          <span style={{ paddingLeft: "0.85em" }}>Ali</span>
        </h1>
        <p className="mt-9 text-muted" style={{ fontSize: 28, lineHeight: 1.45, maxWidth: 720 }}>
          Backend services, web interfaces and mobile apps.
        </p>
      </div>
    </div>
  );
}
