import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  allLessons,
  courseOutline,
  getCourse,
  getCoursesInOrder,
  getStages,
  isFreeCourse,
  lessonByLegacySlug,
} from "../lib/learn/catalog";
import * as React from "react";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  gradeQuiz,
  lessonBody,
  lessonSections,
  parseCheckpoint,
  parseQuiz,
  plainHeading,
  previewBody,
  sectionId,
  splitBlocks,
} from "../lib/learn/blocks";
import { LessonBody } from "../components/learn/LessonBody";
import { readPiece } from "../lib/learn/content";
import { courseLock } from "../lib/learn/gate";
import { safeNextPath } from "../lib/account/login";
import { grantIsLive, readAccount } from "../lib/account/access";

// tsx compiles the site's JSX with the classic runtime, which expects a global React.
(globalThis as { React?: typeof React }).React = React;

const PUBLIC = path.join(__dirname, "..", "public");

describe("Learn catalog", () => {
  it("has the sample library: 3 stages, 3 courses, 6 lessons with exercises and 3 quizzes", () => {
    const stages = getStages();
    assert.equal(stages.length, 3);
    const courses = getCoursesInOrder();
    assert.equal(courses.length, 3);
    const lessons = courses.flatMap((c) => allLessons(c));
    assert.equal(lessons.length, 6);
    assert.equal(lessons.filter((l) => l.exercise).length, 6);
    assert.equal(courses.flatMap((c) => c.modules).filter((m) => m.quiz).length, 3);
  });

  it("keeps the catalog consistent: stage numbers, course stage ids, lesson counts and prerequisites", () => {
    const stages = getStages();
    const ids = new Set(stages.map((s) => s.id));
    stages.forEach((stage, i) => {
      assert.equal(stage.number, i + 1, stage.id);
      for (const pre of stage.prereqs) {
        assert.ok(ids.has(pre), `${stage.id} builds on unknown stage ${pre}`);
        assert.ok(stages.findIndex((s) => s.id === pre) < i, `${stage.id} builds on a later stage ${pre}`);
      }
      for (const id of stage.courseIds) {
        const course = getCourse(id);
        assert.ok(course, id);
        assert.equal(course!.stageId, stage.id, id);
        assert.equal(course!.stageNumber, stage.number, id);
        assert.equal(course!.lessonCount, allLessons(course!).length, id);
      }
    });
  });

  it("makes only the stages marked free open with a sign-in", () => {
    const free = getCoursesInOrder().filter(isFreeCourse).map((c) => c.id);
    assert.deepEqual(free, getStages().filter((s) => s.free).flatMap((s) => s.courseIds));
  });

  it("maps a lesson-NN- slug to the lesson with the same number", () => {
    const course = getCourse("ai-work-basics")!;
    assert.equal(lessonByLegacySlug(course, "lesson-02-an-old-title")?.number, 2);
    assert.equal(lessonByLegacySlug(course, "not-a-lesson"), null);
  });
});

