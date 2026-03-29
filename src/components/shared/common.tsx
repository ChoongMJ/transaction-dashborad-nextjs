"use client";

import Link from "next/link";
import { Inbox, RefreshCcw, Search, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/core";
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Skeleton,
  Table,
  TableWrapper,
} from "@/components/ui/primitives";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search transactions",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="pl-9"
      />
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <Card className="border-dashed border-border/80 bg-gradient-to-b from-card to-muted/20">
      <CardContent className="flex flex-col items-center justify-center gap-5 py-16 text-center sm:py-20">
        <div className="rounded-full border border-border/70 bg-secondary/80 p-4 text-primary shadow-sm">
          <Inbox className="size-6" />
        </div>
        <div className="space-y-2.5">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {action ? <div className="pt-1">{action}</div> : null}
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
  isRetrying = false,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}) {
  return (
    <Card className="border-danger/20 bg-gradient-to-b from-card to-danger/5">
      <CardContent className="flex flex-col items-center justify-center gap-5 py-16 text-center sm:py-20">
        <div className="rounded-full border border-danger/15 bg-danger/10 p-4 text-danger shadow-sm">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-2.5">
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="max-w-md text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>
        {onRetry ? (
          <Button
            variant="outline"
            onClick={onRetry}
            loading={isRetrying}
            disabled={isRetrying}
          >
            {!isRetrying ? <RefreshCcw className="mr-2 size-4" /> : null}
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function LoadingSkeleton({
  rows = 5,
  hasCards = false,
}: {
  rows?: number;
  hasCards?: boolean;
}) {
  return (
    <div className="space-y-4">
      {hasCards ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-36" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
      <Card>
        <CardContent className="space-y-3">
          {Array.from({ length: rows }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export function TableSkeleton({
  rows = 6,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-64" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-28" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>

        <TableWrapper className="border-border/70">
          <Table>
            <thead className="bg-muted/40">
              <tr>
                {Array.from({ length: columns }).map((_, index) => (
                  <th key={index} className="px-4 py-3">
                    <Skeleton className="h-3 w-20" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-t border-border/70">
                  {Array.from({ length: columns }).map((_, columnIndex) => (
                    <td key={columnIndex} className="px-4 py-3 align-middle">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full max-w-[12rem]" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </TableWrapper>

        <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 md:flex-row md:items-center md:justify-between">
          <Skeleton className="h-4 w-44" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FilterBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-3 rounded-[1.25rem] border border-border/70 bg-card p-4 shadow-sm md:grid-cols-4",
        className,
      )}
    >
      {children}
    </div>
  );
}

type Column<T> = {
  key: string;
  header: string;
  className?: string;
  cell: (row: T) => ReactNode;
};

type TableSelection<T> = {
  selectedIds: string[];
  onToggleRow: (row: T) => void;
  onToggleAll: (rows: T[]) => void;
  disabled?: boolean;
  getRowLabel?: (row: T) => string;
};

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  rowHref,
  className,
  selection,
}: {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
  className?: string;
  selection?: TableSelection<T>;
}) {
  const selectedIds = selection?.selectedIds ?? [];
  const selectedRowCount = rows.filter((row) => selectedIds.includes(row.id)).length;
  const isAllSelected = rows.length > 0 && selectedRowCount === rows.length;
  const isIndeterminate = selectedRowCount > 0 && !isAllSelected;

  return (
    <TableWrapper className={cn("transition-opacity duration-200", className)}>
      <Table>
        <thead className="bg-muted/40">
          <tr>
            {selection ? (
              <th className="w-14 px-4 py-3 text-left">
                <Checkbox
                  aria-label="Select all visible transactions"
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  disabled={selection.disabled || rows.length === 0}
                  onChange={() => selection.onToggleAll(rows)}
                />
              </th>
            ) : null}
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) =>
            rowHref ? (
              <tr
                key={row.id}
                className="border-t border-border/70 transition hover:bg-muted/30"
              >
                {selection ? (
                  <td className="px-4 py-3 align-middle">
                    <Checkbox
                      aria-label={
                        selection.getRowLabel?.(row) ?? `Select transaction ${row.id}`
                      }
                      checked={selectedIds.includes(row.id)}
                      disabled={selection.disabled}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => selection.onToggleRow(row)}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                    <Link href={rowHref(row)} className="block">
                      {column.cell(row)}
                    </Link>
                  </td>
                ))}
              </tr>
            ) : (
              <tr key={row.id} className="border-t border-border/70">
                {selection ? (
                  <td className="px-4 py-3 align-middle">
                    <Checkbox
                      aria-label={
                        selection.getRowLabel?.(row) ?? `Select transaction ${row.id}`
                      }
                      checked={selectedIds.includes(row.id)}
                      disabled={selection.disabled}
                      onChange={() => selection.onToggleRow(row)}
                    />
                  </td>
                ) : null}
                {columns.map((column) => (
                  <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ),
          )}
        </tbody>
      </Table>
    </TableWrapper>
  );
}
