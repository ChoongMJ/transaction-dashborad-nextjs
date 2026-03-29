import type { TransactionListParams } from "@/types/transaction";
import { TransactionsPageClient } from "@/app/transactions-page-client";

export const metadata = {
  title: "Transactions",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const initialParams: TransactionListParams = {
    page: Number(params.page ?? 1),
    pageSize: Number(params.pageSize ?? 10),
    search: typeof params.search === "string" ? params.search : "",
    status:
      typeof params.status === "string"
        ? (params.status as TransactionListParams["status"])
        : "all",
    sortBy: params.sortBy === "amount" ? "amount" : "createdAt",
    sortOrder: params.sortOrder === "asc" ? "asc" : "desc",
  };

  return <TransactionsPageClient initialParams={initialParams} />;
}
