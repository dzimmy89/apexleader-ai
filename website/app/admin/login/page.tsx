import { LoginForm } from "./LoginForm";
import { isAdminTeamPasswordConfigured } from "@/lib/auth/admin-team-password";

export const dynamic = "force-dynamic";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4">
      <LoginForm passwordEnabled={isAdminTeamPasswordConfigured()} />
    </div>
  );
}
