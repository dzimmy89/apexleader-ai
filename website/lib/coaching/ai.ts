import { ApiError, FinishReason, GoogleGenAI, ThinkingLevel } from "@google/genai";

/**
 * One place that calls the AI model for the coaching tools (intake form,
 * syllabus drafts, suggested changes). Each call asks for JSON that matches
 * a schema and returns it parsed.
 *
 * The model is Gemini 3.1 Flash-Lite, Google's cheapest current Gemini
 * model, run through Vertex AI in the site's own Google Cloud project
 * (GCP_PROJECT_ID), billed to that project and signed in as the Cloud Run
 * service account; no API key is needed. GEMINI_MODEL and GEMINI_LOCATION
 * override the model and region. When the model can't be reached the tools
 * fall back to the manual form and the rule-based planner.
 */
export const AI_MODEL = process.env.GEMINI_MODEL || "gemini-3.1-flash-lite";

/** Vertex location; "global" routes to any region with capacity. */
const LOCATION = process.env.GEMINI_LOCATION || "global";

export class AiUnavailableError extends Error {
  constructor(message = "The AI model is not set up yet.") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

type JsonCall = <T>(opts: {
  system: string;
  prompt: string;
  schema: Record<string, unknown>;
  effort?: "low" | "medium" | "high";
  maxTokens?: number;
}) => Promise<T>;

let forTests: JsonCall | undefined;

/** Tests swap in a fake so no request leaves the machine. */
export function setAiForTests(fn: JsonCall | undefined): void {
  forTests = fn;
}

function project(): string {
  return process.env.GEMINI_PROJECT || process.env.GCP_PROJECT_ID || "";
}

export function aiConfigured(): boolean {
  return Boolean(forTests || project());
}

/** Vertex answers 403/404 until the API and role are in place; say what to do. */
export function vertexSetupError(e: unknown): AiUnavailableError | null {
  const status = (e as { status?: number } | null)?.status;
  if (status !== 403 && status !== 404) return null;
  // Google's own reason tells a missing role apart from a model this project can't use.
  const reason = e instanceof Error ? e.message.replace(/\s+/g, " ").slice(0, 300) : "";
  return new AiUnavailableError(
    `Gemini (${AI_MODEL}) is not reachable in Google Cloud project ${project()} yet. In the Google Cloud console, turn on the Vertex AI API and give the site's Cloud Run service account the Vertex AI User role.${reason ? ` Google said: ${reason}` : ""}`
  );
}

// Thinking tokens bill as output, so keep it light: these are reading and planning tasks.
const THINKING = { low: ThinkingLevel.MINIMAL, medium: ThinkingLevel.LOW, high: ThinkingLevel.MEDIUM };

const BLOCKED: string[] = [
  FinishReason.SAFETY,
  FinishReason.RECITATION,
  FinishReason.BLOCKLIST,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.SPII,
];

export const aiJson: JsonCall = async <T>(opts: Parameters<JsonCall>[0]): Promise<T> => {
  if (forTests) return forTests<T>(opts);
  if (!project()) throw new AiUnavailableError();
  // Cloud Run allows 600 s per request (cloudbuild.yaml --timeout); one retry stays inside it.
  const ai = new GoogleGenAI({
    enterprise: true,
    project: project(),
    location: LOCATION,
    httpOptions: { timeout: 240_000, retryOptions: { attempts: 2 } },
  });
  let response;
  try {
    response = await ai.models.generateContent({
      model: AI_MODEL,
      contents: opts.prompt,
      config: {
        systemInstruction: opts.system,
        responseMimeType: "application/json",
        responseJsonSchema: opts.schema,
        maxOutputTokens: opts.maxTokens ?? 32000,
        thinkingConfig: { thinkingLevel: THINKING[opts.effort ?? "medium"] },
      },
    });
  } catch (e) {
    const setup = e instanceof ApiError ? vertexSetupError(e) : null;
    if (setup) throw setup;
    throw e;
  }
  const finish = response.candidates?.[0]?.finishReason;
  if (response.promptFeedback?.blockReason || (finish && BLOCKED.includes(finish))) {
    throw new Error("Gemini declined this request. Fill it in by hand.");
  }
  if (finish === FinishReason.MAX_TOKENS) throw new Error("Gemini's answer was cut off. Try again.");
  try {
    return JSON.parse(response.text ?? "") as T;
  } catch {
    throw new Error("Gemini returned something that was not valid JSON. Try again.");
  }
};
