"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/core";
import {
  createTransactionNote,
  bulkUpdateTransactions,
  getTransactionById,
  getTransactions,
  getTransactionsOverview,
  updateTransaction,
} from "@/services/api/transactions";
import type {
  AddTransactionNotePayload,
  BulkTransactionPayload,
  Transaction,
  TransactionListParams,
  TransactionsListResponse,
  UpdateTransactionPayload,
} from "@/types/transaction";

type TransactionCacheSnapshot = {
  previousDetails: Array<readonly [readonly ["transactions", "detail", string], Transaction | undefined]>;
  previousLists: Array<[readonly unknown[], TransactionsListResponse | undefined]>;
};

function getTransactionCacheSnapshot(
  queryClient: ReturnType<typeof useQueryClient>,
  ids: string[],
): TransactionCacheSnapshot {
  return {
    previousDetails: ids.map((id) => [
      queryKeys.transactions.detail(id),
      queryClient.getQueryData<Transaction>(queryKeys.transactions.detail(id)),
    ] as const),
    previousLists:
      queryClient.getQueriesData<TransactionsListResponse>({
        queryKey: queryKeys.transactions.lists(),
      }),
  };
}

function restoreTransactionCache(
  queryClient: ReturnType<typeof useQueryClient>,
  snapshot?: TransactionCacheSnapshot,
) {
  snapshot?.previousDetails.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });

  snapshot?.previousLists.forEach(([key, data]) => {
    queryClient.setQueryData(key, data);
  });
}

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData,
  });
}

export function useTransactionOverview() {
  return useQuery({
    queryKey: queryKeys.transactions.overview(),
    queryFn: getTransactionsOverview,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: async () => (await getTransactionById(id)).data,
    enabled: Boolean(id),
  });
}

export function useUpdateTransaction(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateTransactionPayload) => updateTransaction(id, payload),
    onMutate: async (payload) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.transactions.detail(id) }),
        queryClient.cancelQueries({ queryKey: queryKeys.transactions.lists() }),
      ]);

      const previousDetail = queryClient.getQueryData<Transaction>(
        queryKeys.transactions.detail(id),
      );
      const previousLists =
        queryClient.getQueriesData<TransactionsListResponse>({
          queryKey: queryKeys.transactions.lists(),
        });
      const optimisticChangedAt = new Date().toISOString();

      queryClient.setQueryData<Transaction | undefined>(
        queryKeys.transactions.detail(id),
        (current) =>
          current
            ? {
                ...current,
                status: payload.status,
                updatedAt: optimisticChangedAt,
                statusHistory: [
                  {
                    id: `optimistic-status-${payload.status}`,
                    status: payload.status,
                    changedAt: optimisticChangedAt,
                    changedBy: "Operations Admin",
                    reason: "Updated from dashboard",
                  },
                  ...current.statusHistory,
                ],
              }
            : current,
      );

      queryClient.setQueriesData<TransactionsListResponse>(
        { queryKey: queryKeys.transactions.lists() },
        (current) =>
          current
            ? {
                ...current,
                data: current.data.map((transaction) =>
                  transaction.id === id
                    ? {
                        ...transaction,
                        status: payload.status,
                        updatedAt: optimisticChangedAt,
                      }
                    : transaction,
                ),
              }
            : current,
      );

      return {
        previousDetail,
        previousLists,
      };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.transactions.detail(id),
          context.previousDetail,
        );
      }

      context?.previousLists.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.transactions.detail(id), response.data);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.root });
    },
  });
}

export function useAddTransactionNote(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddTransactionNotePayload) =>
      createTransactionNote(id, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.transactions.detail(id) });

      const previousDetail = queryClient.getQueryData<Transaction>(
        queryKeys.transactions.detail(id),
      );
      const optimisticCreatedAt = new Date().toISOString();

      queryClient.setQueryData<Transaction | undefined>(
        queryKeys.transactions.detail(id),
        (current) =>
          current
            ? {
                ...current,
                updatedAt: optimisticCreatedAt,
                notes: [
                  {
                    id: `optimistic-note-${optimisticCreatedAt}`,
                    message: payload.message,
                    author: "Operations Admin",
                    createdAt: optimisticCreatedAt,
                  },
                  ...current.notes,
                ],
              }
            : current,
      );

      return { previousDetail };
    },
    onError: (_error, _payload, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.transactions.detail(id),
          context.previousDetail,
        );
      }
    },
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.transactions.detail(id), response.data);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.root });
    },
  });
}

export function useBulkTransactionAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BulkTransactionPayload) => bulkUpdateTransactions(payload),
    onMutate: async (payload) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: queryKeys.transactions.lists() }),
        ...payload.ids.map((id) =>
          queryClient.cancelQueries({ queryKey: queryKeys.transactions.detail(id) }),
        ),
      ]);

      const snapshot = getTransactionCacheSnapshot(queryClient, payload.ids);
      const selectedIds = new Set(payload.ids);
      const optimisticChangedAt = new Date().toISOString();

      if (payload.action === "update_status") {
        queryClient.setQueriesData<TransactionsListResponse>(
          { queryKey: queryKeys.transactions.lists() },
          (current) =>
            current
              ? {
                  ...current,
                  data: current.data.map((transaction) =>
                    selectedIds.has(transaction.id)
                      ? {
                          ...transaction,
                          status: payload.status,
                          updatedAt: optimisticChangedAt,
                        }
                      : transaction,
                  ),
                }
              : current,
        );

        payload.ids.forEach((id) => {
          queryClient.setQueryData<Transaction | undefined>(
            queryKeys.transactions.detail(id),
            (current) =>
              current
                ? {
                    ...current,
                    status: payload.status,
                    updatedAt: optimisticChangedAt,
                    statusHistory: [
                      {
                        id: `optimistic-bulk-status-${payload.status}-${id}`,
                        status: payload.status,
                        changedAt: optimisticChangedAt,
                        changedBy: "Operations Admin",
                        reason: "Bulk status update from dashboard",
                      },
                      ...current.statusHistory,
                    ],
                  }
                : current,
          );
        });
      }

      if (payload.action === "delete") {
        queryClient.setQueriesData<TransactionsListResponse>(
          { queryKey: queryKeys.transactions.lists() },
          (current) => {
            if (!current) {
              return current;
            }

            const removedCount = current.data.filter((transaction) =>
              selectedIds.has(transaction.id),
            ).length;
            const nextTotalItems = Math.max(0, current.meta.totalItems - removedCount);
            const nextTotalPages = Math.max(
              1,
              Math.ceil(nextTotalItems / current.meta.pageSize),
            );

            return {
              ...current,
              data: current.data.filter((transaction) => !selectedIds.has(transaction.id)),
              meta: {
                ...current.meta,
                totalItems: nextTotalItems,
                totalPages: nextTotalPages,
                page: Math.min(current.meta.page, nextTotalPages),
              },
            };
          },
        );

        payload.ids.forEach((id) => {
          queryClient.removeQueries({ queryKey: queryKeys.transactions.detail(id) });
        });
      }

      return { snapshot };
    },
    onError: (_error, _payload, context) => {
      restoreTransactionCache(queryClient, context?.snapshot);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.transactions.root });
    },
  });
}
