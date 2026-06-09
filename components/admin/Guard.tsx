"use client";

import { useAuth } from "@/lib/auth";
import { canSee, type NavKey } from "@/lib/admin";
import AdminShell from "./AdminShell";
import LoginScreen from "./LoginScreen";
import { AccessDenied } from "./ui";

/**
 * Gates an admin page:
 *  - not signed in  → login screen
 *  - signed in but role lacks the module → AccessDenied inside the shell
 *  - otherwise renders the page
 */
export default function Guard({
  module,
  title,
  sub,
  children,
}: {
  module: NavKey;
  title: string;
  sub?: string;
  children: React.ReactNode;
}) {
  const { user, ready } = useAuth();

  if (!ready) {
    return <div className="min-h-screen bg-paper" />;
  }
  if (!user) return <LoginScreen />;

  return (
    <AdminShell active={module} title={title} sub={sub}>
      {canSee(user, module) ? children : <AccessDenied />}
    </AdminShell>
  );
}
