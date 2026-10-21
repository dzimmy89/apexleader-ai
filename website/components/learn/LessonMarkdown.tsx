import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Components } from "react-markdown";
import { sectionId } from "@/lib/learn/blocks";

function nodeText(node: unknown): string {
  if (!node || typeof node !== "object") return "";
  const n = node as { type?: string; value?: string; children?: unknown[] };
  if (n.type === "text") return n.value ?? "";
  return (n.children ?? []).map(nodeText).join("");
}

/**
 * Markdown for lesson text, styled like the rest of the site. Server-safe.
 * Reading text is the serif at full text colour; headings get room above
 * them; tables and captions are sans because people scan them.
 */
const components: Components = {
  // Ids match lessonSections() so the "On this page" panel can link to them.
  h2: ({ children, node }) => (
    <h2
      id={sectionId(nodeText(node))}
      tabIndex={-1}
      className="lesson-anchor mb-5 mt-14 text-[1.75rem] leading-[1.15] text-[var(--color-text)] focus:outline-none md:text-[2rem]"
    >
      {children}
    </h2>
  ),
  h3: ({ children, node }) => (
    <h3
      id={sectionId(nodeText(node))}
      tabIndex={-1}
      className="lesson-anchor mb-3 mt-10 text-[1.375rem] leading-[1.2] text-[var(--color-text)] focus:outline-none"
    >
      {children}
    </h3>
  ),
  p: ({ children }) => <p className="mb-5 leading-[1.7] text-[var(--color-text)]">{children}</p>,
  ul: ({ children }) => <ul className="mb-5 list-disc space-y-2 pl-6 leading-[1.7] text-[var(--color-text)]">{children}</ul>,
  ol: ({ children }) => <ol className="mb-5 list-decimal space-y-2 pl-6 leading-[1.7] text-[var(--color-text)]">{children}</ol>,
  a: ({ children, href }) => (
    <a
      href={href}
      className="text-[var(--color-accent)] underline underline-offset-2 hover:text-[var(--color-text)]"
      {...(href && /^https?:/.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="column-rule my-6 italic text-[var(--color-text)] [&_p]:text-[var(--color-text)]">{children}</blockquote>
  ),
  table: ({ children }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse font-[family-name:var(--font-ui)] text-[length:var(--text-small)]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-2 text-left font-semibold text-[var(--color-text)]">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border-b border-[var(--color-border)] px-3 py-2 text-left align-top text-[var(--color-text)]">{children}</td>,
  img: ({ src, alt }) =>
    typeof src === "string" ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={alt ?? ""} loading="lazy" className="my-6 h-auto w-full border border-[var(--color-border)]" />
    ) : null,
  strong: ({ children }) => <strong className="font-bold text-[var(--color-text)]">{children}</strong>,
  code: ({ children }) => <code>{children}</code>,
};

export function LessonMarkdown({ text }: { text: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
      {text}
    </ReactMarkdown>
  );
}
