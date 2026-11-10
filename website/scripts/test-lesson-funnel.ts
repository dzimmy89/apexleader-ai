import assert from "node:assert/strict";
import * as React from "react";
// tsx compiles JSX to React.createElement, so React must be in scope for the components under test.
(globalThis as { React?: typeof React }).React = React;
import { describe, it } from "node:test";
import { getCoursesInOrder, allLessons } from "../lib/learn/catalog";
import { lessonBody } from "../lib/learn/blocks";
import { readPiece } from "../lib/learn/content";
import {
  exerciseOffer,
  firstOutcome,
  keyConcept,
  lessonDescription,
  lessonPromise,
  splitAfterFirstSection,
} from "../lib/learn/landing";
import { campaignLabel, funnelDocId, isBotUserAgent, isFunnelStep, CLIENT_STEPS } from "../lib/funnel/events";
import { xHandleFrom, leadAlertContent } from "../lib/crm/lead-alert";
import { buildXLessonLink, cleanHandle } from "../lib/learn/x-links";

describe("lesson landing helpers", () => {
  const body = [
    "Intro paragraph.",
    "",
    "## What you'll be able to do",
    "",
    "- Price a **food truck** catering job in ten minutes.",
    "- Something else.",
    "",
    ":::key-concept",
    "One person with [Claude](https://claude.ai) can run the books.",
    ":::",
    "",
    "```md",
    "## not a heading",
    "```",
    "",
    "## Second section",
    "",
    "More text.",
  ].join("\n");

  it("reads the first outcome and key concept as plain text", () => {
    assert.equal(firstOutcome(body), "Price a food truck catering job in ten minutes");
    assert.equal(keyConcept(body), "One person with Claude can run the books.");
  });

  it("builds a promise and a short description", () => {
    assert.match(lessonPromise(body, 9) || "", /^In 9 minutes: /);
    const d = lessonDescription(body, "fallback");
    assert.ok(d.length <= 158, d);
  });

  it("splits before the second real section, ignoring fenced headings", () => {
    const { head, rest } = splitAfterFirstSection(body);
    assert.match(head, /## not a heading/);
    assert.match(rest, /^## Second section/);
  });

  it("prefers the 'At the end' sentence for the exercise offer", () => {
    const raw = "# Exercise 2: Build a price sheet\n\n:::key-concept\nYou will open a sheet. At the end you have a price sheet you can send today.\n:::\n";
    const offer = exerciseOffer(raw, "Fallback");
    assert.equal(offer.title, "Build a price sheet");
    assert.match(offer.result || "", /^At the end you have a price sheet/);
  });

  it("works on every real lesson", () => {
    for (const course of getCoursesInOrder()) {
      for (const lesson of allLessons(course)) {
        const raw = readPiece(course.id, "lessons", lesson.slug);
        if (!raw) continue;
        const text = lessonBody(raw).body;
        const d = lessonDescription(text, lesson.title);
        assert.ok(d.length > 0 && d.length <= 158, `${course.id}/${lesson.slug}`);
        const { head, rest } = splitAfterFirstSection(text);
        assert.equal((head + rest).replace(/\s+/g, ""), text.replace(/\s+/g, ""), `${course.id}/${lesson.slug}`);
      }
    }
  });
});

describe("funnel counts", () => {
  it("labels campaigns from UTM, X referrers, other referrers or direct", () => {
    assert.equal(campaignLabel({ utm: { source: "x", medium: "dm", campaign: "ai-marketing" } }), "x/dm/ai-marketing");
    assert.equal(campaignLabel({ referrer: "https://t.co/abc" }), "x");
    assert.equal(campaignLabel({ referrer: "https://www.google.com/search?q=1" }), "ref/www.google.com");
    assert.equal(campaignLabel({}), "direct");
    assert.equal(campaignLabel(undefined), "direct");
  });

  it("builds safe document ids", () => {
    assert.equal(
      funnelDocId("2026-11-10", { courseId: "ai-sales", lessonSlug: "a/b" }, "x/dm/ai-sales"),
      "2026-11-10__ai-sales__a-b__x-dm-ai-sales"
    );
  });

  it("only lets the browser report view steps", () => {
    assert.ok(isFunnelStep("email_given"));
    assert.ok(!isFunnelStep("paid"));
    assert.ok(!CLIENT_STEPS.has("email_given"));
    assert.ok(CLIENT_STEPS.has("lesson_view"));
  });

  it("filters bots and link previews", () => {
    assert.ok(isBotUserAgent("Twitterbot/1.0"));
    assert.ok(isBotUserAgent(""));
    assert.ok(!isBotUserAgent("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"));
  });
});

describe("X links and lead alerts", () => {
  it("cleans handles from @names and profile links", () => {
    assert.equal(cleanHandle("@food_truck_jo"), "food_truck_jo");
    assert.equal(cleanHandle("https://x.com/food_truck_jo?s=20"), "food_truck_jo");
  });

  it("builds a tracked lesson link and drops a bad handle", () => {
    const link = new URL(
      buildXLessonLink({ origin: "https://fromaitobusiness.com", courseId: "ai-sales", lessonSlug: "intro", handle: "@jo", medium: "dm" })
    );
    assert.equal(link.pathname, "/university/ai-sales/lessons/intro");
    assert.equal(link.searchParams.get("utm_source"), "x");
    assert.equal(link.searchParams.get("utm_medium"), "dm");
    assert.equal(link.searchParams.get("utm_campaign"), "ai-sales");
    assert.equal(link.searchParams.get("utm_content"), "jo");
    const bad = new URL(
      buildXLessonLink({ origin: "https://fromaitobusiness.com", courseId: "ai-sales", lessonSlug: "intro", handle: "not a handle!", medium: "reply" })
    );
    assert.equal(bad.searchParams.get("utm_content"), null);
  });

  it("reads the X handle only from X links", () => {
    assert.equal(xHandleFrom({ utm: { source: "x", content: "@jo_b" } }), "jo_b");
    assert.equal(xHandleFrom({ utm: { source: "newsletter", content: "jo_b" } }), null);
    assert.equal(xHandleFrom({ utm: { source: "x", content: "<script>" } }), null);
  });

  it("writes an alert that names the handle and links to the person", () => {
    const out = leadAlertContent({
      email: "jo@example.com",
      step: "email",
      courseTitle: "AI Sales",
      lessonTitle: "Outbound agents",
      lessonPath: "/university/ai-sales/lessons/outbound-agents",
      attribution: { utm: { source: "x", medium: "dm", campaign: "ai-sales", content: "jo_b" } },
    });
    assert.equal(out.subject, "New lead: @jo_b opened Outbound agents");
    assert.ok(out.lines.some(([k, v]) => k === "X" && v === "https://x.com/jo_b"));
    assert.match(out.personUrl, /\/admin\/people\/jo%40example\.com$/);
  });
});

describe("lesson markdown", () => {
  it("renders dollar prices as text, not math", async () => {
    const { renderToStaticMarkup } = await import("react-dom/server");
    const { createElement } = await import("react");
    const { LessonMarkdown } = await import("../components/learn/LessonMarkdown");
    const html = renderToStaticMarkup(createElement(LessonMarkdown, { text: "A **$10 to $30** cap." }));
    assert.doesNotMatch(html, /katex/);
    assert.match(html, /\$10 to \$30/);
  });
});
