import localFont from "next/font/local";

// Self-hosted (fonts/, SIL Open Font License) so builds never depend on
// reaching Google Fonts.

export const adminDisplay = localFont({
  src: [
    { path: "../../fonts/chakra-petch-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/chakra-petch-latin-600-normal.woff2", weight: "600", style: "normal" },
  ],
  fallback: ["sans-serif"],
  variable: "--font-admin-display",
  display: "swap",
});

export const adminSans = localFont({
  src: [
    { path: "../../fonts/ibm-plex-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/ibm-plex-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  fallback: ["sans-serif"],
  variable: "--font-admin-sans",
  display: "swap",
});

export const adminMono = localFont({
  src: [
    { path: "../../fonts/jetbrains-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/jetbrains-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
  ],
  fallback: ["monospace"],
  variable: "--font-admin-mono",
  display: "swap",
});

export const adminFontVariables = `${adminDisplay.variable} ${adminSans.variable} ${adminMono.variable}`;
