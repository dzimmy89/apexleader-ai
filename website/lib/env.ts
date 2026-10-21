/** Server-only environment helpers */

export function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_ORIGIN ||
    "https://defiuniversity.xyz"
  ).replace(/\/$/, "");
}

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env: ${name}`);
  return v;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

export const MAILING_ADDRESS =
  process.env.MAILING_ADDRESS ||
  "DeFi University LLC, Educational services — hello@defiuniversity.xyz";

export const SENDER_EMAIL =
  process.env.SENDER_EMAIL || "hello@defiuniversity.xyz";

export const SENDER_NAME =
  process.env.SENDER_NAME || "DeFi University";
