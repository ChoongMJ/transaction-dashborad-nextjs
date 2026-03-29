import { NextResponse } from "next/server";

import { createSession, demoCredentials, mockUser, wait } from "@/app/mock-backend";
import { loginSchema } from "@/app/core";
import { sessionCookieName } from "@/lib/constants";

export async function POST(request: Request) {
  const payload = loginSchema.safeParse(await request.json());

  await wait(500);

  if (!payload.success) {
    return NextResponse.json(
      { message: "Please enter a valid email and password." },
      { status: 400 },
    );
  }

  const { email, password } = payload.data;

  if (email !== demoCredentials.email || password !== demoCredentials.password) {
    return NextResponse.json(
      { message: "Incorrect credentials. Try the demo account details." },
      { status: 401 },
    );
  }

  const session = createSession();
  const response = NextResponse.json({ session });

  response.cookies.set(sessionCookieName, mockUser.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(session.expiresAt),
  });

  return response;
}
