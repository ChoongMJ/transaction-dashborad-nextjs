import { NextResponse } from "next/server";

import { createTransactionNotePayload } from "@/lib/transactions-server";

export async function POST(
  request: Request,
  context: RouteContext<"/api/transactions/[id]/notes">,
) {
  const { id } = await context.params;
  const result = await createTransactionNotePayload(id, await request.json());
  return NextResponse.json(result.body, { status: result.status });
}
