import { adminFontVariables } from "@/lib/admin/mission-control-fonts";

export const metadata = {
  title: "ApexLeader.ai Mission Control",
  robots: { index: false, follow: false },
};

export default function AdminLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${adminFontVariables} admin-mission-control bg-black`}>
      {children}
    </div>
  );
}
