import { NextResponse } from "next/server";

import { addTransactionNote, wait } from "@/data/mock-backend";
import { transactionNoteSchema } from "@/lib/core";

export async function POST(
  request: Request,
  context: RouteContext<"/api/transactions/[id]/notes">,
) {
  const { id } = await context.params;
  const payload = transactionNoteSchema.safeParse(await request.json());

  await wait(250);

  if (!payload.success) {
    return NextResponse.json(
      { message: "Please enter a concise internal note." },
      { status: 400 },
    );
  }

  const transaction = addTransactionNote(id, payload.data.message);

  if (!transaction) {
    return NextResponse.json(
      { message: "Transaction not found." },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: transaction });
}
