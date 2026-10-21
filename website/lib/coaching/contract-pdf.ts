import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import sharp from "sharp";
// satori types use React.ReactNode; cast our plain objects to satisfy the API.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import satori from "satori";
import type { AuditEnvelope } from "@/lib/coaching/signatures";
import { getDb } from "@/lib/firebase-admin";

const FONTS_DIR = path.join(process.cwd(), "assets", "fonts");
const PAGE_WIDTH = 612; // US Letter, 8.5in @ 72dpi
const PAGE_HEIGHT = 792;
const MARGIN = 56;

let fontsCache: Array<{
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
}> | null = null;

function getFonts() {
  if (!fontsCache) {
    fontsCache = [
      {
        name: "Instrument Serif",
        data: fs.readFileSync(path.join(FONTS_DIR, "instrument-serif-400.ttf")),
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Libre Baskerville",
        data: fs.readFileSync(path.join(FONTS_DIR, "libre-baskerville-400.ttf")),
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Libre Baskerville",
        data: fs.readFileSync(path.join(FONTS_DIR, "libre-baskerville-700.ttf")),
        weight: 700 as const,
        style: "normal" as const,
      },
    ];
  }
  return fontsCache;
}

interface GeneratePdfInput {
  contractHtml: string;
  packageName: string;
  signerName: string;
  signatureImageDataUri: string | null;
  auditEnvelope: AuditEnvelope;
}

function decodeDataUri(dataUri: string | null): Buffer | null {
  if (!dataUri) return null;
  const match = /^data:image\/png;base64,(.+)$/.exec(dataUri);
  if (!match) return null;
  try {
    return Buffer.from(match[1]!, "base64");
  } catch {
    return null;
  }
}

function stripHtml(html: string): string[] {
  // Split rendered HTML into plain-text paragraphs/lines for PDFDocument.
  const blocks: string[] = [];
  const replaced = html
    .replace(/<\/(h1|h2|h3|p|li)>/g, "\n")
    .replace(/<li>/g, "• ")
    .replace(/<br\s*\/?>/g, "\n");
  const text = replaced.replace(/<[^>]+>/g, "");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line) blocks.push(line);
  }
  return blocks;
}

export async function generateSignedPdf(
  input: GeneratePdfInput
): Promise<Buffer> {
  const sigBuffer = decodeDataUri(input.signatureImageDataUri);
  const sigPng = sigBuffer
    ? await sharp(sigBuffer).resize({ width: 240 }).png().toBuffer()
    : null;

  // Render the signature image via satori as a fallback when no canvas PNG
  // is provided (keyboard-only signers who type their name).
  let signatureImage: Buffer | null = sigPng;
  if (!signatureImage) {
    // satori expects a React node; cast our plain VNode-like object to any.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const node: any = {
      type: "div",
      props: {
        style: {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 360,
          height: 80,
          fontFamily: "Instrument Serif",
          fontSize: 36,
          fontStyle: "italic",
          color: "#1a1814",
          borderBottom: "1px solid #1a1814",
        },
        children: input.signerName,
      },
    };
    const svg = await satori(node, {
      width: 360,
      height: 80,
      fonts: getFonts(),
    });
    signatureImage = await sharp(Buffer.from(svg)).png().toBuffer();
  }

  const blocks = stripHtml(input.contractHtml);
  const doc = new PDFDocument({
    size: [PAGE_WIDTH, PAGE_HEIGHT],
    margins: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    info: {
      Title: `DeFi University ${input.packageName} Coaching Agreement`,
      Author: "DeFi University LLC",
      Subject: "Coaching Agreement (signed)",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c: Buffer) => chunks.push(c));

  const writePromise = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  // Header.
  doc
    .fontSize(16)
    .font("Helvetica-Bold")
    .text(`DeFi University — ${input.packageName} Coaching Agreement`, {
      align: "center",
    });
  doc.moveDown(0.5);
  doc
    .fontSize(8)
    .font("Helvetica")
    .fillColor("#666")
    .text(
      `Signed electronically on ${new Date(
        input.auditEnvelope.signedAt
      ).toLocaleString("en-US")}`,
      { align: "center" }
    );
  doc.moveDown(1);
  doc.fillColor("#000");

  // Body.
  doc.fontSize(10).font("Helvetica");
  for (const block of blocks) {
    if (block.startsWith("•")) {
      doc.text(block, { indent: 14 });
    } else if (
      /^(DeFi University|Parties|Effective date|Scope|Educational Only|Fees|Refund|Scheduling|Confidentiality|Dispute|Acknowledgment)/.test(
        block
      )
    ) {
      doc.font("Helvetica-Bold").text(block);
      doc.font("Helvetica");
    } else {
      doc.text(block, { align: "left" });
    }
    doc.moveDown(0.3);
  }

  // Signature block.
  doc.addPage();
  doc.fontSize(12).font("Helvetica-Bold").text("Signature", { underline: true });
  doc.moveDown(1);

  const sigTop = doc.y;
  if (signatureImage) {
    doc.image(signatureImage, MARGIN, sigTop, { fit: [240, 80] });
  }
  doc.y = sigTop + 90;
  doc
    .moveTo(MARGIN, doc.y)
    .lineTo(MARGIN + 240, doc.y)
    .stroke();
  doc
    .fontSize(9)
    .font("Helvetica")
    .text(`${input.auditEnvelope.signerTypedName}`, MARGIN, doc.y + 2);
  doc.text("Client signature", MARGIN, doc.y + 14);

  doc.moveDown(2);

  // Audit footer.
  doc
    .fontSize(8)
    .font("Helvetica-Bold")
    .fillColor("#444")
    .text("Audit trail (ESIGN / UETA)", { underline: true });
  doc.font("Helvetica").fillColor("#666");
  const auditLines = [
    `Signature ID: ${input.auditEnvelope.signatureId}`,
    `Signed at: ${input.auditEnvelope.signedAt}`,
    `Signer IP: ${input.auditEnvelope.signerIpAddress || "(unknown)"}`,
    `User agent: ${input.auditEnvelope.signerUserAgent || "(unknown)"}`,
    `Signer email: ${input.auditEnvelope.signerEmail}`,
    `Contract hash (SHA-256): ${input.auditEnvelope.contractHashSha256}`,
    `Integrity hash (SHA-256): ${input.auditEnvelope.integrityHash}`,
    `Request issued at: ${input.auditEnvelope.requestIssuedAt}`,
  ];
  for (const line of auditLines) {
    doc.text(line, { lineGap: 2 });
  }

  doc.end();
  return writePromise;
}

