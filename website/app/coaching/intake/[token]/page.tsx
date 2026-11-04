import type { Metadata } from "next";
import { IntakeFormClient } from "@/components/coaching/IntakeFormClient";

export const metadata: Metadata = {
  title: "Your coaching intake",
  description: "A few questions about your business and goals, so your coaching syllabus fits you.",
  robots: { index: false },
};

export default async function IntakePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-3xl">
        <IntakeFormClient token={token} />
      </div>
    </section>
  );
}
