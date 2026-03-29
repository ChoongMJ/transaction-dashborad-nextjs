import { NextResponse, type NextRequest } from "next/server";

import { getTransactionsPayload } from "@/lib/transactions-server";

export async function GET(request: NextRequest) {
  const result = await getTransactionsPayload(request.nextUrl.searchParams);
  return NextResponse.json(result.body, { status: result.status });
}
