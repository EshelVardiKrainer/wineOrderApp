import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type {
  IWine,
  IWineCreate,
  IWineListResponse,
  IShippingSite,
  IShippingSiteCreate,
} from '@wine-order-app/shared-types';

export function AdminPage() {
  const [tab, setTab] = useState<'wines' | 'sites'>('wines');

  return (
    <>
      <h1>⚙️ Admin Panel</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
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

      {tab === 'wines' && <WinesAdmin />}
      {tab === 'sites' && <SitesAdmin />}
    </>
  );
}

function WinesAdmin() {
  const [wines, setWines] = useState<IWine[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<IWineCreate>({
    name: '',
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
      setForm({ name: '', description: '', price: 0, region: '', vintage: 2024, stock: 0 });
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
              <label>Price ($)</label>
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
              <td>{w.region}</td>
              <td>{w.vintage}</td>
              <td>${w.price.toFixed(2)}</td>
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
