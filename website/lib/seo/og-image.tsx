import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const INK = "#0e1119";
const PAPER = "#faf7f0";
const SIGNAL = "#f26a2e";
const MUTED = "#a3abc0";

async function asset(...parts: string[]): Promise<Buffer> {
  return readFile(join(process.cwd(), ...parts));
}

export async function renderOgImage({
  eyebrow,
  title,
  footer,
}: {
  eyebrow: string;
  title: string;
  footer: string;
}): Promise<ImageResponse> {
  const [display, body] = await Promise.all([
    asset("assets", "fonts", "bricolage-grotesque-latin-700-normal.woff"),
    asset("assets", "fonts", "instrument-sans-latin-500-normal.woff"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: INK,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          padding: "64px 72px",
          fontFamily: "Instrument Sans",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", fontFamily: "Bricolage", fontSize: 40, color: PAPER }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#1b2030",
              marginRight: 18,
              paddingLeft: 10,
            }}
          >
            <div style={{ display: "flex", width: 11, height: 11, borderRadius: 11, background: SIGNAL }} />
            <div style={{ display: "flex", width: 14, height: 4, background: SIGNAL, marginLeft: 4 }} />
            <div style={{ display: "flex", width: 9, height: 22, borderRadius: 3, background: PAPER, marginLeft: 4 }} />
          </div>
          <span>From</span>
          <span style={{ color: SIGNAL }}>AI</span>
          <span style={{ color: SIGNAL, margin: "0 6px" }}>→</span>
          <span>toBusiness</span>
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 26, color: SIGNAL, letterSpacing: 2 }}>
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 18,
            fontFamily: "Bricolage",
            fontSize: 80,
            lineHeight: 1.02,
            letterSpacing: -2,
            color: PAPER,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", flex: 1 }} />
        <div style={{ display: "flex", fontSize: 24, color: MUTED }}>{footer}</div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Bricolage", data: display, style: "normal", weight: 700 },
        { name: "Instrument Sans", data: body, style: "normal", weight: 500 },
      ],
    }
  );
}