describe("Learn content files", () => {
  const courses = getCoursesInOrder();

  it("has every lesson, exercise and quiz on disk, with no video blocks or brand words", () => {
    for (const course of courses) {
      for (const lesson of allLessons(course)) {
        for (const [kind, slug] of [["lessons", lesson.slug], ["exercises", lesson.exercise!]] as const) {
          const md = readPiece(course.id, kind, slug);
          assert.ok(md, `${course.id}/${kind}/${slug}`);
          assert.doesNotMatch(md!, /^:::video/m, `${course.id}/${slug} still has a video block`);
          assert.doesNotMatch(md!, /\bThe Node\b|thenode|Node Membership/, `${course.id}/${slug} names The Node`);
        }
      }
    }
  });

  it("points every infographic at a figure that exists", () => {
    let figures = 0;
    for (const course of courses) {
      for (const lesson of allLessons(course)) {
        for (const [kind, slug] of [["lessons", lesson.slug], ["exercises", lesson.exercise!]] as const) {
          for (const seg of splitBlocks(lessonBody(readPiece(course.id, kind, slug)!).body)) {
            if (seg.type !== "infographic") continue;
            figures++;
            assert.match(seg.image, /^\/learn\/figures\//);
            assert.ok(fs.existsSync(path.join(PUBLIC, seg.image)), seg.image);
          }
        }
      }
    }
    assert.ok(figures >= 0);
  });

  it("parses every quiz into questions with a valid answer", () => {
    for (const course of courses) {
      for (const mod of course.modules) {
        if (!mod.quiz) continue;
        const quiz = parseQuiz(readPiece(course.id, "quizzes", mod.quiz)!);
        assert.ok(quiz.questions.length >= 2, `${course.id}/${mod.quiz}`);
        for (const q of quiz.questions) {
          assert.ok(q.options.some((o) => o.letter === q.answer), `${course.id}/${mod.quiz} Q${q.number}`);
        }
      }
    }
  });

  it("parses checkpoints with exactly one right answer, at least one per exercise", () => {
    for (const course of courses) {
      for (const lesson of allLessons(course)) {
        for (const [kind, slug] of [["lessons", lesson.slug], ["exercises", lesson.exercise!]] as const) {
          let count = 0;
          for (const seg of splitBlocks(lessonBody(readPiece(course.id, kind, slug)!).body)) {
            if (seg.type !== "checkpoint") continue;
            for (const q of seg.questions) {
              count++;
              assert.equal(q.options.filter((o) => o.correct).length, 1, `${course.id}/${slug}: ${q.question}`);
            }
          }
          if (kind === "exercises") assert.ok(count >= 1, `${course.id}/${slug} has no checkpoint`);
        }
      }
    }
  });
});

describe("Learn blocks", () => {
  const sample = [
    "# Lesson 1: Test",
    "",
    "Intro.",
    "",
    ":::key-concept",
    "Money does three jobs.",
    ":::",
    "",
    "## First",
    "",
    "Text.",
    "",
    ":::checkpoint",
    "Q: Pick b",
    "- [ ] a",
    "- [x] b",
    "Why: Because.",
    ":::",
    "",
    "## Second",
    "",
    "Hidden.",
  ].join("\n");

  it("splits markdown and blocks", () => {
    const { title, body } = lessonBody(sample);
    assert.equal(title, "Lesson 1: Test");
    const kinds = splitBlocks(body).map((s) => s.type);
    assert.deepEqual(kinds, ["markdown", "callout", "markdown", "checkpoint", "markdown"]);
  });

  it("cuts the preview before the second section", () => {
    const preview = previewBody(lessonBody(sample).body);
    assert.match(preview, /## First/);
    assert.doesNotMatch(preview, /Hidden/);
  });

  it("reads checkpoint answers", () => {
    const [q] = parseCheckpoint("Q: Pick b\n- [ ] a\n- [x] b\nWhy: Because.");
    assert.equal(q!.options[1]!.correct, true);
    assert.equal(q!.why, "Because.");
  });

  it("grades quizzes, counting blanks as wrong", () => {
    const qs = [
      { number: 1, question: "", options: [], answer: "A", explanation: "" },
      { number: 2, question: "", options: [], answer: "C", explanation: "" },
    ];
    assert.deepEqual(gradeQuiz(qs, { "1": "A" }), { correct: 1, total: 2, score: 50 });
  });
});

describe("Lesson viewer panels", () => {
  it("lists every lesson, exercise and quiz of a course in reading order", () => {
    for (const course of getCoursesInOrder()) {
      const items = courseOutline(course).flatMap((m) => m.items);
      const lessons = allLessons(course);
      assert.equal(items.filter((i) => i.kind === "lesson").length, lessons.length, course.id);
      assert.equal(items.filter((i) => i.kind === "exercise").length, lessons.filter((l) => l.exercise).length, course.id);
      assert.equal(items.filter((i) => i.kind === "quiz").length, course.modules.filter((m) => m.quiz).length, course.id);
      for (const item of items) {
        const kind = item.kind === "lesson" ? "lessons" : item.kind === "exercise" ? "exercises" : "quizzes";
        assert.ok(readPiece(course.id, kind, item.slug), `${course.id} ${item.kind} ${item.slug}`);
      }
    }
    const money = courseOutline(getCourse("ai-work-basics")!);
    assert.deepEqual(
      money[0]!.items.slice(0, 3).map((i) => i.kind),
      ["lesson", "exercise", "lesson"]
    );
    assert.equal(money[0]!.items.at(-1)!.kind, "quiz");
  });

  it("turns headings into stable anchors", () => {
    assert.equal(sectionId("What you'll be able to do"), "what-youll-be-able-to-do");
    assert.equal(sectionId("APR and APY"), "apr-and-apy");
    assert.equal(sectionId("The long-run spread size, σ_eq"), "the-long-run-spread-size-eq");
    assert.equal(plainHeading("The **real** [cost](https://x.y) of `gas`"), "The real cost of gas");
    assert.deepEqual(
      lessonSections("Intro\n\n## One\n\n```\n## not a heading\n```\n\n:::takeaways\n## inside\n:::\n\n### Sub\n\n## Two"),
      [
        { id: "one", title: "One", level: 2 },
        { id: "sub", title: "Sub", level: 3 },
        { id: "two", title: "Two", level: 2 },
      ]
    );
  });

  // The right panel links to ids the renderer must produce, in every course.
  it("gives every lesson and exercise sections whose anchors exist on the rendered page", () => {
    let files = 0;
    for (const course of getCoursesInOrder()) {
      for (const l of allLessons(course)) {
        const pieces: ["lessons" | "exercises", string][] = [["lessons", l.slug]];
        if (l.exercise) pieces.push(["exercises", l.exercise]);
        for (const [kind, slug] of pieces) {
          const { body } = lessonBody(readPiece(course.id, kind, slug)!);
          const sections = lessonSections(body);
          const label = `${course.id}/${kind}/${slug}`;
          assert.ok(sections.length >= 3, `${label} has ${sections.length} sections`);
          assert.equal(new Set(sections.map((s) => s.id)).size, sections.length, `${label} repeats a section id`);
          const html = renderToStaticMarkup(createElement(LessonBody, { body }));
          for (const s of sections) assert.ok(html.includes(`id="${s.id}"`), `${label} has no heading #${s.id}`);
          files++;
        }
      }
    }
    assert.equal(files, 12);
  });
});

describe("Access", () => {
  const free = getCourse(getStages()[0]!.courseIds[0]!)!;
  const paid = getCourse(getStages().find((s) => !s.free)!.courseIds[0]!)!;
  const access = (has: boolean) => ({ email: "a@b.co", hasMembership: has, isCoachingClient: false, hasCourseAccess: has, grants: [], emails: ["a@b.co"], clientEmail: null });

  it("asks visitors to sign in for free stages and to become a client for the rest", () => {
    assert.equal(courseLock(free, { email: null, access: null }), "sign-in");
    assert.equal(courseLock(paid, { email: null, access: null }), "members");
    assert.equal(courseLock(free, { email: "a@b.co", access: access(false) }), "open");
    assert.equal(courseLock(paid, { email: "a@b.co", access: access(false) }), "members");
    assert.equal(courseLock(paid, { email: "a@b.co", access: access(true) }), "open");
  });

  it("treats grants without an end date as live and past ones as ended", () => {
    assert.equal(grantIsLive({ source: "manual", grantedAt: "", expiresAt: null }), true);
    assert.equal(grantIsLive({ source: "coaching", grantedAt: "", expiresAt: "2000-01-01T00:00:00Z" }), false);
    const account = readAccount("a@b.co", { grants: [{ source: "manual", grantedAt: "x", expiresAt: "" }, { bad: 1 }] });
    assert.equal(account.grants.length, 1);
    assert.equal(account.grants[0]!.expiresAt, null);
  });

  it("only redirects to same-site, non-admin paths after sign-in", () => {
    assert.equal(safeNextPath("/university/ai-work-basics"), "/university/ai-work-basics");
    assert.equal(safeNextPath("//evil.example"), "/account");
    assert.equal(safeNextPath("https://evil.example"), "/account");
    assert.equal(safeNextPath("/admin/coaching"), "/account");
    assert.equal(safeNextPath(undefined), "/account");
  });
});

describe("sign-in redirects", () => {
  // Behind Cloud Run, request.url is the container address (0.0.0.0:8080),
  // so redirects must be built from the public site origin.
  it("builds verify and logout redirects from the site origin", () => {
    for (const rel of ["app/api/account/verify/route.ts", "app/api/account/logout/route.ts"]) {
      const src = fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
      assert.doesNotMatch(src, /request\.url/, rel);
      assert.match(src, /getSiteOrigin\(\)/, rel);
    }
  });
});
