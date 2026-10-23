/**
 * Split a Learn lesson or exercise into markdown runs and the custom
 * :::blocks the courses use. Pure, so the renderer and tests share it.
 */
export interface CheckpointQuestion {
  question: string;
  options: { text: string; correct: boolean }[];
  why: string;
}

export type LessonSegment =
  | { type: "markdown"; text: string }
  | { type: "callout"; kind: "key-concept" | "takeaways" | "warning" | "try-it"; text: string }
  | { type: "infographic"; title: string; image: string; alt: string }
  | { type: "checkpoint"; questions: CheckpointQuestion[] }
  | { type: "interactive"; id: string; title: string }
  /** Extra work for 1-on-1 coaching clients; other readers see a short note instead. */
  | { type: "coached"; text: string };

const CALLOUTS = new Set(["key-concept", "takeaways", "warning", "try-it"]);

/** Strip front matter and the leading `# Title` line. */
export function lessonBody(raw: string): { title: string; body: string } {
  const noFront = raw.replace(/^---\n[\s\S]*?\n---\n*/, "");
  const match = noFront.match(/^#\s+(.+)\n+/);
  return match ? { title: match[1]!.trim(), body: noFront.slice(match[0].length) } : { title: "", body: noFront };
}

function fields(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([a-z_-]+):\s?(.*)$/);
    if (m) out[m[1]!] = m[2]!.trim();
  }
  return out;
}

export function parseCheckpoint(text: string): CheckpointQuestion[] {
  const questions: CheckpointQuestion[] = [];
  let current: CheckpointQuestion | null = null;
  for (const line of text.split("\n")) {
    const t = line.trim();
    const q = t.match(/^Q:\s*(.+)$/);
    if (q) {
      if (current) questions.push(current);
      current = { question: q[1]!, options: [], why: "" };
      continue;
    }
    if (!current) continue;
    const opt = t.match(/^- \[( |x|X)\]\s*(.+)$/);
    if (opt) {
      current.options.push({ text: opt[2]!, correct: opt[1]!.toLowerCase() === "x" });
      continue;
    }
    const why = t.match(/^Why:\s*(.+)$/);
    if (why) current.why = why[1]!;
    else if (t && current.why) current.why += ` ${t}`;
  }
  if (current) questions.push(current);
  return questions.filter((q) => q.options.length > 0);
}

export function splitBlocks(body: string): LessonSegment[] {
  const segments: LessonSegment[] = [];
  const lines = body.split("\n");
  let buffer: string[] = [];
  let fence = false;
  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) segments.push({ type: "markdown", text });
    buffer = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const open = !fence && line.match(/^:::([a-z-]+)\s*$/);
    if (!open) {
      buffer.push(line);
      continue;
    }
    const name = open[1]!;
    const inner: string[] = [];
    let j = i + 1;
    for (; j < lines.length && lines[j]!.trim() !== ":::"; j++) inner.push(lines[j]!);
    i = j;
    flush();
    const text = inner.join("\n").trim();
    if (CALLOUTS.has(name)) {
      segments.push({ type: "callout", kind: name as "key-concept", text });
    } else if (name === "infographic") {
      const f = fields(text);
      if (f.image) segments.push({ type: "infographic", title: f.title || "", image: f.image, alt: f.alt || f.title || "" });
    } else if (name === "checkpoint") {
      const questions = parseCheckpoint(text);
      if (questions.length) segments.push({ type: "checkpoint", questions });
    } else if (name === "coached") {
      if (text) segments.push({ type: "coached", text });
    } else if (name === "interactive") {
      const f = fields(text);
      segments.push({ type: "interactive", id: f.id || "", title: f.title || "Interactive tool" });
    }
    // :::video and unknown blocks are dropped.
  }
  flush();
  return segments;
}

export interface LessonSection {
  id: string;
  title: string;
  level: 2 | 3;
}

/** Heading text without inline markdown: links keep their words, bold/italic/code markers go. */
export function plainHeading(text: string): string {
  return text
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|`)(.+?)\1/g, "$2")
    .trim();
}

/** URL anchor for a heading. The renderer applies it to the heading's text, the panel to the markdown's. */
export function sectionId(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
  return slug || "section";
}

/** The `##` (and `###`) sections of a lesson or exercise body, for the "On this page" panel. */
export function lessonSections(body: string): LessonSection[] {
  const sections: LessonSection[] = [];
  let fence = false;
  let block = false;
  for (const line of body.split("\n")) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    if (/^:::([a-z-]+)\s*$/.test(line)) block = true;
    else if (line.trim() === ":::") block = false;
    if (block) continue;
    const m = line.match(/^(##|###)\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const title = plainHeading(m[2]!);
    sections.push({ id: sectionId(title), title, level: m[1] === "##" ? 2 : 3 });
  }
  return sections;
}

/** The opening of a piece, up to its second `##` section, for locked previews. */
export function previewBody(body: string): string {
  const lines = body.split("\n");
  let seen = 0;
  let fence = false;
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i]!)) fence = !fence;
    if (!fence && /^## /.test(lines[i]!)) {
      seen++;
      if (seen === 2) return lines.slice(0, i).join("\n");
    }
  }
  return body;
}

export interface QuizQuestion {
  number: number;
  question: string;
  options: { letter: string; text: string }[];
  answer: string;
  explanation: string;
}

export function parseQuiz(md: string): { title: string; subtitle: string; questions: QuizQuestion[] } {
  let title = "";
  let subtitle = "";
  const questions: QuizQuestion[] = [];
  let current: QuizQuestion | null = null;
  for (const line of md.split("\n")) {
    const t = line.trim();
    if (t.startsWith("# ") && !title) {
      title = t.slice(2);
      continue;
    }
    if (!title) continue;
    if (!current && !subtitle && t && !t.startsWith("#") && !t.startsWith("-")) {
      subtitle = t;
      continue;
    }
    const q = t.match(/^## Question (\d+)/);
    if (q) {
      if (current) questions.push(current);
      current = { number: Number(q[1]), question: "", options: [], answer: "", explanation: "" };
      continue;
    }
    if (!current) continue;
    const opt = t.match(/^- ([A-F])\)\s*(.+)$/);
    if (opt) current.options.push({ letter: opt[1]!, text: opt[2]! });
    else if (t.startsWith("**Answer:**")) current.answer = t.replace("**Answer:**", "").trim();
    else if (t.startsWith("**Explanation:**")) current.explanation = t.replace("**Explanation:**", "").trim();
    else if (!current.question && t && !t.startsWith("---")) current.question = t;
  }
  if (current) questions.push(current);
  return { title, subtitle, questions };
}

export function gradeQuiz(questions: QuizQuestion[], answers: Record<string, string>): { correct: number; total: number; score: number } {
  const total = questions.length;
  const correct = questions.filter((q) => answers[String(q.number)] === q.answer).length;
  return { correct, total, score: total ? Math.round((correct / total) * 100) : 0 };
}
