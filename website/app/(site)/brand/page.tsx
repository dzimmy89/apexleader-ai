import type { Metadata } from "next";
import { AgentCard } from "@/components/brand/AgentCard";
import { Logo, LogoMark, Wordmark } from "@/components/brand/Logo";
import { AGENT_TEAM } from "@/content/course";

export const metadata: Metadata = {
  title: "Brand kit",
  description: "The FromAItoBusiness brand kit: logo, colours, type, voice and components.",
  alternates: { canonical: "/brand" },
};

const COLORS = [
  { name: "Ink", token: "--color-bg", value: "oklch(17% 0.02 262)", hex: "#0e1119", use: "Page background" },
  { name: "Panel", token: "--color-panel", value: "oklch(21.5% 0.024 262)", hex: "#161a24", use: "Cards on ink" },
  { name: "Paper", token: "--color-surface", value: "oklch(97% 0.012 85)", hex: "#faf7f0", use: "The one highlighted block per screen" },
  { name: "Signal", token: "--color-accent", value: "oklch(71% 0.19 45)", hex: "#f26a2e", use: "Actions, progress, the arrow" },
  { name: "Marketing", token: "--color-track-marketing", value: "oklch(76% 0.12 190)", hex: "#3cc6c9", use: "Marketing track" },
  { name: "Sales", token: "--color-track-sales", value: "oklch(72% 0.14 295)", hex: "#a88af0", use: "Sales track" },
  { name: "Accounting", token: "--color-track-accounting", value: "oklch(84% 0.16 125)", hex: "#b9dc4f", use: "Accounting track" },
];

const VOICE = [
  { do: "Publish your first week of posts.", dont: "Revolutionize your content strategy." },
  { do: "Your Sales Bot drafts. You approve.", dont: "Fully autonomous AI sales machine." },
  { do: "Set up in an afternoon.", dont: "10x your business overnight." },
];

export default function BrandKitPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-[var(--space-section)]">
      <p className="mono-label">Brand kit · v1 · October 2026</p>
      <h1 className="mt-4 text-[length:var(--text-h1)] text-[var(--color-text)]">
        FromAItoBusiness brand kit
      </h1>
      <p className="mt-5 max-w-2xl text-[length:var(--text-lead)] text-[var(--color-text-muted)]">
        One founder directing a crew of AI agents from a calm desk. The brand sells control, not
        magic: deep ink, warm paper and one signal colour that always means &ldquo;move
        forward&rdquo;.
      </p>

      <section className="mt-16">
        <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)]">Logo</h2>
        <p className="mt-2 max-w-2xl font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
          The mark is a spark (AI) travelling along the signal arrow into a solid block (the
          business). The wordmark repeats the arrow between &ldquo;From AI&rdquo; and &ldquo;to
          Business&rdquo;. Keep clear space equal to the mark&apos;s height on every side.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="panel flex min-h-48 items-center justify-center p-6 text-xl lg:text-2xl text-[var(--color-text)]">
            <Logo markSize={36} />
          </div>
          <div className="parchment-card flex min-h-48 items-center justify-center p-6 text-xl lg:text-2xl [--logo-block:oklch(20%_0.02_262)] [--logo-tile:oklch(93.5%_0.016_85)]">
            <span className="inline-flex items-center gap-2.5">
              <LogoMark size={36} />
              <Wordmark />
            </span>
          </div>
          <div className="panel flex min-h-48 items-center justify-center gap-6 p-8">
            <LogoMark size={64} title="FromAItoBusiness mark" />
            <LogoMark size={32} />
            <LogoMark size={16} />
          </div>
        </div>
        <p className="mt-4 font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Download: <a href="/favicon.svg" download className="text-[var(--color-accent)] underline underline-offset-4">mark (SVG)</a>
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)]">Colour</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLORS.map((color) => (
            <div key={color.name} className="panel overflow-hidden">
              <div className="h-24 border-b border-[var(--color-border)]" style={{ background: `var(${color.token})` }} />
              <div className="p-4 font-[family-name:var(--font-ui)]">
                <p className="font-semibold text-[var(--color-text)]">{color.name}</p>
                <p className="mono-label mt-1 normal-case tracking-normal">{color.hex} · {color.value}</p>
                <p className="mt-2 text-[length:var(--text-caption)] text-[var(--color-text-muted)]">{color.use}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-2xl font-[family-name:var(--font-ui)] text-[length:var(--text-small)] text-[var(--color-text-muted)]">
          Signal orange is used once or twice per screen: the primary button and the word that
          carries the promise. Track colours only label marketing, sales and accounting. No vendor
          colours or logos appear in the brand.
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)]">Type</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="panel p-6">
            <p className="mono-label">Display · Bricolage Grotesque</p>
            <p className="mt-4 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.03em] text-[var(--color-text)]">
              Staffed by AI.
            </p>
            <p className="mt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
              Headlines, numbers, the wordmark. 700–800, tight tracking.
            </p>
          </div>
          <div className="panel p-6">
            <p className="mono-label">Text · Instrument Sans</p>
            <p className="mt-4 font-[family-name:var(--font-ui)] text-lg text-[var(--color-text)]">
              Your Sales Bot researched 50 leads overnight and drafted 12 emails for you to approve.
            </p>
            <p className="mt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
              Body, lessons, buttons and forms. 400–600.
            </p>
          </div>
          <div className="panel p-6">
            <p className="mono-label">System · JetBrains Mono</p>
            <p className="mt-4 font-[family-name:var(--font-mono)] text-lg text-[var(--color-text)]">
              STATUS: WAITING FOR YOUR OK
            </p>
            <p className="mt-3 font-[family-name:var(--font-ui)] text-[length:var(--text-caption)] text-[var(--color-text-muted)]">
              Agent labels, statuses, module numbers. Small and quiet.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)]">Voice</h2>
        <p className="mt-2 max-w-2xl font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
          Plain, confident, operator-like. Short sentences and concrete outcomes. We talk to one
          person, &ldquo;you&rdquo;, and the human always makes the call.
        </p>
        <div className="mt-6 grid gap-3">
          {VOICE.map((line) => (
            <div key={line.do} className="grid gap-3 md:grid-cols-2">
              <p className="panel p-4 font-[family-name:var(--font-ui)] text-[var(--color-text)]">
                <span className="text-[var(--color-success)]">Say · </span>
                {line.do}
              </p>
              <p className="panel p-4 font-[family-name:var(--font-ui)] text-[var(--color-text-muted)] line-through decoration-[var(--color-danger)]">
                {line.dont}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-[length:var(--text-h3)] text-[var(--color-text)]">Components</h2>
        <p className="mt-2 max-w-2xl font-[family-name:var(--font-ui)] text-[var(--color-text-muted)]">
          The agent card is the brand&apos;s signature: a role, the tool doing it, a live status and
          the rule for when it asks you first.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {AGENT_TEAM.slice(2, 5).map((agent) => (
            <AgentCard key={agent.role} agent={agent} />
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="btn btn-primary">Primary action</span>
          <span className="btn btn-secondary">Secondary</span>
          <span className="btn btn-ghost">Text link</span>
          <span className="track-tag track-marketing">Marketing</span>
          <span className="track-tag track-sales">Sales</span>
          <span className="track-tag track-accounting">Accounting</span>
        </div>
      </section>
    </div>
  );
}
