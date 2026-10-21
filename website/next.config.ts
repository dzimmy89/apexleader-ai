import type { NextConfig } from "next";
import { LEGACY_WWW_HOST, SITE_URL } from "./lib/seo/site-url";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingExcludes: {
    "*": ["./scripts/**"],
  },
  // Metadata is static, so blocking costs nothing; streamed metadata lands in <body> on dynamic pages.
  htmlLimitedBots: /.*/,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // Stripe webhooks and Cloud Scheduler do not follow redirects, so /api stays on both hosts.
      {
        source: "/:path((?!api(?:/|$)).*)",
        has: [{ type: "host", value: LEGACY_WWW_HOST }],
        destination: `${SITE_URL}/:path`,
        permanent: true,
      },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
      { source: "/terms-of-service", destination: "/terms", permanent: true },
      { source: "/university.html", destination: "/university", permanent: true },
      { source: "/coaching.html", destination: "/coaching", permanent: true },
      { source: "/index.html", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
