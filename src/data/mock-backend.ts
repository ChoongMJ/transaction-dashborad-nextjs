import { cookies } from "next/headers";

import { sessionCookieName } from "@/lib/constants";
import type { Session, User } from "@/types/auth";
import type {
  RecentActivityItem,
  RevenuePoint,
  Transaction,
  TransactionListParams,
  TransactionNote,
  TransactionStatus,
  TransactionsOverviewResponse,
} from "@/types/transaction";

export const demoAccounts: Array<{
  email: string;
  password: string;
  user: User;
}> = [
  {
    email: "olivia@northstarops.com",
    password: "admin12345",
    user: {
      id: "usr_ops_admin_001",
      name: "Olivia Hart",
      email: "olivia@northstarops.com",
      role: "admin",
    },
  },
  {
    email: "liam.viewer@northstarops.com",
    password: "viewer12345",
    user: {
      id: "usr_ops_viewer_001",
      name: "Liam Brooks",
      email: "liam.viewer@northstarops.com",
      role: "viewer",
    },
  },
];

export const demoCredentials = demoAccounts[0];

const customers = [
  ["Maya Patel", "maya.patel@aurora-retail.com"],
  ["Ethan Carter", "ethan.carter@northpass.io"],
  ["Sophia Nguyen", "sophia.nguyen@horizonlabs.co"],
  ["Daniel Kim", "daniel.kim@clearbridge.dev"],
  ["Ava Rodriguez", "ava.rodriguez@stridefinance.com"],
  ["Noah Thompson", "noah.thompson@harborworks.com"],
  ["Isabella Moore", "isabella.moore@pinecrest.co"],
  ["Liam Johnson", "liam.johnson@granitepay.io"],
  ["Charlotte Green", "charlotte.green@midtownlogistics.com"],
  ["James Walker", "james.walker@modernstack.dev"],
  ["Amelia Scott", "amelia.scott@sunlinehealth.com"],
  ["Benjamin Lewis", "benjamin.lewis@northwave.io"],
] as const;

const paymentMethods = [
  "Visa ending 4242",
  "Mastercard ending 8842",
  "PayPal Business",
  "ACH Bank Transfer",
  "Apple Pay",
  "American Express ending 9103",
] as const;

const statuses: TransactionStatus[] = [
  "completed",
  "completed",
  "pending",
  "failed",
  "completed",
  "refunded",
];

declare global {
  var __transactionStore: Transaction[] | undefined;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function hoursFrom(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 60 * 60 * 1000).toISOString();
}

function createStatusHistory(
  status: TransactionStatus,
  createdAt: Date,
) {
  const pending = {
    id: crypto.randomUUID(),
    status: "pending" as const,
    changedAt: createdAt.toISOString(),
    changedBy: "System",
    reason: "Transaction submitted",
  };

  if (status === "pending") {
    return [pending];
  }

  const resolved = {
    id: crypto.randomUUID(),
    status,
    changedAt: hoursFrom(createdAt, status === "refunded" ? 18 : 4),
    changedBy: status === "failed" ? "Risk Engine" : "Payments Service",
    reason:
      status === "failed"
        ? "Payment authorization failed"
        : status === "refunded"
          ? "Refund requested by customer success"
          : "Settlement completed successfully",
  };

  if (status !== "refunded") {
    return [resolved, pending];
  }

  return [
    resolved,
    {
      id: crypto.randomUUID(),
      status: "completed" as const,
      changedAt: hoursFrom(createdAt, 4),
      changedBy: "Payments Service",
      reason: "Settlement completed successfully",
    },
    pending,
  ];
}

