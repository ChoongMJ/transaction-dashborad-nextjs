import { NextResponse, type NextRequest } from "next/server";

import { getTransactionsOverview, listTransactions, wait } from "@/app/mock-backend";
import {
  transactionStatuses,
  type TransactionListParams,
} from "@/types/transaction";

function parseParams(searchParams: URLSearchParams): TransactionListParams {
  const status = searchParams.get("status");
  const sortBy = searchParams.get("sortBy");
  const sortOrder = searchParams.get("sortOrder");

  return {
    page: Number(searchParams.get("page") ?? 1),
    pageSize: Number(searchParams.get("pageSize") ?? 10),
    search: searchParams.get("search") ?? "",
    status:
      status && transactionStatuses.includes(status as (typeof transactionStatuses)[number])
        ? (status as (typeof transactionStatuses)[number])
        : "all",
    sortBy: sortBy === "amount" ? "amount" : "createdAt",
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
  };
}

export async function GET(request: NextRequest) {
  await wait(350);

  if (request.nextUrl.searchParams.get("view") === "overview") {
    return NextResponse.json(getTransactionsOverview());
  }

  return NextResponse.json(listTransactions(parseParams(request.nextUrl.searchParams)));
}
