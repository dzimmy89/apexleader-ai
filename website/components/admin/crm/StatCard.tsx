import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  label: string;
  value: string | number;
  href?: string;
  className?: string;
}

export function StatCard({ label, value, href, className }: StatCardProps) {
  const content = (
    <Card
      className={cn(
        "border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]",
        href && "transition-colors hover:border-[var(--color-accent)]/40",
        className
      )}
    >
      <CardContent className="p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-[var(--color-text-muted)]">
          {label}
        </p>
        <p className="mt-2 font-[family-name:var(--font-display)] text-3xl text-[var(--color-accent)]">
          {value}
        </p>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

export function StatCardSkeleton() {
  return (
    <Card className="border-[var(--color-border-muted)] bg-[var(--color-bg-panel)]">
      <CardContent className="p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-3 h-8 w-16" />
      </CardContent>
    </Card>
  );
}
