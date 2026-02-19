import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type {
  IGroupOrder,
  IGroupOrderCreate,
  IShippingSite,
} from '@wine-order-app/shared-types';

export function GroupOrdersPage() {
  const [groupOrders, setGroupOrders] = useState<IGroupOrder[]>([]);
  const [sites, setSites] = useState<IShippingSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [error, setError] = useState('');
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const fetchOrders = async () => {
    const orders = await api.get<IGroupOrder[]>('/group-orders');
    setGroupOrders(orders);
  };

  useEffect(() => {
    fetchOrders();
    if (isAdmin) {
      api.get<IShippingSite[]>('/shipping-sites').then(setSites);
    }
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!selectedSiteId) return;
    setError('');
    try {
      await api.post<IGroupOrder>('/group-orders', {
        shippingSiteId: selectedSiteId,
      } satisfies IGroupOrderCreate);
      setSelectedSiteId('');
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (
    id: string,
    action: 'close' | 'submit' | 'ship',
  ) => {
    try {
      await api.patch<IGroupOrder>(`/group-orders/${id}/${action}`);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <>
      <h1>📦 Group Orders</h1>

      {error && <div className="error-msg">{error}</div>}

      {isAdmin && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: '#f9f9f9',
            borderRadius: 12,
          }}
        >
          <h3>Open New Group Order</h3>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'end' }}>
            <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
              <label>Shipping Site</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
              >
                <option value="">-- Select a site --</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} — {site.city}
                  </option>
                ))}
              </select>
            </div>
            <button
              className="btn btn--primary"
              disabled={!selectedSiteId}
              onClick={handleCreate}
            >
              Open Group Order
            </button>
          </div>
        </div>
      )}

      {groupOrders.length === 0 ? (
        <p style={{ color: '#888' }}>No group orders yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Site</th>
              <th>Status</th>
              <th>Participants</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {groupOrders.map((go) => (
              <tr key={go.id}>
                <td>
                  <strong>{go.shippingSite.name}</strong>
                  <br />
                  <small style={{ color: '#888' }}>{go.shippingSite.city}</small>
                </td>
                <td>
                  <span className={`badge badge--${go.status}`}>
                    {go.status}
                  </span>
                </td>
                <td>{go.participants.length}</td>
                <td>{new Date(go.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link
                    to={`/group-orders/${go.id}`}
                    className="btn btn--secondary btn--small"
                  >
                    View
                  </Link>
                  {isAdmin && go.status === 'open' && (
                    <button
                      className="btn btn--danger btn--small"
                      onClick={() => handleStatusChange(go.id, 'close')}
                    >
                      Close
                    </button>
                  )}
                  {isAdmin && go.status === 'closed' && (
                    <button
                      className="btn btn--primary btn--small"
                      onClick={() => handleStatusChange(go.id, 'submit')}
                    >
                      Submit
                    </button>
                  )}
                  {isAdmin && go.status === 'submitted' && (
                    <button
                      className="btn btn--success btn--small"
                      onClick={() => handleStatusChange(go.id, 'ship')}
                    >
                      Mark Shipped
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
