import fs from "fs";
import path from "path";
import { getPackage, type CoachingPackage, type PaymentPlan } from "@/lib/coaching/packages";

export interface ClientContext {
  clientName: string;
  clientEmail: string;
  packageId: string;
  planId: PaymentPlan["id"];
}

export interface RenderedContract {
  markdown: string;
  html: string;
  text: string;
  hash: string; // SHA-256 of rendered markdown (immutable snapshot at sign time)
  packageId: string;
  packageName: string;
}

const CONTRACTS_DIR = path.join(process.cwd(), "content", "coaching-contracts");

function loadTemplate(packageId: string): string {
  const file = path.join(CONTRACTS_DIR, `${packageId}.md`);
  try {
    return fs.readFileSync(file, "utf-8");
  } catch (e) {
    throw new Error(
      `[contract-templates] template not found for package "${packageId}": ${
        e instanceof Error ? e.message : String(e)
      }`
    );
  }
}

function interpolate(
  template: string,
  fields: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    return key in fields ? fields[key] : match;
  });
}

function markdownToHtml(md: string): string {
  // Minimal Markdown renderer for the structured contract format.
  // Headings, paragraphs, lists, bold, strong — enough for legal PDF output
  // without pulling in react-markdown on the server.
  const lines = md.split("\n");
  const html: string[] = [];
  let inList = false;

  const inline = (s: string): string =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      continue;
    }
    if (line.startsWith("### ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h3>${inline(line.slice(4))}</h3>`);
    } else if (line.startsWith("## ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h2>${inline(line.slice(3))}</h2>`);
    } else if (line.startsWith("# ")) {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<h1>${inline(line.slice(2))}</h1>`);
    } else if (line.startsWith("- ")) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inline(line.slice(2))}</li>`);
    } else {
      if (inList) {
        html.push("</ul>");
        inList = false;
      }
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function markdownToText(md: string): string {
  return md
    .replace(/^#+\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .trim();
}

async function sha256(input: string): Promise<string> {
  // Use the global Web Crypto API available on Node 18+ / Cloud Run.
  const { subtle } = globalThis.crypto;
  const buf = await subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function planLabel(pkg: CoachingPackage, planId: PaymentPlan["id"]): string {
  const plan = pkg.paymentPlans.find((p) => p.id === planId);
  if (!plan) return "Pay in full";
  if (plan.installments === 1) return `Pay in full (${plan.perPayment !== pkg.price ? `$${plan.perPayment}` : pkg.priceDisplay})`;
  return `${plan.installments} payments of $${plan.perPayment.toLocaleString()} (total ${plan.total ? `$${plan.total.toLocaleString()}` : pkg.priceDisplay})`;
}

export async function renderContract(ctx: ClientContext): Promise<RenderedContract> {
  const pkg = await getPackage(ctx.packageId);
  if (!pkg) {
    throw new Error(`[renderContract] unknown package: ${ctx.packageId}`);
  }

  const template = loadTemplate(ctx.packageId);
  const fields: Record<string, string> = {
    clientName: ctx.clientName || "(name on file)",
    clientEmail: ctx.clientEmail,
    effectiveDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    priceDisplay: pkg.priceDisplay,
    sessionCount: String(pkg.sessionCount),
    sessionLengthMins: String(pkg.sessionLengthMins),
    durationWeeks: String(pkg.durationWeeks),
    paymentPlanLabel: planLabel(pkg, ctx.planId),
  };

  const markdown = interpolate(template, fields);
  const html = markdownToHtml(markdown);
  const text = markdownToText(markdown);
  const hash = await sha256(markdown);

  return {
    markdown,
    html,
    text,
    hash,
    packageId: pkg.id,
    packageName: pkg.name,
  };
}
