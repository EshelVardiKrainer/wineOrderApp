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
  const [minimumAmount, setMinimumAmount] = useState('');
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
        minimumAmount: minimumAmount ? Number(minimumAmount) : undefined,
      } satisfies IGroupOrderCreate);
      setSelectedSiteId('');
      setMinimumAmount('');
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
    <div className="animate-in">
      <div className="page-header">
        <h1>Group Orders</h1>
        <p>Manage and participate in group wine orders</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {isAdmin && (
        <div className="section-panel" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="section-header">
            <h3 style={{ margin: 0 }}>Open New Group Order</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label>Shipping Site</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
              >
                <option value="">Select a site...</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} — {site.city}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ width: 180, marginBottom: 0 }}>
              <label>Minimum (₪)</label>
              <input
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={minimumAmount}
                onChange={(e) => setMinimumAmount(e.target.value)}
              />
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
        <div className="empty-state">
          <span className="empty-state-icon">📦</span>
          <h3>No group orders yet</h3>
          <p>Group orders will appear here once they are created.</p>
        </div>
      ) : (
        <div className="section-panel">
          <table>
            <thead>
              <tr>
                <th>Site</th>
                <th>Status</th>
                <th>Minimum</th>
                <th>Participants</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groupOrders.map((go) => (
                <tr key={go.id}>
                  <td>
                    <strong style={{ color: 'var(--gray-900)' }}>{go.shippingSite.name}</strong>
                    <br />
                    <span className="text-muted text-sm">{go.shippingSite.city}</span>
                  </td>
                  <td>
                    <span className={`badge badge--${go.status}`}>
                      {go.status}
                    </span>
                  </td>
                  <td>
                    {go.minimumAmount > 0
                      ? <span style={{ fontWeight: 600 }}>₪{go.minimumAmount}</span>
                      : <span className="text-muted">—</span>}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{go.participants.length}</span>
                  </td>
                  <td className="text-muted text-sm">
                    {new Date(go.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
