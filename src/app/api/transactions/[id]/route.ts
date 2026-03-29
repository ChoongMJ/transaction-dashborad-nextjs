import { NextResponse } from "next/server";

import {
  getTransactionById,
  updateTransactionStatus,
  wait,
} from "@/app/mock-backend";
import { transactionStatusSchema } from "@/app/core";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/transactions/[id]">,
) {
  const { id } = await context.params;
  const transaction = getTransactionById(id);

  await wait(250);

  if (!transaction) {
    return NextResponse.json(
      { message: "Transaction not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: transaction });
}

export async function PATCH(
  request: Request,
  context: RouteContext<"/api/transactions/[id]">,
) {
  const { id } = await context.params;
  const payload = transactionStatusSchema.safeParse(await request.json());

  await wait(300);

  if (!payload.success) {
    return NextResponse.json(
      { message: "Please choose a valid transaction status." },
      { status: 400 },
    );
  }

  const transaction = updateTransactionStatus(id, payload.data.status);

  if (!transaction) {
    return NextResponse.json(
      { message: "Transaction not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: transaction });
}
