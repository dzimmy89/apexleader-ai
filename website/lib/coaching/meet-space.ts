import { google, type calendar_v3 } from "googleapis";
import { SENDER_EMAIL } from "@/lib/env";

/**
 * A Google Meet room that records and transcribes itself.
 *
 * Discovery calls are recorded so the prospect's written one-page plan can be
 * built from the transcript (call-plans.ts). A Meet link that Calendar makes
 * on its own does not record unless the host presses Record, so for discovery
 * calls the site first creates the room through the Meet API with recording,
 * transcript and Gemini notes switched on, then puts that room on the
 * calendar event. Recording starts when the host (hello@) joins.
 *
 * Needs two Meet scopes on the service account's domain-wide delegation
 * (MEET_SCOPES). Until they are granted, or if Google refuses the room for
 * any reason, this returns null and the booking falls back to an ordinary
 * Meet link, so a booking never fails because of recording.
 */
export const MEET_SCOPES = [
  "https://www.googleapis.com/auth/meetings.space.created",
  "https://www.googleapis.com/auth/meetings.space.settings",
];

export interface RecordedMeetSpace {
  /** "spaces/abc" resource name. */
  name: string;
  meetingCode: string;
  meetingUri: string;
}

type SpaceCreator = () => Promise<RecordedMeetSpace | null>;
let forTests: SpaceCreator | undefined;

/** Tests swap in a fake so no request leaves the machine. */
export function setMeetSpaceForTests(fn: SpaceCreator | undefined): void {
  forTests = fn;
}

function credentials(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8"));
  } catch {
    return JSON.parse(raw);
  }
}

export const AUTO_ARTIFACTS = {
  recordingConfig: { autoRecordingGeneration: "ON" },
  transcriptionConfig: { autoTranscriptionGeneration: "ON" },
  smartNotesConfig: { autoSmartNotesGeneration: "ON" },
} as const;

// The auto-record settings shipped in the Meet API's beta surface first.
const ENDPOINTS = ["https://meet.googleapis.com/v2/spaces", "https://meet.googleapis.com/v2beta/spaces"];

export async function createRecordedMeetSpace(): Promise<RecordedMeetSpace | null> {
  if (forTests) return forTests();
  if (process.env.MEET_AUTO_RECORD === "off") return null;
  const creds = credentials();
  if (!creds) return null;
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: MEET_SCOPES,
    clientOptions: { subject: SENDER_EMAIL },
  });
  let lastError = "";
  for (const url of ENDPOINTS) {
    try {
      const client = await auth.getClient();
      const res = await client.request<{ name?: string; meetingCode?: string; meetingUri?: string }>({
        url,
        method: "POST",
        data: { config: { artifactConfig: AUTO_ARTIFACTS } },
        timeout: 10_000,
      });
      const { name, meetingCode, meetingUri } = res.data || {};
      if (name && meetingCode && meetingUri) return { name, meetingCode, meetingUri };
      lastError = "Meet returned a room without a link";
    } catch (e) {
      lastError = e instanceof Error ? e.message : String(e);
    }
  }
  console.error("[meet-space] could not create a self-recording room; using a plain Meet link.", lastError.slice(0, 300));
  return null;
}

/** Calendar conferenceData that points an event at an existing Meet room. */
export function conferenceDataForSpace(space: RecordedMeetSpace): calendar_v3.Schema$ConferenceData {
  return {
    conferenceSolution: { key: { type: "hangoutsMeet" }, name: "Google Meet" },
    conferenceId: space.meetingCode,
    entryPoints: [
      {
        entryPointType: "video",
        uri: space.meetingUri,
        label: space.meetingUri.replace(/^https?:\/\//, ""),
      },
    ],
  };
}
