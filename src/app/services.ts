import { ApiError } from "@/app/core";
import type { LoginPayload, LoginResponse, Session } from "@/types/auth";
import type {
  AddTransactionNotePayload,
  Transaction,
  TransactionListParams,
  TransactionsListResponse,
  TransactionsOverviewResponse,
  UpdateTransactionPayload,
} from "@/types/transaction";

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
};

async function apiRequest<T>(
  input: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(input, {
    ...options,
    headers,
    credentials: "same-origin",
    cache: "no-store",
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.message ?? "Request failed.", response.status);
  }

  return payload as T;
}

function createQueryString(params: TransactionListParams) {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set("page", String(params.page));
  if (params.pageSize) searchParams.set("pageSize", String(params.pageSize));
  if (params.search) searchParams.set("search", params.search);
  if (params.status && params.status !== "all") searchParams.set("status", params.status);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);

  return searchParams.toString();
}

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function logout() {
  return apiRequest<{ success: true }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getSession() {
  return apiRequest<{ session: Session | null }>("/api/auth/session");
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
