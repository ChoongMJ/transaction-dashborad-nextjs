import { NextResponse } from "next/server";

import {
  getTransactionByIdPayload,
  updateTransactionPayload,
} from "@/lib/transactions-server";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/transactions/[id]">,
) {
  const { id } = await context.params;
  const result = await getTransactionByIdPayload(id);
  return NextResponse.json(result.body, { status: result.status });
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/transactions/[id]">,
) {
  const { id } = await context.params;
  const result = await updateTransactionPayload(id, await request.json());
  return NextResponse.json(result.body, { status: result.status });
}
