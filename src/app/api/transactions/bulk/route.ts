import { NextResponse } from "next/server";

import { bulkTransactionActionPayload } from "@/lib/transactions-server";

export async function PATCH(request: Request) {
  const result = await bulkTransactionActionPayload(await request.json());
  return NextResponse.json(result.body, { status: result.status });
}
