import localFont from "next/font/local";

// Self-hosted (fonts/, SIL Open Font License) so builds never depend on
// reaching Google Fonts.

/** Headlines, stat numerals and the wordmark. */
const display = localFont({
  src: [
    { path: "../fonts/bricolage-grotesque-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../fonts/bricolage-grotesque-latin-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../fonts/bricolage-grotesque-latin-800-normal.woff2", weight: "800", style: "normal" },
  ],
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-display",
  display: "swap",
});

/** Long-form reading: marketing paragraphs and lesson prose. */
const body = localFont({
  src: [
    { path: "../fonts/instrument-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/instrument-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-body",
  display: "swap",
});

/** Everything you act on or scan: nav, buttons, labels, forms, tables, chips. */
const ui = localFont({
  src: [
    { path: "../fonts/instrument-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/instrument-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../fonts/instrument-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  fallback: ["system-ui", "sans-serif"],
  variable: "--font-ui",
  display: "swap",
});

/** Agent and system labels, code and aligned numbers. */
const mono = localFont({
  src: [
    { path: "../fonts/jetbrains-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../fonts/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  fallback: ["monospace"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${display.variable} ${body.variable} ${ui.variable} ${mono.variable}`;
