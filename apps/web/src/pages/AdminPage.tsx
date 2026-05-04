import { useEffect, useState, useMemo } from 'react';
import { api, usersApi, roleRequestsApi } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type {
  IWine,
  IWineCreate,
  IWineListResponse,
  IShippingSite,
  IShippingSiteCreate,
  IGroupOrder,
  WineColor,
  IUser,
  IRoleRequest,
  UserRole,
} from '@wine-order-app/shared-types';

export function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const [tab, setTab] = useState<'orders' | 'wines' | 'sites' | 'users'>('orders');

  const TABS = [
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'wines',  label: 'Wines',  icon: '🍷' },
    { id: 'sites',  label: 'Shipping Sites', icon: '🚚' },
    ...(isSuperAdmin ? [{ id: 'users', label: 'Users', icon: '👥' }] : []),
  ] as const;

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Admin Panel</h1>
          <p>Manage your wine market operations{isSuperAdmin ? ' and users' : ''}</p>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 16px',
          background: isSuperAdmin ? 'var(--wine-50)' : 'var(--info-50)',
          border: `1px solid ${isSuperAdmin ? 'var(--wine-100)' : 'rgba(59,130,246,0.2)'}`,
          borderRadius: 'var(--radius-full)',
          fontSize: '0.8rem',
          fontWeight: 700,
          color: isSuperAdmin ? 'var(--wine-700)' : 'var(--info-700)',
        }}>
          {isSuperAdmin ? '⚡ Super Admin' : '🔑 Admin'}
        </div>
      </div>

      <div className="tab-bar" style={{ marginBottom: 'var(--space-xl)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-item ${tab === t.id ? 'tab-item--active' : ''}`}
            onClick={() => setTab(t.id as typeof tab)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'wines' && <WinesAdmin />}
      {tab === 'sites' && <SitesAdmin />}
      {tab === 'users' && isSuperAdmin && <UsersAdmin />}
    </div>
  );
}

// ─── Orders Admin ──────────────────────────────────────────────────

