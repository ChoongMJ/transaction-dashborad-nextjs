import { NextResponse } from "next/server";

import { createSession, getServerSessionUser } from "@/data/mock-backend";

export async function GET() {
  const user = await getServerSessionUser();

  if (!user) {
    return NextResponse.json({ session: null });
  }

  return NextResponse.json({
    session: {
      ...createSession(),
      user,
      token: "server-session",
    },
  });
}
