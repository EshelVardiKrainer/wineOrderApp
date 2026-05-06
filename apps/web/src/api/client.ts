const API_BASE = '/api';

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `HTTP ${res.status}`);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as T);
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, formData: FormData) => {
    const token = localStorage.getItem('token');
    return fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message || `HTTP ${res.status}`);
      }
      return res.json() as Promise<T>;
    });
  },
};

// ── User Management API ───────────────────────────────────

import type {
  IUser,
  IRoleRequest,
  IRoleRequestCreate,
} from '@wine-order-app/shared-types';

export const usersApi = {
  getAll: () => api.get<IUser[]>('/users'),
  updateRole: (userId: string, role: string) =>
    api.patch<IUser>(`/users/${userId}/role`, { role }),
};

export const roleRequestsApi = {
  create: (data: IRoleRequestCreate) =>
    api.post<IRoleRequest>('/role-requests', data),
  getPending: () => api.get<IRoleRequest[]>('/role-requests'),
  getPendingCount: () => api.get<{ count: number }>('/role-requests/count'),
  getMine: () => api.get<IRoleRequest[]>('/role-requests/mine'),
  review: (id: string, status: 'APPROVED' | 'DENIED') =>
    api.patch<IRoleRequest>(`/role-requests/${id}`, { status }),
};

// ── Groups API ──────────────────────────────────────────

import type { IGroupCreateRequest, IGroup } from '@wine-order-app/shared-types';

export const groupsApi = {
  requestGroup: (data: IGroupCreateRequest) => api.post<IGroup>('/groups/request', data),
  getPendingGroups: () => api.get<IGroup[]>('/groups/pending'),
  approveGroup: (id: string) => api.put<IGroup>(`/groups/${id}/approve`),
};

export const groupMembersApi = {
  getMyGroups: () => api.get<IGroup[]>('/groups/mine'),
  joinGroup: (groupId: string) => api.post<void>(`/groups/${groupId}/join`),
  inviteUser: (groupId: string, data: { email: string }) => api.post<void>(`/groups/${groupId}/invite`, data),
  approveMember: (groupId: string, userId: string) => api.put<void>(`/groups/${groupId}/members/${userId}/approve`),
  changeMemberRole: (groupId: string, userId: string, data: { role: string }) => api.put<void>(`/groups/${groupId}/members/${userId}/role`, data),
};
