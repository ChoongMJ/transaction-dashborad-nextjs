import { NextResponse } from "next/server";

import { loginUser } from "@/lib/auth-server";
import { sessionCookieName } from "@/lib/constants";

export async function POST(request: Request) {
  const result = await loginUser(await request.json());

  if (!("session" in result.body)) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const { session, userId } = result.body;
  const response = NextResponse.json({ session }, { status: result.status });

  response.cookies.set(sessionCookieName, userId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return response;
}
