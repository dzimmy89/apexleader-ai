import type { Metadata } from "next";
import { PageHeader } from "@/components/system";
import { privacySections } from "@/content/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-6 py-[var(--space-section)]">
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        intro="How FromAItoBusiness collects, uses, and protects your information."
      />

      <div className="prose-serif mt-12 space-y-10">
        {privacySections.map((section) => (
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