export async function storeSignedPdf(
  signatureId: string,
  pdfBuffer: Buffer
): Promise<string> {
  // Two storage tiers:
  //  1. GCS bucket (production)
  //  2. Firestore base64 doc (dev fallback when GCS not configured)
  const bucketName =
    process.env.CONTRACTS_GCS_BUCKET || "defi-university-prod-contracts";

  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage();
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`${signatureId}.pdf`);
      await file.save(pdfBuffer, {
        contentType: "application/pdf",
        metadata: {
          cacheControl: "private, max-age=0",
          metadata: { signatureId },
        },
      });
      return `gs://${bucketName}/${signatureId}.pdf`;
    } catch (e) {
      console.error("[storeSignedPdf] GCS upload failed, falling back to Firestore", e);
    }
  }

  // Firestore fallback.
  const db = getDb();
  await db.collection("contract_signatures").doc(signatureId).set(
    {
      signedPdfBase64: pdfBuffer.toString("base64"),
      signedPdfStoredAt: new Date().toISOString(),
    },
    { merge: true }
  );
  return `firestore:${signatureId}`;
}

export async function readSignedPdf(
  pdfUrl: string,
  signatureId: string
): Promise<Buffer | null> {
  if (pdfUrl.startsWith("gs://")) {
    try {
      const { Storage } = await import("@google-cloud/storage");
      const storage = new Storage();
      const match = /^gs:\/\/([^/]+)\/(.+)$/.exec(pdfUrl);
      if (!match) return null;
      const [, bucketName, filePath] = match;
      const file = storage.bucket(bucketName!).file(filePath!);
      const [buffer] = await file.download();
      return buffer;
    } catch (e) {
      console.error("[readSignedPdf] GCS download failed", e);
      return null;
    }
  }

  if (pdfUrl.startsWith("firestore:")) {
    const db = getDb();
    const doc = await db.collection("contract_signatures").doc(signatureId).get();
    if (!doc.exists) return null;
    const data = doc.data() as Record<string, unknown>;
    const b64 = typeof data.signedPdfBase64 === "string" ? data.signedPdfBase64 : "";
    if (!b64) return null;
    return Buffer.from(b64, "base64");
  }

  return null;
}
