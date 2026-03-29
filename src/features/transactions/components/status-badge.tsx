import { Badge } from "@/components/ui/primitives";
import { statusLabelMap } from "@/lib/constants";
import type { TransactionStatus } from "@/types/transaction";
import { getTransactionStatusBadgeVariant } from "@/features/transactions/utils/status";

export function StatusBadge({ status }: { status: TransactionStatus }) {
  return (
    <Badge variant={getTransactionStatusBadgeVariant(status)}>
      {statusLabelMap[status]}
    </Badge>
  );
}
