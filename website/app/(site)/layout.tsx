import { AttributionCapture } from "@/components/AttributionCapture";
import { ConfirmNotice } from "@/components/ConfirmNotice";
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
      <ConfirmNotice />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
