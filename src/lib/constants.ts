import {
  BarChart3,
  CreditCard,
  type LucideIcon,
  LayoutDashboard,
} from "lucide-react";

import type { TransactionStatus } from "@/types/transaction";

export const appName = "Transaction Management Dashboard";
export const sessionCookieName = "tm_session";

export const transactionStatusOptions: Array<{
  label: string;
  value: TransactionStatus | "all";
}> = [
  { label: "All statuses", value: "all" },
  { label: "Completed", value: "completed" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

export const statusLabelMap: Record<TransactionStatus, string> = {
  pending: "Pending",
  completed: "Completed",
  failed: "Failed",
  refunded: "Refunded",
};

export const dashboardNavigation: Array<{
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
}> = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    description: "Executive summary and trends",
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: CreditCard,
    description: "Search, review, and update payments",
  },
  {
    href: "/dashboard/transactions?status=failed",
    label: "Exceptions",
    icon: BarChart3,
    description: "Investigate failures and refunds",
  },
];
