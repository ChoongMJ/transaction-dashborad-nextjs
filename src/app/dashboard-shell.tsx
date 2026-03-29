"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { clearStoredSession, cn } from "@/app/core";
import { Dialog, Button } from "@/app/ui";
import { logout } from "@/app/services";
import { dashboardNavigation } from "@/lib/constants";
import type { User } from "@/types/auth";

function SidebarNav({
  onNavigate,
}: {
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {dashboardNavigation.map((item) => {
        const active =
          item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname.startsWith("/dashboard/transactions") &&
              item.href.startsWith("/dashboard/transactions");

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-start gap-3 rounded-xl px-3 py-3 text-sm transition-colors",
              active
                ? "bg-white/10 text-sidebar-foreground"
                : "text-sidebar-muted hover:bg-white/6 hover:text-sidebar-foreground",
            )}
          >
            <item.icon className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="mt-1 text-xs text-sidebar-muted">{item.description}</p>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarContent({ user }: { user: User }) {
  return (
    <div className="flex h-full flex-col rounded-[1.75rem] bg-sidebar p-5 text-sidebar-foreground">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-2xl bg-white/10 p-3">
          <ShieldCheck className="size-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">Northstar Ops</p>
          <p className="text-xs text-sidebar-muted">Payments command center</p>
        </div>
      </div>
      <SidebarNav />
      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-sm font-semibold">{user.name}</p>
        <p className="mt-1 text-xs text-sidebar-muted">{user.role}</p>
      </div>
    </div>
  );
}

function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);

    try {
      await logout();
      clearStoredSession();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" loading={loading} onClick={handleLogout}>
      {!loading ? <LogOut className="mr-2 size-4" /> : null}
      Logout
    </Button>
  );
}

export function AppShell({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen p-3 lg:p-4">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <SidebarContent user={user} />
        </aside>
        <div className="flex min-w-0 flex-col">
          <header className="mb-4 flex items-center justify-between rounded-[1.5rem] border border-border/70 bg-card/90 px-4 py-3 shadow-sm backdrop-blur">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setMobileNavOpen(true)}
              >
                <Menu className="size-4" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">Operations workspace</p>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  Transaction Management Dashboard
                </h1>
              </div>
            </div>
            <LogoutButton />
          </header>
          <main className="min-w-0 flex-1">{children}</main>
        </div>
      </div>
      <Dialog
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        title="Navigation"
      >
        <div className="flex h-full flex-col">
          <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          <div className="mt-auto">
            <div className="mb-4 rounded-2xl bg-muted p-4">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">{user.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>
      </Dialog>
    </div>
  );
}
