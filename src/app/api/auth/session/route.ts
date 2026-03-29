import { NextResponse } from "next/server";

import { getSessionPayload } from "@/lib/auth-server";

export async function GET() {
  const result = await getSessionPayload();
  return NextResponse.json(result.body, { status: result.status });
}
