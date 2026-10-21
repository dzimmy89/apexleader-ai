import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

const CHARCOAL = "#1f1c17";
const PARCHMENT = "#f2ece0";
const GOLD = "#d4b45c";
const MUTED = "#a39b8b";

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
  const [display, body, portrait] = await Promise.all([
    asset("assets", "fonts", "instrument-serif-400.ttf"),
    asset("assets", "fonts", "libre-baskerville-400.ttf"),
    asset("public", "images", "david-zimmerman-portrait.jpg"),
  ]);
  const portraitSrc = `data:image/jpeg;base64,${portrait.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: CHARCOAL,
          padding: "56px 64px",
          fontFamily: "Baskerville",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingRight: 48 }}>
          <div
            style={{
              display: "flex",
              height: 1,
              width: "100%",
              background: `linear-gradient(90deg, ${GOLD}, transparent)`,
            }}
          />
          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 22,
              letterSpacing: 6,
              textTransform: "uppercase",
              color: GOLD,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontFamily: "Instrument Serif",
              fontSize: 84,
              lineHeight: 1.02,
              color: PARCHMENT,
            }}
          >
            {title}
          </div>
          <div style={{ display: "flex", flex: 1 }} />
          <div style={{ display: "flex", fontSize: 22, color: MUTED }}>{footer}</div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignSelf: "center",
            width: 360,
            padding: 14,
            background: PARCHMENT,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={portraitSrc} alt="" width={332} height={415} />
          <div
            style={{
              display: "flex",
              marginTop: 14,
              fontSize: 18,
              color: CHARCOAL,
            }}
          >
            David Zimmerman · founder, hosts every live call
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Instrument Serif", data: display, style: "normal", weight: 400 },
        { name: "Baskerville", data: body, style: "normal", weight: 400 },
      ],
    }
  );
}
