import { AttributionCapture } from "@/components/AttributionCapture";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AttributionCapture />
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
