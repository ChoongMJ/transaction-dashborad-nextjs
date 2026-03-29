import { BarChart3, ShieldCheck, Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login-form";
import { getServerSessionUser } from "@/app/mock-backend";

export const metadata = {
  title: "Login",
};

export default async function LoginPage() {
  const user = await getServerSessionUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="grid min-h-screen gap-8 p-4 lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
      <section className="hidden rounded-[2rem] bg-sidebar p-8 text-sidebar-foreground lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="inline-flex rounded-full bg-white/10 px-3 py-1 text-sm font-medium">
            Transaction Management Dashboard
          </div>
          <h1 className="mt-8 max-w-lg text-5xl font-semibold tracking-tight">
            A polished operations console for high-volume payment teams.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-sidebar-muted">
            Review failed charges, manage settlement queues, and keep finance,
            support, and risk teams aligned from a single frontend-first dashboard.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "Protected routes",
              description: "Cookie-backed access for dashboard sections.",
            },
            {
              icon: BarChart3,
              title: "Actionable metrics",
              description: "Charts and stats built from realistic mock data.",
            },
            {
              icon: Sparkles,
              title: "Production polish",
              description: "Loading, empty, and mutation flows included.",
            },
          ].map((item) => (
            <div key={item.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <item.icon className="size-5" />
              <p className="mt-4 font-semibold">{item.title}</p>
              <p className="mt-2 text-sm text-sidebar-muted">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="flex items-center justify-center">
        <LoginForm />
      </section>
    </div>
  );
}
