"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Clock3, NotebookPen, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import {
  formatCurrency,
  formatDateTime,
  transactionNoteSchema,
  transactionStatusSchema,
} from "@/lib/core";
import {
  useAddTransactionNote,
  useTransaction,
  useUpdateTransaction,
} from "@/features/transactions/hooks/use-transactions";
import { ErrorState, LoadingSkeleton } from "@/components/shared/common";
import {
  Button,
  Card,
  CardContent,
  Label,
  Select,
  Textarea,
} from "@/components/ui/primitives";
import { transactionStatusOptions } from "@/lib/constants";
import { StatusBadge } from "@/features/transactions/components/status-badge";
import type { UserRole } from "@/types/auth";

type NoteFormValues = z.infer<typeof transactionNoteSchema>;

export function TransactionDetailClient({
  transactionId,
  userRole,
}: {
  transactionId: string;
  userRole: UserRole;
}) {
  const transactionQuery = useTransaction(transactionId);
  const statusMutation = useUpdateTransaction(transactionId);
  const noteMutation = useAddTransactionNote(transactionId);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const isViewer = userRole === "viewer";

  const noteForm = useForm<NoteFormValues>({
    resolver: zodResolver(transactionNoteSchema),
    defaultValues: {
      message: "",
    },
  });

  if (transactionQuery.isLoading) {
    return <LoadingSkeleton rows={6} />;
  }

  if (transactionQuery.isError || !transactionQuery.data) {
    return (
      <ErrorState
        title="Transaction details couldn't be loaded"
        description="The record may have been removed or the backend is temporarily unavailable."
        onRetry={() => transactionQuery.refetch()}
        isRetrying={transactionQuery.isFetching}
      />
    );
  }

  const transaction = transactionQuery.data;

  const submitStatus = async () => {
    const payload = transactionStatusSchema.parse({
      status: selectedStatus ?? transaction.status,
    });

    await statusMutation.mutateAsync(payload);
    setSelectedStatus(null);
  };

  const submitNote = noteForm.handleSubmit(async (values) => {
    await noteMutation.mutateAsync(values);
    noteForm.reset();
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href="/dashboard/transactions"
            className="mb-2 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to transactions
          </Link>
          <h2 className="text-2xl font-semibold tracking-tight">{transaction.id}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Created {formatDateTime(transaction.createdAt)}
          </p>
        </div>
        <StatusBadge status={transaction.status} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <h3 className="mt-2 text-lg font-semibold">{transaction.customerName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{transaction.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment details</p>
                <p className="mt-2 text-lg font-semibold">
                  {formatCurrency(transaction.amount, transaction.currency)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {transaction.paymentMethod}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created at</p>
                <p className="mt-2 font-medium">{formatDateTime(transaction.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Updated at</p>
                <p className="mt-2 font-medium">{formatDateTime(transaction.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl bg-secondary p-2 text-primary">
                  <Clock3 className="size-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status history</p>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Timeline of operational changes
                  </h3>
                </div>
              </div>
              <div className="space-y-4">
                {transaction.statusHistory.map((entry) => (
                  <div key={entry.id} className="flex gap-4">
                    <div className="mt-1 h-3 w-3 rounded-full bg-primary" />
                    <div className="flex-1 rounded-2xl border border-border/70 bg-muted/20 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={entry.status} />
                        <p className="text-sm text-muted-foreground">
                          by {entry.changedBy}
                        </p>
                      </div>
                      {entry.reason ? (
                        <p className="mt-2 text-sm text-foreground/80">{entry.reason}</p>
                      ) : null}
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDateTime(entry.changedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Transaction actions</p>
                <h3 className="text-xl font-semibold tracking-tight">
                  Update status or document context
                </h3>
              </div>
              {isViewer ? (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="text-sm font-medium text-foreground">Read-only access</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Viewer accounts can inspect notes, payment history, and status
                    changes, but only admins can update transactions.
                  </p>
                </div>
              ) : (
                <>
                  <form
                    className="space-y-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void submitStatus();
                    }}
                  >
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={selectedStatus ?? transaction.status}
                        onValueChange={setSelectedStatus}
                        disabled={statusMutation.isPending}
                        options={transactionStatusOptions
                          .filter((option) => option.value !== "all")
                          .map((option) => ({
                            label: option.label,
                            value: option.value,
                          }))}
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      loading={statusMutation.isPending}
                    >
                      {!statusMutation.isPending ? (
                        <RefreshCw className="mr-2 size-4" />
                      ) : null}
                      Save status update
                    </Button>
                  </form>

                  <form className="space-y-3" onSubmit={submitNote}>
                    <div className="space-y-2">
                      <Label htmlFor="note">Internal note</Label>
                      <Textarea
                        id="note"
                        placeholder="Add context for finance, support, or risk teammates."
                        disabled={noteMutation.isPending}
                        {...noteForm.register("message")}
                      />
                    </div>
                    {noteForm.formState.errors.message ? (
                      <p className="text-sm text-danger">
                        {noteForm.formState.errors.message.message}
                      </p>
                    ) : null}
                    <Button
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      loading={noteMutation.isPending}
                    >
                      {!noteMutation.isPending ? (
                        <NotebookPen className="mr-2 size-4" />
                      ) : null}
                      Add internal note
                    </Button>
                  </form>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-muted-foreground">Notes</p>
                <h3 className="text-xl font-semibold tracking-tight">
                  Internal collaboration log
                </h3>
              </div>
              <div className="space-y-3">
                {transaction.notes.length > 0 ? (
                  transaction.notes.map((note) => (
                    <div
                      key={note.id}
                      className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                    >
                      <p className="text-sm leading-6">{note.message}</p>
                      <p className="mt-3 text-xs text-muted-foreground">
                        {note.author} - {formatDateTime(note.createdAt)}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">
                    No internal notes yet. Use the panel above to add operational context.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
