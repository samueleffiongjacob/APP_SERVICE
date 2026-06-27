import type { AppUser, ServiceRequest } from './types';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8083';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    },
    ...init
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const text = await response.text();

  return text ? JSON.parse(text) : (undefined as T);
}

export type AuthPayload = { name: string; email: string; password: string; phone?: string };
export type LoginPayload = { email: string; password: string };

export function submitRequest(payload: Omit<ServiceRequest, 'id' | 'createdAt'>) {
  return request<ServiceRequest>('/api/requests', { method: 'POST', body: JSON.stringify(payload) });
}

export function signUp(payload: AuthPayload) {
  return request<AppUser>('/api/auth/signup', { method: 'POST', body: JSON.stringify(payload) });
}

export function logIn(payload: LoginPayload) {
  return request<{ token: string; user: AppUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export function getUsers() {
  return request<AppUser[]>('/api/users');
}

export function deleteUser(id: string) {
  return request<void>(`/api/users/${id}`, { method: 'DELETE' });
}

export function getLead() {
  return request<ServiceRequest[]>(`/api/requests`)
}

export function deleteLead(id: string) {
  return request<void>(`/api/requests/${id}`, { method: 'DELETE' });
}
