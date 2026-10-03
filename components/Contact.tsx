import { profile } from "@/lib/content";
import { Split } from "./motion/Split";
import { Figure } from "./art/Figure";

const elsewhere = [
  { k: "Phone", v: profile.phone, href: profile.phoneHref },
  { k: "GitHub", v: "Mudassir-ali228", href: profile.github, external: true },
  { k: "LinkedIn", v: "mudassir-ali228", href: profile.linkedin, external: true },
  { k: "CV", v: "PDF, one page", href: profile.cv, external: true },
];

export function Contact() {
  return (
    <section id="contact" className="shell scroll-mt-16 pb-20 md:pb-28">
      <div className="relative pt-10 md:pt-14">
        <span data-a="rule" className="absolute inset-x-0 top-0 h-px bg-line" />

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          <h2 className="label lg:col-span-3 lg:pt-4" data-a="fade">
            Contact
          </h2>
          <div className="lg:col-span-9">
            <a
              href={`mailto:${profile.email}`}
              aria-label={`Email ${profile.email}`}
              className="display block w-fit max-w-full whitespace-nowrap text-[clamp(1.5rem,5.4vw,4.5rem)] leading-[1] transition-colors duration-300 hover:text-brass"
              data-a="chars"
            >
              <Split text={profile.email} />
            </a>
            <span data-a="rule" data-d="0.3" className="mt-4 block h-px bg-line md:mt-6" />
          </div>
        </div>

        <div className="mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 lg:col-start-4">
            <p className="lede" data-a="lines">
              {profile.status}. Email is the quickest way to reach me.
            </p>
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7" data-a="stagger">
              {elsewhere.map((e) => (
                <div key={e.k}>
                  <dt className="label">{e.k}</dt>
                  <dd className="mt-2">
                    <a
                      href={e.href}
                      className="text-link text-[0.9375rem]"
                      {...(e.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      {e.v}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="hidden lg:col-span-3 lg:col-start-10 lg:block">
            <Figure kind="tree" label="Fig. 6" when="view" />
          </div>
        </div>
      </div>
    </section>
  );
}
