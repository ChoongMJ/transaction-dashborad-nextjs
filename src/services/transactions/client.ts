import type {
  AddTransactionNotePayload,
  Transaction,
  TransactionListParams,
  TransactionsListResponse,
  TransactionsOverviewResponse,
  UpdateTransactionPayload,
} from "@/types/transaction";
import { apiRequest } from "@/services/api/client";

function createQueryString(params: TransactionListParams) {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") {
    searchParams.set("status", params.status);
  }
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export function fetchTransactions(params: TransactionListParams) {
  const query = createQueryString(params);

  return apiRequest<TransactionsListResponse>(
    `/api/transactions${query ? `?${query}` : ""}`,
  );
}

export function fetchTransactionOverview() {
  return apiRequest<TransactionsOverviewResponse>("/api/transactions?view=overview");
}

export function fetchTransaction(id: string) {
  return apiRequest<{ data: Transaction }>(`/api/transactions/${id}`);
}

export function updateTransaction(id: string, payload: UpdateTransactionPayload) {
  return apiRequest<{ data: Transaction }>(`/api/transactions/${id}`, {
    method: "PATCH",
    body: payload,
  });
}

export function addTransactionNote(
  id: string,
  payload: AddTransactionNotePayload,
) {
  return apiRequest<{ data: Transaction }>(`/api/transactions/${id}/notes`, {
    method: "POST",
    body: payload,
  });
}
