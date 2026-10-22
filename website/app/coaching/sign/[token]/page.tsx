import type { Metadata } from "next";
import { ContractSigner } from "@/components/coaching/ContractSigner";

export const metadata: Metadata = {
  title: "Sign your coaching agreement",
  description: "Review and sign your FromAItoBusiness coaching agreement.",
  robots: { index: false },
};

interface SignPageProps {
  params: Promise<{ token: string }>;
}

export default async function SignPage({ params }: SignPageProps) {
  const { token } = await params;
  return (
    <section className="px-6 py-[var(--space-section)]">
      <div className="mx-auto max-w-3xl">
        <ContractSigner token={token} />
      </div>
    </section>
  );
}
