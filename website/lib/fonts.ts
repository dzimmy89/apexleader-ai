import { Fira_Code, IBM_Plex_Sans, Instrument_Serif, Libre_Baskerville } from "next/font/google";

/** Headlines and the wordmark. */
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

/** Long-form reading: marketing paragraphs and lesson prose. */
const body = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-body",
  display: "swap",
});

/** Everything you act on or scan: nav, buttons, labels, forms, tables, chips. */
const ui = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui",
  display: "swap",
});

/** Code, addresses, hashes and aligned numbers only. */
const mono = Fira_Code({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const fontVariables = `${display.variable} ${body.variable} ${ui.variable} ${mono.variable}`;
