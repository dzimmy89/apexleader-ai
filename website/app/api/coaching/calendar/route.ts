import { NextRequest, NextResponse } from "next/server";
import {
  CALENDAR_UNAVAILABLE_MESSAGE,
  CalendarUnavailableError,
  bookingErrorStatus,
  getAvailability,
  createBooking,
} from "@/lib/coaching/calendar";
import { normalizeDurationMins } from "@/lib/coaching/availability";
import { parseBookingAnswers, recordBookedCall } from "@/lib/coaching/booking-answers";
import { ATTRIBUTION_COOKIE, parseAttribution } from "@/lib/attribution-cookie";

// GET /api/coaching/calendar?start=ISO&end=ISO&duration=30
// Returns bookable availability slots in the given range, each clear of busy
// time on the coach calendars for the full call length.
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");
  const durationMins = normalizeDurationMins(url.searchParams.get("duration"), 30);

  if (!startParam || !endParam) {
    return NextResponse.json(
      { error: "start and end query params (ISO 8601) are required" },
      { status: 400 }
    );
  }

  const start = new Date(startParam);
  const end = new Date(endParam);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return NextResponse.json(
      { error: "start and end must be valid ISO 8601 dates" },
      { status: 400 }
    );
  }

  if (end.getTime() - start.getTime() > 31 * 24 * 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "Range cannot exceed 31 days" },
      { status: 400 }
    );
  }

  let slots;
  try {
    slots = await getAvailability(start, end, durationMins);
  } catch (e) {
    if (e instanceof CalendarUnavailableError) {
      return NextResponse.json(
        { error: CALENDAR_UNAVAILABLE_MESSAGE },
        {
          status: 503,
          headers: { "Cache-Control": "no-store" },
        }
      );
    }
    throw e;
  }

  return NextResponse.json(
    { slots },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}

// POST /api/coaching/calendar
// Body: { startTime, email, name, packageId?, source?, durationMins?, title?, phone?, note? }
export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const startTime = typeof body.startTime === "string" ? body.startTime : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!startTime || !email) {
    return NextResponse.json(
      { error: "startTime and email are required" },
      { status: 400 }
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const answers = parseBookingAnswers(body);
  if (!answers.ok) {
    return NextResponse.json({ error: answers.error }, { status: 400 });
  }

  const result = await createBooking({
    startTime,
    email,
    name,
    packageId: typeof body.packageId === "string" ? body.packageId : undefined,
    source: typeof body.source === "string" ? body.source : undefined,
    durationMins: normalizeDurationMins(body.durationMins, 30),
    title: typeof body.title === "string" ? body.title : undefined,
    timezone: typeof body.timezone === "string" ? body.timezone : undefined,
    applicationId:
      typeof body.applicationId === "string" ? body.applicationId : undefined,
    phone: answers.phone,
    note: answers.note,
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error, code: result.code },
      { status: bookingErrorStatus(result.code) }
    );
  }

  await recordBookedCall({
    email,
    phone: answers.phone,
    note: answers.note,
    attribution: parseAttribution(request.cookies.get(ATTRIBUTION_COOKIE)?.value),
  });

  return NextResponse.json(result);
}
