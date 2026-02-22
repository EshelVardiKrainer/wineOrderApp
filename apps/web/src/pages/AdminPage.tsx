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
    <>
      <h1>⚙️ Admin Panel</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          className={`btn ${tab === 'orders' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setTab('orders')}
        >
          All Orders
        </button>
        <button
          className={`btn ${tab === 'wines' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setTab('wines')}
        >
          Manage Wines
        </button>
        <button
          className={`btn ${tab === 'sites' ? 'btn--primary' : 'btn--secondary'}`}
          onClick={() => setTab('sites')}
        >
          Manage Shipping Sites
        </button>
      </div>

      {tab === 'orders' && <OrdersAdmin />}
      {tab === 'wines' && <WinesAdmin />}
      {tab === 'sites' && <SitesAdmin />}
    </>
  );
}

// ─── Orders Admin — View all orders grouped by site ────────────────

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

  // Group by shipping site
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

      // Sum all participants' order items for this group order
      for (const p of go.participants) {
        for (const item of p.orderItems) {
          group.siteTotal += item.quantity * item.unitPrice;
        }
      }
    }

    return Array.from(map.values());
  }, [filtered]);

  if (loading) return <p>Loading orders...</p>;

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>All Orders</h2>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '0.35rem 0.5rem', borderRadius: 6, border: '1px solid #ddd' }}
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
        <p style={{ color: '#888' }}>No orders found.</p>
      ) : (
        siteGroups.map((sg) => (
          <div
            key={sg.site.id}
            style={{
              marginBottom: '2rem',
              padding: '1.5rem',
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 12,
            }}
          >
            {/* Site header with total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem',
                paddingBottom: '0.75rem',
                borderBottom: '2px solid #f0f0f0',
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>📍 {sg.site.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#888', margin: '4px 0' }}>
                  {sg.site.address}, {sg.site.city}
                </p>
              </div>
              <div
                style={{
                  background: 'var(--wine-light, #f5e6e8)',
                  padding: '0.5rem 1rem',
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.75rem', color: '#888' }}>Site Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--wine-red, #722f37)' }}>
                  ₪{sg.siteTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Each group order for this site */}
            {sg.orders.map((go) => {
              const goTotal = go.participants.reduce(
                (sum, p) =>
                  sum +
                  p.orderItems.reduce(
                    (s, i) => s + i.quantity * i.unitPrice,
                    0,
                  ),
                0,
              );

              return (
                <div
                  key={go.id}
                  style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <div>
                      <strong>Group Order #{go.id.slice(0, 8)}</strong>{' '}
                      <span className={`badge badge--${go.status}`}>{go.status}</span>
                      <p style={{ fontSize: '0.8rem', color: '#888', margin: '2px 0' }}>
                        Created: {new Date(go.createdAt).toLocaleDateString()} · {go.participants.length} participant(s) · ₪{goTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Each participant's order */}
                  {go.participants.length === 0 ? (
                    <p style={{ color: '#aaa', fontSize: '0.85rem' }}>No participants yet.</p>
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
                            marginBottom: '0.75rem',
                            padding: '0.75rem',
                            background: 'white',
                            border: '1px solid #eee',
                            borderRadius: 6,
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong>{p.user.name}</strong>{' '}
                              <span style={{ color: '#888', fontSize: '0.85rem' }}>({p.user.email})</span>
                            </div>
                            <span style={{ fontWeight: 700, color: 'var(--wine-red, #722f37)' }}>
                              ₪{pTotal.toFixed(2)}
                            </span>
                          </div>
                          {p.orderItems.length > 0 && (
                            <table style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
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
                                    <td>{item.wine.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>₪{item.unitPrice.toFixed(2)}</td>
                                    <td>₪{(item.quantity * item.unitPrice).toFixed(2)}</td>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Wines ({wines.length})</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Wine'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Region</label>
              <input value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Color</label>
              <select value={form.color || 'red'} onChange={(e) => setForm({ ...form, color: e.target.value as WineColor })}>
                <option value="red">🌹 Red</option>
                <option value="rose">🦩 Rosé</option>
                <option value="white">⚪️ White</option>
                <option value="orange">🐅 Orange</option>
              </select>
            </div>
            <div className="form-group">
              <label>Price (₪)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Vintage</label>
              <input type="number" value={form.vintage} onChange={(e) => setForm({ ...form, vintage: Number(e.target.value) })} required />
            </div>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button className="btn btn--success" type="submit">Create Wine</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Color</th>
            <th>Region</th>
            <th>Vintage</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {wines.map((w) => (
            <tr key={w.id}>
              <td>{w.name}</td>
              <td>{w.color === 'red' ? '🌹' : w.color === 'rose' ? '🦩' : w.color === 'white' ? '⚪️' : '🐅'}</td>
              <td>{w.region}</td>
              <td>{w.vintage}</td>
              <td>₪{w.price.toFixed(2)}</td>
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
    </>
  );
}

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Shipping Sites ({sites.length})</h2>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Site'}
        </button>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f9f9f9', borderRadius: 12 }}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>City</label>
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <button className="btn btn--success" type="submit">Create Site</button>
        </form>
      )}

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Address</th>
            <th>City</th>
            <th>Active</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.address}</td>
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
    </>
  );
}
