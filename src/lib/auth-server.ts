import {
  createSession,
  demoAccounts,
  getServerSessionUser,
  wait,
} from "@/data/mock-backend";
import { loginSchema } from "@/lib/core";

type ServerResult<T> = {
  status: number;
  body: T;
};

export async function getAdminAccessPayload(): Promise<
  ServerResult<{ message: string }> | null
> {
  const user = await getServerSessionUser();

  if (!user) {
    return {
      status: 401,
      body: { message: "Sign in to continue." },
    };
  }

  if (user.role !== "admin") {
    return {
      status: 403,
      body: { message: "Viewer accounts have read-only access." },
    };
  }

  return null;
}

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

  const matchedAccount = demoAccounts.find(
    (account) => account.email === email && account.password === password,
  );

  if (!matchedAccount) {
    return {
      status: 401,
      body: { message: "Incorrect credentials. Try one of the demo account details." },
    };
  }

  return {
    status: 200,
    body: {
      session: createSession(matchedAccount.user),
      userId: matchedAccount.user.id,
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
          ...createSession(user),
          token: "server-session",
        },
      },
    };
}
