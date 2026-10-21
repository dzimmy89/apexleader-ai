import { redirect } from "next/navigation";

/** The client portal moved into /account: sign in with the coaching email. */
export default function PortalAccessPage() {
  redirect("/login?next=/account");
}
