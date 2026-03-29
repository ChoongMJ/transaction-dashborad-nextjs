import {
  createSession,
  demoCredentials,
  getServerSessionUser,
  mockUser,
  wait,
} from "@/data/mock-backend";
import { loginSchema } from "@/lib/core";

type ServerResult<T> = {
  status: number;
  body: T;
};

export async function loginUser(
  payload: unknown,
): Promise<
  ServerResult<
    | { session: ReturnType<typeof createSession>; userId: string }
    | { message: string }
  >
> {
  const parsedPayload = loginSchema.safeParse(payload);

  await wait(500);

  if (!parsedPayload.success) {
    return {
      status: 400,
      body: { message: "Please enter a valid email and password." },
    };
  }

  const { email, password } = parsedPayload.data;

  if (email !== demoCredentials.email || password !== demoCredentials.password) {
    return {
      status: 401,
      body: { message: "Incorrect credentials. Try the demo account details." },
    };
  }

  return {
    status: 200,
    body: {
      session: createSession(),
      userId: mockUser.id,
    },
  };
}

export async function getSessionPayload(): Promise<
  ServerResult<{ session: ReturnType<typeof createSession> | null }>
> {
  const user = await getServerSessionUser();

  if (!user) {
    return {
      status: 200,
      body: { session: null },
    };
  }

  return {
    status: 200,
    body: {
      session: {
        ...createSession(),
        user,
        token: "server-session",
      },
    },
  };
}
