import { getServerSessionUser } from "@/data/mock-backend";
import { TransactionDetailClient } from "@/features/transactions/components/transaction-detail-client";

export const metadata = {
  title: "Transaction Detail",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getServerSessionUser();

  return (
    <TransactionDetailClient
      transactionId={id}
      userRole={user?.role ?? "viewer"}
    />
  );
}
