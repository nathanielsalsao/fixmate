const API_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000/api";

export interface AuthUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: "customer" | "provider" | "admin";
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const result = await response.json();

  if (!response.ok || result.success === false) {
    throw new Error(result.message || "Request failed");
  }

  return result as T;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
