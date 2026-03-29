import type { LoginPayload, LoginResponse, Session } from "@/types/auth";
import { apiRequest } from "@/services/api/client";

export function login(payload: LoginPayload) {
  return apiRequest<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: payload,
  });
}

export function logout() {
  return apiRequest<{ success: true }>("/api/auth/logout", {
    method: "POST",
  });
}

export function getSession() {
  return apiRequest<{ session: Session | null }>("/api/auth/session");
}
