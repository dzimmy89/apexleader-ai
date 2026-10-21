import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { GTM_ID } from "@/lib/gtm";
import { fontVariables } from "@/lib/fonts";
import { SITE_URL } from "@/lib/seo/site-url";

export const metadata: Metadata = {
  title: {
    default: "DeFi University — Live DeFi Education with David Zimmerman",
    template: "%s | DeFi University",
  },
  description:
    "One DeFi University membership, $97 a month on Skool: live Q&A with David Zimmerman three days a week and 31 courses. Private 1-on-1 DeFi coaching is separate, from $750. Education only — you keep custody.",
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    siteName: "DeFi University",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fontVariables}>
      <head>
        <Script id="gtm-init" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
