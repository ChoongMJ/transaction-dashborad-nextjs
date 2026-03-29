"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  clearStoredSession,
  queryKeys,
  readStoredSession,
  storeSession,
} from "@/app/core";
import {
  addTransactionNote,
  fetchTransaction,
  fetchTransactionOverview,
  fetchTransactions,
  getSession,
  updateTransaction,
} from "@/app/services";
import type {
  AddTransactionNotePayload,
  Transaction,
  TransactionListParams,
  TransactionsListResponse,
  UpdateTransactionPayload,
} from "@/types/transaction";

export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session,
    queryFn: async () => {
      const response = await getSession();

      if (response.session) {
        storeSession(response.session);
      } else {
        clearStoredSession();
      }

      return response.session;
    },
    initialData: readStoredSession,
    staleTime: 60_000,
  });
}

export function useTransactions(params: TransactionListParams) {
  return useQuery({
    queryKey: queryKeys.transactions.list(params),
    queryFn: () => fetchTransactions(params),
    placeholderData: keepPreviousData,
  });
}

export function useTransactionOverview() {
  return useQuery({
    queryKey: queryKeys.transactions.overview(),
    queryFn: fetchTransactionOverview,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: queryKeys.transactions.detail(id),
    queryFn: async () => (await fetchTransaction(id)).data,
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
      addTransactionNote(id, payload),
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
