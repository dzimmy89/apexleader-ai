import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Shared hierarchy primitives. Styles live in app/globals.css (@layer components). */

export function PageHeader({
  eyebrow,
  title,
  intro,
  action,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  intro?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("page-header", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="section-eyebrow">{eyebrow}</p> : null}
        <h1 className="page-title">{title}</h1>
        {intro ? <p className="page-intro">{intro}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-3">{action}</div> : null}
    </div>
  );
}

export function Panel({
  title,
  eyebrow,
  action,
  children,
  footer,
  id,
  className,
  bodyClassName,
  raised = false,
}: {
  title?: ReactNode;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  id?: string;
  className?: string;
  bodyClassName?: string;
  raised?: boolean;
}) {
  return (
    <section id={id} className={cn(raised ? "panel-raised" : "panel", className)}>
      {title || action ? (
        <header className="panel-head">
          <div className="min-w-0">
            {eyebrow ? <p className="section-eyebrow mb-1">{eyebrow}</p> : null}
            {title ? <h2 className="panel-title">{title}</h2> : null}
          </div>
          {action ? <div className="flex shrink-0 flex-wrap items-center gap-2">{action}</div> : null}
        </header>
      ) : null}
      <div className={cn(bodyClassName ?? "panel-body")}>{children}</div>
      {footer ? <footer className="panel-foot">{footer}</footer> : null}
    </section>
  );
}

export type ChipTone = "neutral" | "success" | "warning" | "danger" | "info" | "skool";

export function Chip({
  tone = "neutral",
  children,
  className,
}: {
  tone?: ChipTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("chip", tone !== "neutral" && `chip-${tone}`, className)}>{children}</span>
  );
}

export function Notice({
  tone = "info",
  title,
  children,
  className,
  role = "status",
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
  role?: "status" | "alert";
}) {
  return (
    <div role={role} className={cn("notice", tone !== "info" && `notice-${tone}`, className)}>
      <div className="min-w-0">
        {title ? <span className="block font-semibold">{title}</span> : null}
        {children ? <span className="block">{children}</span> : null}
      </div>
    </div>
  );
}

export function Stat({
  value,
  label,
  className,
}: {
  value: ReactNode;
  label: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("stat", className)}>
      <span className="stat-value">{value}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function Row({
  label,
  value,
  chip,
  action,
  className,
}: {
  label: ReactNode;
  value?: ReactNode;
  chip?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("row", className)}>
      <div className="min-w-0">
        <div className="row-label">{label}</div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {value !== undefined ? <div className="row-value">{value}</div> : null}
        {chip}
        {action}
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
}: {
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-title">{title}</span>
      {children ? <span className="mt-1 block">{children}</span> : null}
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function Meter({ value, max, label = "Progress", className }: { value: number; max: number; label?: string; className?: string }) {
  const pct = max > 0 ? Math.round((Math.min(value, max) / max) * 100) : 0;
  return (
    <div
      className={cn("meter", className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <span style={{ width: `${pct}%` }} />
    </div>
  );
}

type ButtonTone = "primary" | "secondary" | "ghost" | "danger" | "skool";
type ButtonSize = "sm" | "md" | "lg";

const toneClass: Record<ButtonTone, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  skool: "btn-skool",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "btn-sm",
  md: "",
  lg: "btn-lg",
};

/** A real <button> for forms and actions. For links, use ButtonLink or CTAButton. */
export function Button({
  tone = "primary",
  size = "md",
  block = false,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ButtonTone;
  size?: ButtonSize;
  block?: boolean;
}) {
  return (
    <button
      type={type}
      className={cn("btn", toneClass[tone], sizeClass[size], block && "btn-block", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  tone = "primary",
  size = "md",
  block = false,
  className,
  href,
  external = false,
  children,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  tone?: ButtonTone;
  size?: ButtonSize;
  block?: boolean;
  external?: boolean;
}) {
  const classes = cn("btn", toneClass[tone], sizeClass[size], block && "btn-block", className);
  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

export function SubNav({
  items,
  current,
  className,
}: {
  items: { href: string; label: string }[];
  current?: string;
  className?: string;
}) {
  return (
    <nav className={cn("subnav", className)} aria-label="On this page">
      {items.map((item) => (
        <a key={item.href} href={item.href} data-active={current === item.href ? "true" : undefined}>
          {item.label}
        </a>
      ))}
    </nav>
  );
}
