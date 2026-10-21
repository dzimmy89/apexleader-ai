import { NextRequest, NextResponse } from "next/server";
import { findModuleByQuiz, getCourse, quizKey } from "@/lib/learn/catalog";
import { readPiece } from "@/lib/learn/content";
import { gradeQuiz, parseQuiz } from "@/lib/learn/blocks";
import { courseLock, getViewer } from "@/lib/learn/gate";
import { recordQuiz } from "@/lib/learn/progress";

export async function POST(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer.email) return NextResponse.json({ error: "Sign in first" }, { status: 401 });
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const course = getCourse(String(body.courseId || ""));
  const quizId = String(body.quizId || "");
  if (!course || !findModuleByQuiz(course, quizId)) return NextResponse.json({ error: "Unknown quiz" }, { status: 404 });
  if (courseLock(course, viewer) !== "open") return NextResponse.json({ error: "No access" }, { status: 403 });
  const md = readPiece(course.id, "quizzes", quizId);
  if (!md) return NextResponse.json({ error: "Unknown quiz" }, { status: 404 });
  const answers: Record<string, string> = {};
  for (const [k, v] of Object.entries((body.answers as Record<string, unknown>) || {})) answers[k] = String(v);
  const grade = gradeQuiz(parseQuiz(md).questions, answers);
  const { best } = await recordQuiz(viewer.email, quizKey(course.id, quizId), grade.score);
  return NextResponse.json({ ok: true, ...grade, best });
}
