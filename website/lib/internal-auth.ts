import { NextRequest } from "next/server";

export function verifyInternalSecret(request: NextRequest): boolean {
  const secret = process.env.INTERNAL_WEBHOOK_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const header = request.headers.get("x-internal-secret");
  return header === secret;
}
