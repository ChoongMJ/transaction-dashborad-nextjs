export const transactionStatuses = [
  "pending",
  "completed",
  "failed",
  "refunded",
] as const;

export type TransactionStatus = (typeof transactionStatuses)[number];

export type TransactionNote = {
  id: string;
  message: string;
  author: string;
  createdAt: string;
};

export type TransactionStatusHistoryItem = {
  id: string;
  status: TransactionStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
};

export type Transaction = {
  id: string;
  customerName: string;
  email: string;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  notes: TransactionNote[];
  statusHistory: TransactionStatusHistoryItem[];
};

export type TransactionListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: TransactionStatus | "all";
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
};

export type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type TransactionsListResponse = {
  data: Transaction[];
  meta: PaginationMeta;
  filters: Required<TransactionListParams>;
};

export type OverviewMetric = {
  label: string;
  value: number;
};

export type RevenuePoint = {
  date: string;
  revenue: number;
  transactions: number;
};

export type RecentActivityItem = {
  id: string;
  transactionId: string;
  customerName: string;
  status: TransactionStatus;
  changedAt: string;
  changedBy: string;
  reason?: string;
};

export type TransactionsOverviewResponse = {
  summary: {
    totalTransactions: number;
    totalRevenue: number;
    failedTransactions: number;
    pendingTransactions: number;
  };
  statusBreakdown: OverviewMetric[];
  revenueTrend: RevenuePoint[];
  recentActivity: RecentActivityItem[];
};

export type UpdateTransactionPayload = {
  status: TransactionStatus;
};

export type AddTransactionNotePayload = {
  message: string;
};

export type BulkUpdateTransactionsPayload = {
  action: "update_status";
  ids: string[];
  status: TransactionStatus;
};

export type BulkDeleteTransactionsPayload = {
  action: "delete";
  ids: string[];
};

export type BulkTransactionPayload =
  | BulkUpdateTransactionsPayload
  | BulkDeleteTransactionsPayload;

export type BulkTransactionActionResponse = {
  data: {
    action: BulkTransactionPayload["action"];
    affectedIds: string[];
    transactions: Transaction[];
  };
};
