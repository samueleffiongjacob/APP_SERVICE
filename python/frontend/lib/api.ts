import type { AppUser, ServiceRequest } from './types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

// ── Token helpers ────────────────────
const TOKEN_KEY = 'auth_token';

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

function authHeader(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Base request ──────────────
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Request failed: ${response.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message ?? errorMessage;
    } catch {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}

// ── Types ───────────────────
export type AuthPayload = { name: string; email: string; password: string; phone?: string };
export type LoginPayload = { email: string; password: string };
export type LoginResponse = { token: string; user: AppUser };

// ── Auth ────────────────────

export function signUp(payload: AuthPayload) {
  return request<AppUser>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function logIn(payload: LoginPayload): Promise<LoginResponse> {
  // Django returns: { success, message, data: { token, user, ... } }
  const res = await request<{ success: boolean; data: LoginResponse }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  const { token, user } = res.data;

  // Persist token for all subsequent requests
  saveToken(token);

  return { token, user };
}

export function logOut(): void {
  clearToken();
}

// ── Users ─────────────────────

export function getUsers() {
  return request<{ success: boolean; data: AppUser[] }>('/api/users', {
    headers: authHeader(),
  }).then((res) => res.data);
}

export function deleteUser(id: string) {
  return request<void>(`/api/users/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}

// ── Leads / Requests ─────────────────

export function submitRequest(payload: Omit<ServiceRequest, 'id' | 'createdAt'>) {
  // Public endpoint — no auth header needed
  return request<{ success: boolean; data: ServiceRequest }>('/api/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).then((res) => res.data);
}

export function getLead() {
  return request<{ success: boolean; data: ServiceRequest[] }>('/api/requests', {
    headers: authHeader(),
  }).then((res) => res.data);
}

export function deleteLead(id: string) {
  return request<void>(`/api/requests/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
}
