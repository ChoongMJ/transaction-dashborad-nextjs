import { getServerSessionUser } from "@/data/mock-backend";
import { TransactionsPageClient } from "@/features/transactions/components/transactions-page-client";

export const metadata = {
  title: "Transactions",
};

export default async function TransactionsPage() {
  const user = await getServerSessionUser();

  return <TransactionsPageClient userRole={user?.role ?? "viewer"} />;
}
