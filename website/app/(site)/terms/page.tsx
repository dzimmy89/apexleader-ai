import type { Metadata } from "next";
import { PageHeader } from "@/components/system";
import { termsSections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-[var(--space-section)]">
      <PageHeader
        eyebrow="Legal"
        title="Terms of Service"
        intro="Terms governing your use of FromAItoBusiness educational services."
      />

      <div className="prose-serif mt-12 space-y-10">
        {termsSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)]">{section.title}</h2>
            <p className="mt-3 whitespace-pre-line text-[length:var(--text-body)] leading-[1.7] text-[var(--color-text)]">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </article>
  );
}
