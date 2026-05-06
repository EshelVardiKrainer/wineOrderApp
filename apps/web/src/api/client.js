const API_BASE = '/api';
async function request(path, options = {}) {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
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
    if (res.status === 204)
        return undefined;
    const text = await res.text();
    return text ? JSON.parse(text) : undefined;
}
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, {
        method: 'POST',
        body: body ? JSON.stringify(body) : undefined,
    }),
    put: (path, body) => request(path, {
        method: 'PUT',
        body: body ? JSON.stringify(body) : undefined,
    }),
    patch: (path, body) => request(path, {
        method: 'PATCH',
        body: body ? JSON.stringify(body) : undefined,
    }),
    delete: (path) => request(path, { method: 'DELETE' }),
    upload: (path, formData) => {
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
            return res.json();
        });
    },
};
export const usersApi = {
    getAll: () => api.get('/users'),
    updateRole: (userId, role) => api.patch(`/users/${userId}/role`, { role }),
};
export const roleRequestsApi = {
    create: (data) => api.post('/role-requests', data),
    getPending: () => api.get('/role-requests'),
    getPendingCount: () => api.get('/role-requests/count'),
    getMine: () => api.get('/role-requests/mine'),
    review: (id, status) => api.patch(`/role-requests/${id}`, { status }),
};
export const groupsApi = {
    requestGroup: (data) => api.post('/groups/request', data),
    getPendingGroups: () => api.get('/groups/pending'),
    approveGroup: (id) => api.put(`/groups/${id}/approve`),
};
export const groupMembersApi = {
    getMyGroups: () => api.get('/groups/mine'),
    joinGroup: (groupId) => api.post(`/groups/${groupId}/join`),
    inviteUser: (groupId, data) => api.post(`/groups/${groupId}/invite`, data),
    approveMember: (groupId, userId) => api.put(`/groups/${groupId}/members/${userId}/approve`),
    changeMemberRole: (groupId, userId, data) => api.put(`/groups/${groupId}/members/${userId}/role`, data),
};
//# sourceMappingURL=client.js.map