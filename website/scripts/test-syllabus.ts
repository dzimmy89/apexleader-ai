/**
 * Coaching syllabus builder and client files.
 *   npx tsx scripts/test-syllabus.ts
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCourseList,
  clampInputs,
  courseMinutes,
  planWeeks,
  syllabusItems,
  syllabusStatus,
} from "../lib/coaching/syllabus";
import { planFromCourses } from "../lib/coaching/syllabus-plan";
import { safeFileName, safeLink } from "../lib/coaching/client-files";
import { getCourse, getCoursesInOrder } from "../lib/learn/catalog";
import { EMPTY_PROGRESS, type LearnProgress } from "../lib/learn/progress";

const order = getCoursesInOrder().map((c) => c.id);

describe("buildCourseList", () => {
  it("starts a new client at Money Basics and keeps path order", () => {
    const { courseIds } = buildCourseList(clampInputs({ level: "new", focusStageIds: ["operator"], timelineWeeks: 104, hoursPerWeek: 40 }));
    assert.equal(courseIds[0], "money-basics");
    assert.deepEqual([...courseIds].sort((a, b) => order.indexOf(a) - order.indexOf(b)), courseIds);
    assert.ok(courseIds.includes("money-markets"));
    assert.ok(!courseIds.includes("bitcoin-basics"), "Bitcoin is not a prerequisite of the operator stage");
  });

  it("skips what the level already knows", () => {
    const { courseIds } = buildCourseList(clampInputs({ level: "advanced", focusStageIds: ["trading"], timelineWeeks: 104, hoursPerWeek: 40 }));
    for (const id of ["money-basics", "intro-to-defi", "money-markets"]) assert.ok(!courseIds.includes(id), id);
    assert.ok(courseIds.includes("defi-portfolio"));
    assert.ok(courseIds.includes("technical-analysis"));
  });

  it("fits the timeline and moves the rest to later", () => {
    const inputs = clampInputs({ level: "new", focusStageIds: ["quant"], timelineWeeks: 4, hoursPerWeek: 2 });
    const { courseIds, laterCourseIds } = buildCourseList(inputs);
    assert.ok(courseIds.length >= 1);
    assert.ok(laterCourseIds.length > 0);
    const used = courseIds.reduce((n, id) => n + courseMinutes(getCourse(id)!), 0);
    assert.ok(courseIds.length === 1 || used <= 4 * 2 * 60);
  });

  it("defaults the focus by level", () => {
    const { courseIds } = buildCourseList(clampInputs({ level: "beginner", focusStageIds: [], timelineWeeks: 104, hoursPerWeek: 40 }));
    assert.ok(courseIds.includes("money-markets"));
    assert.ok(!courseIds.includes("money-basics"));
  });

  it("clamps bad input", () => {
    const inputs = clampInputs({ level: "wizard" as never, focusStageIds: ["nope", "yield"], timelineWeeks: -3, hoursPerWeek: 999 });
    assert.equal(inputs.level, "beginner");
    assert.deepEqual(inputs.focusStageIds, ["yield"]);
    assert.equal(inputs.timelineWeeks, 1);
    assert.equal(inputs.hoursPerWeek, 40);
  });
});

describe("planWeeks", () => {
  it("covers every item once, in order, within the weekly hours", () => {
    const items = syllabusItems(["money-basics"]);
    const weeks = planWeeks(["money-basics"], 2, "2026-11-02");
    assert.deepEqual(weeks.flatMap((w) => w.items), items);
    assert.equal(weeks[1]?.starts, "2026-11-09");
    for (const w of weeks) assert.ok(w.items.length === 1 || w.minutes <= 120, `week ${w.number}`);
    assert.ok(items.some((i) => i.kind === "quiz"));
  });
});

describe("syllabusStatus", () => {
  const syllabus = { courseIds: ["money-basics"], startDate: "2026-11-02", inputs: clampInputs({ hoursPerWeek: 2 }) };
  const weeks = planFromCourses(syllabus.courseIds, 2);

  it("is not started before the start date", () => {
    assert.equal(syllabusStatus(syllabus, EMPTY_PROGRESS, new Date("2026-10-30")).pace, "not-started");
  });

  it("is behind when finished weeks are not done, and on track once they are", () => {
    const inWeek3 = new Date("2026-11-17T12:00:00Z");
    const behind = syllabusStatus(syllabus, EMPTY_PROGRESS, inWeek3);
    assert.equal(behind.currentWeek, 3);
    assert.equal(behind.pace, "behind");

    const progress: LearnProgress = { ...EMPTY_PROGRESS, lessons: {}, exercises: {}, quizzes: {} };
    for (const item of weeks.slice(0, 2).flatMap((w) => w.items)) {
      const key = `${item.courseId}/${item.slug}`;
      if (item.kind === "lesson") progress.lessons[key] = "2026-11-10";
      else if (item.kind === "exercise") progress.exercises[key] = "2026-11-10";
      else progress.quizzes[key] = { best: 80, last: 80, at: "2026-11-10" };
    }
    const onTrack = syllabusStatus(syllabus, progress, inWeek3);
    assert.equal(onTrack.pace, "on-track");
    assert.equal(onTrack.next?.id, weeks[2]!.items[0]!.id);
  });

  it("does not count a failed quiz", () => {
    const quiz = weeks.flatMap((w) => w.items).find((i) => i.kind === "quiz")!;
    const progress: LearnProgress = { ...EMPTY_PROGRESS, quizzes: { [`${quiz.courseId}/${quiz.slug}`]: { best: 40, last: 40, at: "x" } } };
    assert.equal(syllabusStatus(syllabus, progress).done, 0);
  });
});

describe("client files", () => {
  it("accepts only http(s) links", () => {
    assert.equal(safeLink("javascript:alert(1)"), null);
    assert.equal(safeLink("not a url"), null);
    assert.equal(safeLink(" https://drive.google.com/file/d/abc/view "), "https://drive.google.com/file/d/abc/view");
  });

  it("cleans file names for storage paths", () => {
    assert.equal(safeFileName("../../Session 1 notes.pdf"), "..-..-Session-1-notes.pdf".replace(/^-+/, ""));
    assert.ok(!safeFileName("a/b\\c.pdf").includes("/"));
  });
});
