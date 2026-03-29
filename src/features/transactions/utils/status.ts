import type { BadgeProps } from "@/components/ui/primitives";
import type { TransactionStatus } from "@/types/transaction";

export function getTransactionStatusBadgeVariant(
  status: TransactionStatus,
): NonNullable<BadgeProps["variant"]> {
  if (status === "completed") {
    return "success";
  }

  if (status === "pending") {
    return "warning";
  }

  if (status === "failed") {
    return "danger";
  }

  return "info";
}