function OrdersAdmin() {
  const [groupOrders, setGroupOrders] = useState<IGroupOrder[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<IGroupOrder[]>('/group-orders').then((orders) => {
      setGroupOrders(orders);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return groupOrders;
    return groupOrders.filter((go) => go.status === statusFilter);
  }, [groupOrders, statusFilter]);

  const siteGroups = useMemo(() => {
    const map = new Map<
      string,
      { site: IGroupOrder['shippingSite']; orders: IGroupOrder[]; siteTotal: number }
    >();

    for (const go of filtered) {
      const siteId = go.shippingSiteId;
      if (!map.has(siteId)) {
        map.set(siteId, { site: go.shippingSite, orders: [], siteTotal: 0 });
      }
      const group = map.get(siteId)!;
      group.orders.push(go);

      for (const p of go.participants) {
        for (const item of p.orderItems) {
          group.siteTotal += item.quantity * item.unitPrice;
        }
      }
    }

    return Array.from(map.values());
  }, [filtered]);

  if (loading) return <div className="spinner" />;

  return (
    <>
      <div className="section-header">
        <h2 style={{ fontFamily: 'var(--font-display)' }}>All Orders</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="text-muted text-sm" style={{ fontWeight: 600 }}>Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--gray-200)',
              fontSize: '0.875rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              background: 'white',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="submitted">Submitted</option>
            <option value="shipped">Shipped</option>
          </select>
        </div>
      </div>

      {siteGroups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📦</span>
          <h3>No orders found</h3>
          <p>Try adjusting your status filter.</p>
        </div>
      ) : (
        siteGroups.map((sg) => (
          <div key={sg.site.id} className="section-panel" style={{ marginBottom: 'var(--space-lg)', padding: 0, overflow: 'hidden' }}>
            <div style={{
              background: 'linear-gradient(135deg, var(--gray-800) 0%, var(--gray-900) 100%)',
              padding: 'var(--space-md) var(--space-xl)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--space-md)',
            }}>
              <div style={{ color: 'white' }}>
                <h3 style={{ margin: 0, fontSize: '1.05rem', color: 'white', fontFamily: 'var(--font-display)' }}>
                  📍 {sg.site.name}
                </h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>
                  {sg.site.address}, {sg.site.city}
                </p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-lg)', textAlign: 'center' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-300)', fontFamily: 'var(--font-display)' }}>₪{sg.siteTotal.toFixed(2)}</div>
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Site Total</div>
              </div>
            </div>
            <div style={{ padding: 'var(--space-lg) var(--space-xl)' }}>

              {sg.orders.map((go) => {
              const goTotal = go.participants.reduce(
                (sum, p) =>
                  sum + p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
                0,
              );

              return (
                <div
                  key={go.id}
                  style={{
                    marginBottom: 'var(--space-md)',
                    padding: 'var(--space-md)',
                    background: 'var(--gray-50)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--gray-100)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                    <div>
                      <strong style={{ color: 'var(--gray-900)' }}>Order #{go.id.slice(0, 8)}</strong>{' '}
                      <span className={`badge badge--${go.status}`}>{go.status}</span>
                      <p className="text-muted text-xs" style={{ margin: '2px 0 0' }}>
                        {new Date(go.createdAt).toLocaleDateString()} · {go.participants.length} participant(s) · ₪{goTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {go.participants.length === 0 ? (
                    <p className="text-muted text-sm">No participants yet.</p>
                  ) : (
                    go.participants.map((p) => {
                      const pTotal = p.orderItems.reduce(
                        (s, i) => s + i.quantity * i.unitPrice,
                        0,
                      );
                      return (
                        <div
                          key={p.id}
                          style={{
                            marginBottom: 'var(--space-sm)',
                            padding: 'var(--space-sm) var(--space-md)',
                            background: 'white',
                            border: '1px solid var(--gray-200)',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: 'var(--gray-900)' }}>{p.user.name}</strong>{' '}
                              <span className="text-muted text-sm">{p.user.email}</span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--wine-700)' }}>
                              ₪{pTotal.toFixed(2)}
                            </span>
                          </div>
                          {p.orderItems.length > 0 && (
                            <table style={{ marginTop: 'var(--space-sm)', fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Wine</th>
                                  <th>Qty</th>
                                  <th>Unit Price</th>
                                  <th>Subtotal</th>
                                </tr>
                              </thead>
                              <tbody>
                                {p.orderItems.map((item) => (
                                  <tr key={item.id}>
                                    <td style={{ fontWeight: 500 }}>{item.wine.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>₪{item.unitPrice.toFixed(2)}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--wine-700)' }}>
                                      ₪{(item.quantity * item.unitPrice).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
            </div>
          </div>
        ))
      )}
    </>
  );
}

// ─── Wines Admin ───────────────────────────────────────────────────

function WinesAdmin() {
  const [wines, setWines] = useState<IWine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<IWineCreate>({
    name: '',
    color: 'red',
    description: '',
    price: 0,
    region: '',
    vintage: 2024,
    stock: 0,
  });
  const [error, setError] = useState('');

  const fetchWines = async () => {
    const res = await api.get<IWineListResponse>('/wines?limit=100');
    setWines(res.items);
  };

  useEffect(() => {
    fetchWines();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post<IWine>('/wines', form);
      setForm({ name: '', color: 'red', description: '', price: 0, region: '', vintage: 2024, stock: 0 });
      setShowForm(false);
      fetchWines();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wine?')) return;
    await api.delete(`/wines/${id}`);
    fetchWines();
  };

  return (
    <>
      <div className="section-header">
        <h2>Wines ({wines.length})</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Wine'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="section-panel"
          style={{ marginBottom: 'var(--space-lg)', background: 'var(--gray-50)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Region</label>
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Color</label>
              <select value={form.color || 'red'} onChange={(e) => setForm({ ...form, color: e.target.value as WineColor })}>
                <option value="red">🌹 Red</option>
                <option value="rose">🦩 Rosé</option>
                <option value="white">⚪️ White</option>
                <option value="orange">🐅 Orange</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Price (₪)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Vintage</label>
              <input type="number" value={form.vintage} onChange={(e) => setForm({ ...form, vintage: Number(e.target.value) })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="A brief description of the wine..." />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn btn--success" type="submit">Create Wine</button>
          </div>
        </form>
      )}

      <div className="section-panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Color</th>
              <th>Region</th>
              <th>Vintage</th>
              <th>Price</th>
              <th>Stock</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {wines.map((w) => (
              <tr key={w.id}>
                <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{w.name}</td>
                <td>{w.color === 'red' ? '🌹' : w.color === 'rose' ? '🦩' : w.color === 'white' ? '⚪️' : '🐅'}</td>
                <td className="text-muted">{w.region}</td>
                <td>{w.vintage}</td>
                <td style={{ fontWeight: 600, color: 'var(--wine-700)' }}>₪{w.price.toFixed(2)}</td>
                <td>{w.stock}</td>
                <td>
                  <button className="btn btn--danger btn--small" onClick={() => handleDelete(w.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Shipping Sites Admin ──────────────────────────────────────────

function SitesAdmin() {
  const [sites, setSites] = useState<IShippingSite[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<IShippingSiteCreate>({
    name: '',
    address: '',
    city: '',
  });
  const [error, setError] = useState('');

  const fetchSites = async () => {
    const res = await api.get<IShippingSite[]>('/shipping-sites/all');
    setSites(res);
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post<IShippingSite>('/shipping-sites', form);
      setForm({ name: '', address: '', city: '' });
      setShowForm(false);
      fetchSites();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (site: IShippingSite) => {
    await api.patch(`/shipping-sites/${site.id}`, {
      isActive: !site.isActive,
    });
    fetchSites();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shipping site?')) return;
    await api.delete(`/shipping-sites/${id}`);
    fetchSites();
  };

  return (
    <>
      <div className="section-header">
        <h2>Shipping Sites ({sites.length})</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Site'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="section-panel"
          style={{ marginBottom: 'var(--space-lg)', background: 'var(--gray-50)' }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>Address</label>
              <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label>City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-lg)' }}>
            <button className="btn btn--success" type="submit">Create Site</button>
          </div>
        </form>
      )}

      <div className="section-panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>City</th>
              <th>Status</th>
              <th style={{ width: 80 }}></th>
            </tr>
          </thead>
          <tbody>
            {sites.map((s) => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{s.name}</td>
                <td className="text-muted">{s.address}</td>
                <td>{s.city}</td>
                <td>
                  <button
                    className={`btn btn--small ${s.isActive ? 'btn--success' : 'btn--secondary'}`}
                    onClick={() => handleToggle(s)}
                  >
                    {s.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <button className="btn btn--danger btn--small" onClick={() => handleDelete(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Users & Role Requests Admin (SUPER_ADMIN) ────────────

function UsersAdmin() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [pendingRequests, setPendingRequests] = useState<IRoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [usersData, requestsData] = await Promise.all([
        usersApi.getAll(),
        roleRequestsApi.getPending(),
      ]);
      setUsers(usersData);
      setPendingRequests(requestsData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    try {
      await usersApi.updateRole(userId, newRole);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReview = async (requestId: string, status: 'APPROVED' | 'DENIED') => {
    setActionLoading(requestId);
    try {
      await roleRequestsApi.review(requestId, status);
      await fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to review request');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="spinner" />;

  const roleColorMap: Record<string, string> = {
    SUPER_ADMIN: 'var(--wine-700)',
    ADMIN: 'var(--info-700)',
    RETAIL: 'var(--success-700)',
    CUSTOMER: 'var(--gray-500)',
  };
  const roleBgMap: Record<string, string> = {
    SUPER_ADMIN: 'var(--wine-50)',
    ADMIN: 'var(--info-50)',
    RETAIL: 'var(--success-50)',
    CUSTOMER: 'var(--gray-100)',
  };

  return (
    <>
      {/* ── Pending Role Requests ─── */}
      {pendingRequests.length > 0 && (
        <>
          <div className="section-header">
            <h2>Pending Role Requests ({pendingRequests.length})</h2>
          </div>
          <div className="section-panel" style={{ marginBottom: 'var(--space-xl)' }}>
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Requested Role</th>
                  <th>Reason</th>
                  <th>Date</th>
                  <th style={{ width: 180 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((req) => (
                  <tr key={req.id}>
                    <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{req.user.name}</td>
                    <td className="text-muted">{req.user.email}</td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: roleBgMap[req.user.role] || 'var(--gray-100)',
                        color: roleColorMap[req.user.role] || 'var(--gray-600)',
                      }}>{req.user.role}</span>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: roleBgMap[req.requestedRole] || 'var(--gray-100)',
                        color: roleColorMap[req.requestedRole] || 'var(--gray-600)',
                      }}>{req.requestedRole}</span>
                    </td>
                    <td className="text-muted text-sm" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {req.reason || '—'}
                    </td>
                    <td className="text-muted text-sm">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="btn btn--success btn--small"
                          disabled={actionLoading === req.id}
                          onClick={() => handleReview(req.id, 'APPROVED')}
                        >
                          Approve
                        </button>
                        <button
                          className="btn btn--danger btn--small"
                          disabled={actionLoading === req.id}
                          onClick={() => handleReview(req.id, 'DENIED')}
                        >
                          Deny
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── All Users ─── */}
      <div className="section-header">
        <h2>All Users ({users.length})</h2>
        <input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '0.5rem 0.85rem',
            border: '1.5px solid var(--gray-200)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            width: 250,
          }}
        />
      </div>
      <div className="section-panel">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Change Role</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: 'var(--gray-900)' }}>{u.name}</td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: '999px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    background: roleBgMap[u.role] || 'var(--gray-100)',
                    color: roleColorMap[u.role] || 'var(--gray-600)',
                  }}>{u.role}</span>
                </td>
                <td>
                  {u.role === 'SUPER_ADMIN' ? (
                    <span className="text-muted text-sm">—</span>
                  ) : (
                    <select
                      value={u.role}
                      disabled={actionLoading === u.id}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      style={{
                        padding: '0.35rem 0.7rem',
                        borderRadius: '6px',
                        border: '1.5px solid var(--gray-200)',
                        fontSize: '0.8rem',
                        fontFamily: 'var(--font-sans)',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <option value="CUSTOMER">CUSTOMER</option>
                      <option value="RETAIL">RETAIL</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  )}
                </td>
                <td className="text-muted text-sm">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}