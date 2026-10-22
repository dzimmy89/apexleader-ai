import localFont from "next/font/local";

// Self-hosted (fonts/, SIL Open Font License) so builds never depend on
// reaching Google Fonts.

/** Headlines and the wordmark. */
const display = localFont({
  src: [
    { path: "../fonts/instrument-serif-latin-400-normal.woff2", weight: "400", style: "normal" },
  ],
  fallback: ["serif"],
  variable: "--font-display",
  display: "swap",
});

/** Long-form reading: marketing paragraphs and lesson prose. */
const body = localFont({
  src: [
    { path: "../fonts/libre-baskerville-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/libre-baskerville-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  fallback: ["serif"],
  variable: "--font-body",
  display: "swap",
});

/** Everything you act on or scan: nav, buttons, labels, forms, tables, chips. */
const ui = localFont({
  src: [
    { path: "../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/ibm-plex-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  fallback: ["sans-serif"],
  variable: "--font-ui",
  display: "swap",
});

/** Code, addresses, hashes and aligned numbers only. */
const mono = localFont({
  src: [
    { path: "../fonts/fira-code-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/fira-code-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  fallback: ["monospace"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${display.variable} ${body.variable} ${ui.variable} ${mono.variable}`;
