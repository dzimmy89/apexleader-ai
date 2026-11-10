/**
 * Words a lesson page needs to work as a landing page for someone arriving
 * from a link on X: a one-line promise under the title, the exercise named
 * as the offer, and a description for the link card. All of it is pulled
 * from the lesson and exercise files, so no lesson needs extra copy.
 * Pure: shared by the page, the link-card image and the tests.
 */
import { lessonBody, plainHeading } from "./blocks";

/** Markdown inline marks out, links keep their words, whitespace collapsed. */
export function plainText(md: string): string {
  return plainHeading(md.replace(/\s+/g, " ")).replace(/\s+/g, " ").trim();
}

/** The first sentence of a paragraph (up to the first ". " or the end). */
export function firstSentence(text: string): string {
  const plain = plainText(text);
  const m = plain.match(/^(.+?[.!?])(\s|$)/);
  return (m ? m[1]! : plain).trim();
}

/** Cut at a word boundary and add an ellipsis when longer than `max`. */
export function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[,;:.\s]+$/, "")}…`;
}

function lowerFirst(text: string): string {
  // Keep acronyms and names ("AI", "Claude") as they are.
  if (/^[A-Z]{2}/.test(text) || /^[A-Z][a-z]+[A-Z]/.test(text)) return text;
  const [first = "", second = ""] = text.split(" ");
  if (/^(I|AI|Claude|Gemini|Cursor|Codex|GitHub|Grok|Duet|Dots?|Stripe|Google|X)\b/.test(first)) return text;
  void second;
  return text.charAt(0).toLowerCase() + text.slice(1);
}

/** The opening :::key-concept block of a piece, as plain text, or null. */
export function keyConcept(body: string): string | null {
  const m = body.match(/(?:^|\n):::key-concept[ \t]*\n([\s\S]*?)\n:::[ \t]*(?:\n|$)/);
  return m ? plainText(m[1]!) : null;
}

/** First bullet under "What you'll be able to do", as plain text. */
export function firstOutcome(body: string): string | null {
  const m = body.match(/\n## What you(?:'|’)ll be able to do[^\n]*\n+((?:[-*] [^\n]*\n?)+)/);
  if (!m) return null;
  const first = m[1]!.split("\n")[0]!.replace(/^[-*]\s+/, "");
  const text = plainText(first).replace(/[.;]\s*$/, "");
  return text || null;
}

/**
 * One line under the lesson title: what the reader gets in the time it
 * takes. "In 13 minutes: turn your brand kit and offer into three to five
 * content pillars." Falls back to the key concept's first sentence.
 */
export function lessonPromise(body: string, minutes: number): string | null {
  const outcome = firstOutcome(body);
  if (outcome) return `In ${minutes} minutes: ${lowerFirst(outcome)}.`;
  const concept = keyConcept(body);
  return concept ? firstSentence(concept) : null;
}

/** The meta description and link-card text: the key concept's first sentence. */
export function lessonDescription(body: string, fallback: string): string {
  const concept = keyConcept(body);
  return clip(concept ? firstSentence(concept) : fallback, 158);
}

export interface ExerciseOffer {
  /** The exercise's own title, without the "Exercise 3:" prefix. */
  title: string;
  /** What the reader leaves with, one sentence. */
  result: string | null;
}

/** The exercise named as the offer, from the exercise file's title and task text. */
export function exerciseOffer(raw: string, fallbackTitle: string): ExerciseOffer {
  const { title, body } = lessonBody(raw);
  const clean = title.replace(/^Exercise\s+\d+\s*[:.-]\s*/i, "").trim() || fallbackTitle;
  const summary = keyConcept(body);
  let result: string | null = null;
  if (summary) {
    // Prefer the sentence that says what they end with.
    const sentences = summary.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [summary];
    result =
      sentences.find((s) => /^(At the end|By the end|You(?:'|’)ll (?:end|finish|leave)|You end)/i.test(s)) ??
      sentences[0] ??
      null;
  }
  return { title: clean, result: result ? clip(result, 190) : null };
}

/**
 * The body split before its second `##` section, so the early ask can sit
 * after "What you'll be able to do". Returns the whole body as `head` when
 * there is no second section.
 */
export function splitAfterFirstSection(body: string): { head: string; rest: string } {
  const lines = body.split("\n");
  let seen = 0;
  let fence = false;
  let depth = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    if (fence) continue;
    if (/^:::([a-z-]+)\s*$/.test(line)) depth++;
    else if (line.trim() === ":::") depth = Math.max(0, depth - 1);
    if (depth > 0) continue;
    if (/^## /.test(line)) {
      seen++;
      if (seen === 2) return { head: lines.slice(0, i).join("\n"), rest: lines.slice(i).join("\n") };
    }
  }
  return { head: body, rest: "" };
}
