import Link from "next/link";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight } from "lucide-react";
import { SectionReveal } from "@/components/SectionReveal";
import { PageHeader, Panel } from "@/components/system";
import { TrackedLink } from "@/components/TrackedLink";

const PLACES = [
  { href: "/university", label: "Browse the courses" },
  { href: "/coaching", label: "Private coaching" },
  { href: "/about", label: "About ApexLeader.ai" },
];

export default function NotFound() {
  return (
    <>
      <SiteNav />
      <main>
    <section className="flex min-h-[60vh] flex-col justify-center px-6 py-24">
      <div className="mx-auto w-full max-w-md">
        <SectionReveal>
          <PageHeader
            eyebrow="Error 404"
            title="Page not found"
            intro="This page doesn't exist. Try one of these instead."
          />

          <Panel className="mt-8" bodyClassName="">
            {PLACES.map((place) => (
              <Link
                key={place.href}
                href={place.href}
                className="row text-[var(--color-text)] transition-colors hover:bg-[var(--color-panel-raised)]"
              >
                <span className="font-medium">{place.label}</span>
                <ArrowRight size={16} className="shrink-0 text-[var(--color-text-muted)]" aria-hidden />
              </Link>
            ))}
          </Panel>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrackedLink href="/" location="404" className="btn btn-primary">
              Go home
            </TrackedLink>
            <Link
              href="/coaching/book"
              className="inline-flex min-h-11 items-center font-[family-name:var(--font-ui)] text-[15px] font-medium text-[var(--color-accent)] underline underline-offset-4"
            >
              Book a free call →
            </Link>
          </div>
        </SectionReveal>
      </div>
    </section>
      </main>
      <SiteFooter />
    </>
  );
}
