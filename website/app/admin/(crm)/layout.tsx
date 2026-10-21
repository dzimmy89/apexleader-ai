import { AdminCrmShell } from "@/components/admin/crm/AdminCrmShell";
import { AdminToaster } from "@/components/admin/crm/AdminToaster";
import { adminFontVariables } from "@/lib/admin/mission-control-fonts";
import { getAdminSession } from "@/lib/auth/admin-session-cookie";

export const metadata = {
  title: "Admin — DeFi University",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  return (
    <div className={`${adminFontVariables} admin-mission-control`}>
      <AdminCrmShell username={session.username}>
        {children}
        <AdminToaster position="bottom-right" />
      </AdminCrmShell>
    </div>
  );
}
