"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  CircleDollarSign,
  Clock3,
  CreditCard,
} from "lucide-react";
import type { ComponentType } from "react";

import {
  formatCompactCurrency,
  formatCurrency,
  formatRelativeTime,
  formatShortDate,
} from "@/app/core";
import { useTransactionOverview } from "@/app/hooks";
import {
  ErrorState,
  LoadingSkeleton,
  StatusBadge,
} from "@/app/shared-components";
import { Badge, Card, CardContent } from "@/app/ui";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="rounded-2xl bg-secondary p-2 text-primary">
            <Icon className="size-4" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-semibold tracking-tight">{value}</p>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardOverviewClient() {
  const overviewQuery = useTransactionOverview();

  if (overviewQuery.isLoading) {
    return <LoadingSkeleton hasCards rows={4} />;
  }

  if (overviewQuery.isError || !overviewQuery.data) {
    return (
      <ErrorState
        title="Overview data is unavailable"
        description="We couldn't load the latest dashboard metrics. Try refreshing the page."
        onRetry={() => overviewQuery.refetch()}
      />
    );
  }

  const { summary, revenueTrend, recentActivity, statusBreakdown } = overviewQuery.data;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Transactions"
          value={summary.totalTransactions.toLocaleString()}
          description="Volume processed across the current dataset."
          icon={CreditCard}
        />
        <StatCard
          title="Total Revenue"
          value={formatCompactCurrency(summary.totalRevenue)}
          description="Gross processed value excluding failed attempts."
          icon={CircleDollarSign}
        />
        <StatCard
          title="Failed Transactions"
          value={summary.failedTransactions.toLocaleString()}
          description="Requires investigation by operations or risk."
          icon={AlertTriangle}
        />
        <StatCard
          title="Pending Transactions"
          value={summary.pendingTransactions.toLocaleString()}
          description="Still settling or waiting on downstream action."
          icon={Clock3}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardContent>
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenue trend</p>
                <h2 className="text-xl font-semibold tracking-tight">
                  Daily processing volume
                </h2>
              </div>
              <Badge variant="info">Last 10 days</Badge>
            </div>
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueTrend}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#103b73" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#103b73" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#d7dfeb" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatShortDate}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tickFormatter={(value) => formatCompactCurrency(Number(value))}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(typeof value === "number" ? value : Number(value ?? 0))
                    }
                    labelFormatter={(value) => formatShortDate(String(value))}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#103b73"
                    fill="url(#revenueGradient)"
                    strokeWidth={2.5}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="mb-6">
              <p className="text-sm text-muted-foreground">Status mix</p>
              <h2 className="text-xl font-semibold tracking-tight">
                Transaction health distribution
              </h2>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusBreakdown} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="#d7dfeb" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="label"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#2bb3a3" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent>
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-2 text-primary">
              <Activity className="size-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Recent activity</p>
              <h2 className="text-xl font-semibold tracking-tight">
                Latest status changes from the operations queue
              </h2>
            </div>
          </div>
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold">{activity.customerName}</p>
                    <StatusBadge status={activity.status} />
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activity.transactionId} updated by {activity.changedBy}
                  </p>
                  {activity.reason ? (
                    <p className="mt-2 text-sm text-foreground/80">{activity.reason}</p>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground">
                  {formatRelativeTime(activity.changedAt)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
