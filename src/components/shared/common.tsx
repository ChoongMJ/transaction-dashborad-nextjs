"use client";

import Link from "next/link";
import { Inbox, RefreshCcw, Search, ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/core";
import {
  Button,
  Card,
  CardContent,
  Input,
  Skeleton,
  Table,
  TableWrapper,
} from "@/components/ui/primitives";

export function SearchInput({
  value,
  onChange,
  placeholder = "Search transactions",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
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
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <div className="rounded-full bg-secondary p-4 text-primary">
          <Inbox className="size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border-danger/20">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
        <div className="rounded-full bg-danger/10 p-4 text-danger">
          <ShieldAlert className="size-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {onRetry ? (
          <Button variant="outline" onClick={onRetry}>
            <RefreshCcw className="mr-2 size-4" />
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

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  rowHref,
}: {
  columns: Column<T>[];
  rows: T[];
  rowHref?: (row: T) => string;
}) {
  return (
    <TableWrapper>
      <Table>
        <thead className="bg-muted/40">
          <tr>
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
