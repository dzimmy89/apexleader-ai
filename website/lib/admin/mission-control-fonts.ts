import { Chakra_Petch, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";

export const adminDisplay = Chakra_Petch({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-admin-display",
  display: "swap",
});

export const adminSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-admin-sans",
  display: "swap",
});

export const adminMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-admin-mono",
  display: "swap",
});

export const adminFontVariables = `${adminDisplay.variable} ${adminSans.variable} ${adminMono.variable}`;
