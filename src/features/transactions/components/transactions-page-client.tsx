"use client";

import { ArrowRight, ArrowUpDown, CheckCheck, RotateCcw, Trash2, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  SearchInput,
  TableSkeleton,
} from "@/components/shared/common";
import { Button, Card, CardContent, Select } from "@/components/ui/primitives";
import { StatusBadge } from "@/features/transactions/components/status-badge";
import {
  useBulkTransactionAction,
  useTransactions,
} from "@/features/transactions/hooks/use-transactions";
import { transactionStatusOptions } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/core";
import type { UserRole } from "@/types/auth";
import type { TransactionListParams, TransactionsListResponse } from "@/types/transaction";

const pageSizeOptions = [
  { label: "10 rows", value: "10" },
  { label: "20 rows", value: "20" },
  { label: "30 rows", value: "30" },
];

const sortByOptions = [
  { label: "Created date", value: "createdAt" },
  { label: "Amount", value: "amount" },
];

const sortOrderOptions = [
  { label: "Descending", value: "desc" },
  { label: "Ascending", value: "asc" },
];

const allowedStatuses = new Set<string>(
  transactionStatusOptions.map((option) => option.value),
);

type UrlParamKey = "search" | "status" | "page" | "sort" | "order";

function getPageValue(rawValue: string | null) {
  const parsedValue = Number(rawValue);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function getStatusValue(
  rawValue: string | null,
): NonNullable<TransactionListParams["status"]> {
  if (rawValue && allowedStatuses.has(rawValue)) {
    return rawValue as NonNullable<TransactionListParams["status"]>;
  }

  return "all";
}

function getSortValue(rawValue: string | null): "createdAt" | "amount" {
  return rawValue === "amount" ? "amount" : "createdAt";
}

function getOrderValue(rawValue: string | null): "asc" | "desc" {
  return rawValue === "asc" ? "asc" : "desc";
}

function TransactionsSearchField({
  initialSearch,
  onSearchChange,
  disabled = false,
}: {
  initialSearch: string;
  onSearchChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialSearch);
  const deferredValue = useDeferredValue(value);

  useEffect(() => {
    if (deferredValue !== initialSearch) {
      onSearchChange(deferredValue);
    }
  }, [deferredValue, initialSearch, onSearchChange]);

  return <SearchInput value={value} onChange={setValue} disabled={disabled} />;
}

export function TransactionsPageClient({
  userRole,
}: {
  userRole: UserRole;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isViewer = userRole === "viewer";

  const urlSearch = searchParams.get("search") ?? "";
  const page = getPageValue(searchParams.get("page"));
  const status = getStatusValue(searchParams.get("status"));
  const sortBy = getSortValue(searchParams.get("sort"));
  const sortOrder = getOrderValue(searchParams.get("order"));

  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Exclude<
    NonNullable<TransactionListParams["status"]>,
    "all"
  >>("completed");

  function updateUrl(
    updates: Partial<Record<UrlParamKey, string | null>>,
    mode: "push" | "replace" = "push",
  ) {
    const nextParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of Object.entries(updates)) {
      if (!value || (key === "page" && value === "1")) {
        nextParams.delete(key);
      } else {
        nextParams.set(key, value);
      }
    }

    const nextQuery = nextParams.toString();
    const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    if (mode === "replace") {
      window.history.replaceState(null, "", nextUrl);
      return;
    }

    window.history.pushState(null, "", nextUrl);
  }

  const filters = useMemo(
    () => ({
      page,
      pageSize,
      search: urlSearch,
      status,
      sortBy,
      sortOrder,
    }),
    [page, pageSize, sortBy, sortOrder, status, urlSearch],
  );

  const query = useTransactions(filters);
  const bulkActionMutation = useBulkTransactionAction();
  const isInitialLoading = query.isLoading && !query.data;
  const isRefreshing = query.isFetching && Boolean(query.data);
  const areControlsDisabled = query.isFetching || bulkActionMutation.isPending;
  const selectedCount = selectedIds.length;
  const isBulkStatusPending =
    bulkActionMutation.isPending &&
    bulkActionMutation.variables?.action === "update_status";
  const isBulkDeletePending =
    bulkActionMutation.isPending &&
    bulkActionMutation.variables?.action === "delete";

  const columns = useMemo(
    () => [
      {
        key: "transaction",
        header: "Transaction",
        cell: (transaction: TransactionsListResponse["data"][number]) => (
          <div>
            <p className="font-semibold">{transaction.id}</p>
            <p className="text-xs text-muted-foreground">
              {formatDateTime(transaction.createdAt)}
            </p>
          </div>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        cell: (transaction: TransactionsListResponse["data"][number]) => (
          <div>
            <p className="font-medium">{transaction.customerName}</p>
            <p className="text-xs text-muted-foreground">{transaction.email}</p>
          </div>
        ),
      },
      {
        key: "amount",
        header: "Amount",
        cell: (transaction: TransactionsListResponse["data"][number]) => (
          <p className="font-semibold">
            {formatCurrency(transaction.amount, transaction.currency)}
          </p>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (transaction: TransactionsListResponse["data"][number]) => (
          <StatusBadge status={transaction.status} />
        ),
      },
      {
        key: "paymentMethod",
        header: "Payment Method",
        cell: (transaction: TransactionsListResponse["data"][number]) => (
          <p>{transaction.paymentMethod}</p>
        ),
      },
      {
        key: "actions",
        header: "Action",
        cell: () => (
          <span className="inline-flex items-center gap-2 font-medium text-primary">
            View details
            <ArrowRight className="size-4" />
          </span>
        ),
      },
    ],
    [],
  );

  function resetFilters() {
    setSelectedIds([]);
    setPageSize(10);
    updateUrl({
      search: null,
      status: null,
      page: null,
      sort: null,
      order: null,
    });
  }

  function toggleRowSelection(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : [...current, id],
    );
  }

  function toggleAllRows(ids: string[]) {
    setSelectedIds((current) => {
      const visibleIds = new Set(ids);
      const areAllVisibleSelected =
        ids.length > 0 && ids.every((id) => current.includes(id));

      if (areAllVisibleSelected) {
        return current.filter((id) => !visibleIds.has(id));
      }

      return Array.from(new Set([...current, ...ids]));
    });
  }

  async function runBulkAction() {
    if (selectedIds.length === 0) {
      return;
    }

    const payload = {
      action: "update_status" as const,
      ids: selectedIds,
      status: bulkStatus,
    };

    await bulkActionMutation.mutateAsync(payload);
    setSelectedIds((current) =>
      current.filter((id) => !payload.ids.includes(id)),
    );
  }

  async function deleteSelectedTransactions() {
    if (selectedIds.length === 0) {
      return;
    }

    const payload = {
      action: "delete" as const,
      ids: selectedIds,
    };

    await bulkActionMutation.mutateAsync(payload);
    setSelectedIds((current) =>
      current.filter((id) => !payload.ids.includes(id)),
    );
  }

  return (
    <div className="space-y-4">
      <FilterBar>
        <TransactionsSearchField
          key={urlSearch}
          initialSearch={urlSearch}
          disabled={areControlsDisabled}
          onSearchChange={(value) => {
            setSelectedIds([]);
            updateUrl(
              {
                search: value || null,
                page: "1",
              },
              "replace",
            );
          }}
        />
        <Select
          value={status}
          disabled={areControlsDisabled}
          onValueChange={(value) => {
            setSelectedIds([]);
            updateUrl({
              status: value === "all" ? null : value,
              page: "1",
            });
          }}
          options={transactionStatusOptions.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
        />
        <Select
          value={sortBy}
          disabled={areControlsDisabled}
          onValueChange={(value) => {
            setSelectedIds([]);
            updateUrl({
              sort: value,
              page: "1",
            });
          }}
          options={sortByOptions}
        />
        <div className="flex gap-2">
          <Select
            value={sortOrder}
            disabled={areControlsDisabled}
            onValueChange={(value) => {
              setSelectedIds([]);
              updateUrl({
                order: value,
                page: "1",
              });
            }}
            options={sortOrderOptions}
            className="flex-1"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={resetFilters}
            disabled={areControlsDisabled}
          >
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </FilterBar>

      {isInitialLoading ? <TableSkeleton rows={7} columns={7} /> : null}

      {query.isError ? (
        <ErrorState
          title="Transactions couldn't be loaded"
          description="The transaction feed is temporarily unavailable. Retry the request to continue."
          onRetry={() => query.refetch()}
          isRetrying={query.isFetching}
        />
      ) : null}

      {query.data && query.data.data.length === 0 ? (
        <EmptyState
          title="No transactions match these filters"
          description="Try broadening the search or clearing the status filter to see more records."
          action={
            <Button variant="outline" onClick={resetFilters}>
              Clear filters
            </Button>
          }
        />
      ) : null}

      {query.data && query.data.data.length > 0 ? (
        <Card className="transition-[opacity,transform] duration-200">
          <CardContent className="space-y-4">
            {!isViewer ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {selectedCount > 0
                      ? `${selectedCount} selected`
                      : "Select transactions to take bulk action"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Selections persist while you page through the current queue.
                  </p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Select
                    value={bulkStatus}
                    disabled={areControlsDisabled || selectedCount === 0}
                    onValueChange={(value) =>
                      setBulkStatus(
                        value as Exclude<
                          NonNullable<TransactionListParams["status"]>,
                          "all"
                        >,
                      )
                    }
                    options={transactionStatusOptions
                      .filter((option) => option.value !== "all")
                      .map((option) => ({
                        label: option.label,
                        value: option.value,
                      }))}
                    className="min-w-[180px]"
                  />
                  <Button
                    variant="secondary"
                    disabled={selectedCount === 0 || areControlsDisabled}
                    loading={isBulkStatusPending}
                    onClick={() => void runBulkAction()}
                  >
                    {!isBulkStatusPending ? (
                      <CheckCheck className="mr-2 size-4" />
                    ) : null}
                    Update status
                  </Button>
                  <Button
                    variant="danger"
                    disabled={selectedCount === 0 || areControlsDisabled}
                    loading={isBulkDeletePending}
                    onClick={() => void deleteSelectedTransactions()}
                  >
                    {!isBulkDeletePending ? <Trash2 className="mr-2 size-4" /> : null}
                    Delete (mock)
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={selectedCount === 0 || areControlsDisabled}
                    onClick={() => setSelectedIds([])}
                  >
                    <X className="mr-2 size-4" />
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                <p className="text-sm font-medium text-foreground">Viewer access</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  This account can review transactions, but status changes, notes, and
                  bulk actions are disabled.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <h2 className="text-xl font-semibold tracking-tight">
                  Searchable operations ledger
                </h2>
                <p className="mt-1 min-h-5 text-sm text-muted-foreground">
                  {isRefreshing ? "Refreshing transaction results..." : "Explore operational activity with stable filters and quick drill-downs."}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpDown className="size-4" />
                  Sorted by {sortBy === "amount" ? "amount" : "date"}
                </span>
                <Select
                  value={String(pageSize)}
                  disabled={areControlsDisabled}
                  onValueChange={(value) => {
                    setSelectedIds([]);
                    setPageSize(Number(value));
                    updateUrl({
                      page: "1",
                    });
                  }}
                  options={pageSizeOptions}
                  className="w-[120px]"
                />
              </div>
            </div>

            <DataTable
              columns={columns}
              rows={query.data.data}
              rowHref={(row) => `/dashboard/transactions/${row.id}`}
              className={isRefreshing ? "opacity-70" : "opacity-100"}
              selection={
                !isViewer
                  ? {
                      selectedIds,
                      disabled: areControlsDisabled,
                      onToggleRow: (row) => toggleRowSelection(row.id),
                      onToggleAll: (rows) =>
                        toggleAllRows(rows.map((row) => row.id)),
                      getRowLabel: (row) =>
                        `Select ${row.id} for ${row.customerName}`,
                    }
                  : undefined
              }
            />

            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {(query.data.meta.page - 1) * query.data.meta.pageSize + 1}-
                  {Math.min(
                    query.data.meta.page * query.data.meta.pageSize,
                    query.data.meta.totalItems,
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {query.data.meta.totalItems}
                </span>{" "}
                records
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={areControlsDisabled || query.data.meta.page <= 1}
                  onClick={() =>
                    updateUrl({
                      page: String(Math.max(1, query.data.meta.page - 1)),
                    })
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={
                    areControlsDisabled ||
                    query.data.meta.page >= query.data.meta.totalPages
                  }
                  onClick={() =>
                    updateUrl({
                      page: String(
                        Math.min(
                          query.data.meta.totalPages,
                          query.data.meta.page + 1,
                        ),
                      ),
                    })
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
