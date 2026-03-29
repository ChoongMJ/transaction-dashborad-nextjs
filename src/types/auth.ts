export type UserRole = "admin" | "viewer";

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Session = {
  token: string;
  user: User;
  expiresAt: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  session: Session;
};
