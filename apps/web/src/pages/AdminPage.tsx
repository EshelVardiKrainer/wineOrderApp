import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import type {
  IWine,
  IWineCreate,
  IWineListResponse,
  IShippingSite,
  IShippingSiteCreate,
  IGroupOrder,
  WineColor,
} from '@wine-order-app/shared-types';

export function AdminPage() {
  const [tab, setTab] = useState<'orders' | 'wines' | 'sites'>('orders');

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Admin Panel</h1>
        <p>Manage orders, wines, and shipping sites</p>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-item ${tab === 'orders' ? 'tab-item--active' : ''}`}
          onClick={() => setTab('orders')}
        >
          All Orders
        </button>
        <button
          className={`tab-item ${tab === 'wines' ? 'tab-item--active' : ''}`}
          onClick={() => setTab('wines')}
        >
          Wines
        </button>
        <button
          className={`tab-item ${tab === 'sites' ? 'tab-item--active' : ''}`}
          onClick={() => setTab('sites')}
        >
          Shipping Sites
        </button>
      </div>

      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'wines' && <WinesAdmin />}
      {tab === 'sites' && <SitesAdmin />}
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
        <h2>All Orders</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="text-muted text-sm" style={{ fontWeight: 600 }}>Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '0.4rem 0.7rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid var(--gray-200)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
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
          <div key={sg.site.id} className="section-panel" style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--space-md)',
              paddingBottom: 'var(--space-md)',
              borderBottom: '2px solid var(--gray-100)',
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.05rem' }}>📍 {sg.site.name}</h3>
                <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
                  {sg.site.address}, {sg.site.city}
                </p>
              </div>
              <div className="stat-card" style={{ minWidth: 110, margin: 0, border: 'none', background: 'var(--wine-50)', padding: '0.5rem 1rem' }}>
                <div className="stat-value" style={{ fontSize: '1.15rem' }}>₪{sg.siteTotal.toFixed(2)}</div>
                <div className="stat-label">Site Total</div>
              </div>
            </div>

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
