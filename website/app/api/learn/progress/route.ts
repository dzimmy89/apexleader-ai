import { NextRequest, NextResponse } from "next/server";
import { getCourse, findLesson, findLessonByExercise, lessonKey, exerciseKey } from "@/lib/learn/catalog";
import { courseLock, getViewer } from "@/lib/learn/gate";
import { markComplete } from "@/lib/learn/progress";

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
  if (!course) return NextResponse.json({ error: "Unknown course" }, { status: 404 });
  if (courseLock(course, viewer) !== "open") return NextResponse.json({ error: "No access" }, { status: 403 });
  const kind = body.kind === "exercise" ? "exercises" : "lessons";
  const slug = String(body.slug || "");
  const known = kind === "lessons" ? findLesson(course, slug) : findLessonByExercise(course, slug);
  if (!known) return NextResponse.json({ error: "Unknown lesson" }, { status: 404 });
  const key = kind === "lessons" ? lessonKey(course.id, slug) : exerciseKey(course.id, slug);
  await markComplete(viewer.email, kind, key, body.done !== false);
  return NextResponse.json({ ok: true });
}
