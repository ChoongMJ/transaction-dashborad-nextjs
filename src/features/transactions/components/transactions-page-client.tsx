"use client";

import { ArrowRight, ArrowUpDown, RotateCcw } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";

import { formatCurrency, formatDateTime } from "@/lib/core";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import {
  DataTable,
  EmptyState,
  ErrorState,
  FilterBar,
  LoadingSkeleton,
  SearchInput,
} from "@/components/shared/common";
import { Button, Card, CardContent, Select } from "@/components/ui/primitives";
import { transactionStatusOptions } from "@/lib/constants";
import type { TransactionListParams, TransactionsListResponse } from "@/types/transaction";
import { StatusBadge } from "@/features/transactions/components/status-badge";

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

export function TransactionsPageClient({
  initialParams,
}: {
  initialParams: TransactionListParams;
}) {
  const [search, setSearch] = useState(initialParams.search ?? "");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(initialParams.page ?? 1);
  const [pageSize, setPageSize] = useState(initialParams.pageSize ?? 10);
  const [status, setStatus] = useState<NonNullable<TransactionListParams["status"]>>(
    initialParams.status ?? "all",
  );
  const [sortBy, setSortBy] = useState<"createdAt" | "amount">(
    initialParams.sortBy ?? "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    initialParams.sortOrder ?? "desc",
  );

  const filters = useMemo(
    () => ({
      page,
      pageSize,
      search: deferredSearch,
      status,
      sortBy,
      sortOrder,
    }),
    [deferredSearch, page, pageSize, sortBy, sortOrder, status],
  );

  const query = useTransactions(filters);

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
    setSearch("");
    setPage(1);
    setPageSize(10);
    setStatus("all");
    setSortBy("createdAt");
    setSortOrder("desc");
  }

  return (
    <div className="space-y-4">
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} />
        <Select
          value={status}
          onValueChange={(value) => {
            setPage(1);
            setStatus(value as NonNullable<TransactionListParams["status"]>);
          }}
          options={transactionStatusOptions.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
        />
        <Select
          value={sortBy}
          onValueChange={(value) => {
            setPage(1);
            setSortBy(value as "createdAt" | "amount");
          }}
          options={sortByOptions}
        />
        <div className="flex gap-2">
          <Select
            value={sortOrder}
            onValueChange={(value) => {
              setPage(1);
              setSortOrder(value as "asc" | "desc");
            }}
            options={sortOrderOptions}
            className="flex-1"
          />
          <Button variant="outline" size="icon" onClick={resetFilters}>
            <RotateCcw className="size-4" />
          </Button>
        </div>
      </FilterBar>

      {query.isLoading ? <LoadingSkeleton rows={7} /> : null}

      {query.isError ? (
        <ErrorState
          title="Transactions couldn't be loaded"
          description="The transaction feed is temporarily unavailable. Retry the request to continue."
          onRetry={() => query.refetch()}
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
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transactions</p>
                <h2 className="text-xl font-semibold tracking-tight">
                  Searchable operations ledger
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <ArrowUpDown className="size-4" />
                  Sorted by {sortBy === "amount" ? "amount" : "date"}
                </span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => {
                    setPage(1);
                    setPageSize(Number(value));
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
                  disabled={query.data.meta.page <= 1}
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={query.data.meta.page >= query.data.meta.totalPages}
                  onClick={() =>
                    setPage((current) =>
                      Math.min(query.data?.meta.totalPages ?? current, current + 1),
                    )
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