function createNotes(index: number, status: TransactionStatus, createdAt: Date) {
  const notes: TransactionNote[] = [];

  if (status === "failed") {
    notes.push({
      id: crypto.randomUUID(),
      message: "Customer notified to retry with an alternate payment method.",
      author: "Risk Desk",
      createdAt: hoursFrom(createdAt, 5),
    });
  }

  if (status === "refunded") {
    notes.push({
      id: crypto.randomUUID(),
      message: "Refund approved after duplicate capture review.",
      author: "Finance Ops",
      createdAt: hoursFrom(createdAt, 19),
    });
  }

  if (index % 3 === 0) {
    notes.push({
      id: crypto.randomUUID(),
      message: "VIP customer. Monitor settlement timing closely.",
      author: "Operations Team",
      createdAt: hoursFrom(createdAt, 1.5),
    });
  }

  return notes.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function seedTransactions() {
  return Array.from({ length: 42 }, (_, index) => {
    const [customerName, email] = customers[index % customers.length];
    const status = statuses[index % statuses.length];
    const createdAt = new Date(
      Date.UTC(2026, 2, 1 + (index % 26), 7 + (index % 9), 12 + (index % 35)),
    );
    const updatedAt =
      status === "pending"
        ? hoursFrom(createdAt, 1)
        : hoursFrom(createdAt, status === "refunded" ? 19 : 4.5);

    return {
      id: `TXN-202603-${String(index + 1).padStart(4, "0")}`,
      customerName,
      email,
      amount: Number(
        (92 + ((index * 47) % 1850) + ((index % 5) * 0.75)).toFixed(2),
      ),
      currency: "USD",
      status,
      paymentMethod: paymentMethods[index % paymentMethods.length],
      createdAt: createdAt.toISOString(),
      updatedAt,
      notes: createNotes(index, status, createdAt),
      statusHistory: createStatusHistory(status, createdAt),
    };
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

const store = globalThis.__transactionStore ?? seedTransactions();

if (!globalThis.__transactionStore) {
  globalThis.__transactionStore = store;
}

function normalizeParams(params: TransactionListParams) {
  return {
    page: Math.max(1, params.page ?? 1),
    pageSize: Math.max(1, Math.min(params.pageSize ?? 10, 50)),
    search: params.search?.trim() ?? "",
    status: params.status ?? "all",
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: params.sortOrder ?? "desc",
  } as const;
}

export async function wait(ms = 300) {
  await new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function getServerSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(sessionCookieName);

  return (
    demoAccounts.find((account) => account.user.id === sessionCookie?.value)?.user ?? null
  );
}

export function createSession(user: User): Session {
  return {
    token: crypto.randomUUID(),
    user,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export function listTransactions(params: TransactionListParams) {
  const normalized = normalizeParams(params);
  const searchValue = normalized.search.toLowerCase();
  let filtered = [...store];

  if (normalized.status !== "all") {
    filtered = filtered.filter((transaction) => transaction.status === normalized.status);
  }

  if (searchValue) {
    filtered = filtered.filter((transaction) =>
      [
        transaction.id,
        transaction.customerName,
        transaction.email,
        transaction.paymentMethod,
      ]
        .join(" ")
        .toLowerCase()
        .includes(searchValue),
    );
  }

  filtered.sort((left, right) => {
    const modifier = normalized.sortOrder === "asc" ? 1 : -1;

    if (normalized.sortBy === "amount") {
      return (left.amount - right.amount) * modifier;
    }

    return (
      (new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()) *
      modifier
    );
  });

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / normalized.pageSize));
  const page = Math.min(normalized.page, totalPages);
  const start = (page - 1) * normalized.pageSize;

  return {
    data: clone(filtered.slice(start, start + normalized.pageSize)),
    meta: {
      page,
      pageSize: normalized.pageSize,
      totalItems,
      totalPages,
    },
    filters: {
      ...normalized,
      page,
    },
  };
}

export function getTransactionById(id: string) {
  const transaction = store.find((item) => item.id === id);
  return transaction ? clone(transaction) : null;
}

export function updateTransactionStatus(id: string, status: TransactionStatus) {
  const transaction = store.find((item) => item.id === id);

  if (!transaction) {
    return null;
  }

  transaction.status = status;
  transaction.updatedAt = new Date().toISOString();
  transaction.statusHistory.unshift({
    id: crypto.randomUUID(),
    status,
    changedAt: transaction.updatedAt,
    changedBy: "Operations Admin",
    reason: "Updated from dashboard",
  });

  return clone(transaction);
}

export function bulkUpdateTransactionStatus(
  ids: string[],
  status: TransactionStatus,
) {
  const updatedAt = new Date().toISOString();
  const selectedIds = new Set(ids);
  const updatedTransactions: Transaction[] = [];

  for (const transaction of store) {
    if (!selectedIds.has(transaction.id)) {
      continue;
    }

    transaction.status = status;
    transaction.updatedAt = updatedAt;
    transaction.statusHistory.unshift({
      id: crypto.randomUUID(),
      status,
      changedAt: updatedAt,
      changedBy: "Operations Admin",
      reason: "Bulk status update from dashboard",
    });
    updatedTransactions.push(clone(transaction));
  }

  return updatedTransactions;
}

export function bulkDeleteTransactions(ids: string[]) {
  const selectedIds = new Set(ids);
  const deletedTransactions = store
    .filter((transaction) => selectedIds.has(transaction.id))
    .map((transaction) => clone(transaction));

  if (deletedTransactions.length === 0) {
    return [];
  }

  const remainingTransactions = store.filter(
    (transaction) => !selectedIds.has(transaction.id),
  );

  store.splice(0, store.length, ...remainingTransactions);

  return deletedTransactions;
}

export function addTransactionNote(id: string, message: string) {
  const transaction = store.find((item) => item.id === id);

  if (!transaction) {
    return null;
  }

  const note: TransactionNote = {
    id: crypto.randomUUID(),
    message,
    author: "Operations Admin",
    createdAt: new Date().toISOString(),
  };

  transaction.notes.unshift(note);
  transaction.updatedAt = note.createdAt;

  return clone(transaction);
}

function revenueTrend(transactions: Transaction[]): RevenuePoint[] {
  const grouped = new Map<string, RevenuePoint>();

  for (const transaction of transactions) {
    const date = transaction.createdAt.slice(0, 10);
    const current = grouped.get(date) ?? { date, revenue: 0, transactions: 0 };
    current.revenue += transaction.status === "failed" ? 0 : transaction.amount;
    current.transactions += 1;
    grouped.set(date, current);
  }

  return Array.from(grouped.values())
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-10);
}

function recentActivity(transactions: Transaction[]): RecentActivityItem[] {
  return transactions
    .flatMap((transaction) =>
      transaction.statusHistory.map((entry) => ({
        id: entry.id,
        transactionId: transaction.id,
        customerName: transaction.customerName,
        status: entry.status,
        changedAt: entry.changedAt,
        changedBy: entry.changedBy,
        reason: entry.reason,
      })),
    )
    .sort((a, b) => b.changedAt.localeCompare(a.changedAt))
    .slice(0, 7);
}

export function getTransactionsOverview(): TransactionsOverviewResponse {
  const transactions = clone(store);
  const totalRevenue = transactions.reduce((sum, transaction) => {
    if (transaction.status === "failed") {
      return sum;
    }

    return sum + transaction.amount;
  }, 0);

  return {
    summary: {
      totalTransactions: transactions.length,
      totalRevenue,
      failedTransactions: transactions.filter((item) => item.status === "failed")
        .length,
      pendingTransactions: transactions.filter((item) => item.status === "pending")
        .length,
    },
    statusBreakdown: [
      {
        label: "Completed",
        value: transactions.filter((item) => item.status === "completed").length,
      },
      {
        label: "Pending",
        value: transactions.filter((item) => item.status === "pending").length,
      },
      {
        label: "Failed",
        value: transactions.filter((item) => item.status === "failed").length,
      },
      {
        label: "Refunded",
        value: transactions.filter((item) => item.status === "refunded").length,
      },
    ],
    revenueTrend: revenueTrend(transactions),
    recentActivity: recentActivity(transactions),
  };
}
