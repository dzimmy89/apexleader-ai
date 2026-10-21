import { FAQAccordion, type FaqItem } from "@/components/FAQAccordion";
import { SectionHeading } from "./SectionHeading";

export function FaqSection({
  folio,
  title,
  intro,
  items,
}: {
  folio?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  items?: readonly FaqItem[];
}) {
  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12">
        <div className="md:col-span-4">
          <SectionHeading folio={folio} eyebrow="Questions" title={title} intro={intro} />
        </div>
        <FAQAccordion items={items} className="mx-0 max-w-none md:col-span-8" />
      </div>
    </section>
  );
}
