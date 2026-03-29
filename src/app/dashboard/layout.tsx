import { redirect } from "next/navigation";

import { AppShell } from "@/components/dashboard/dashboard-shell";
import { getServerSessionUser } from "@/data/mock-backend";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSessionUser();

  if (!user) {
    redirect("/login");
  }

  return <AppShell user={user}>{children}</AppShell>;
}
