import { TransactionDetailClient } from "@/app/transaction-detail-client";

export const metadata = {
  title: "Transaction Detail",
};

export default async function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TransactionDetailClient transactionId={id} />;
}
