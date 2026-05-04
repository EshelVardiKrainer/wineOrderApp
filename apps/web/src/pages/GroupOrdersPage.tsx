import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type { IGroupOrder, IGroupOrderCreate, IShippingSite } from '@wine-order-app/shared-types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; dot: string }> = {
  open:      { label: 'Open',      color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.2)', dot: 'var(--success-500)' },
  closed:    { label: 'Closed',    color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.2)',  dot: 'var(--warning-500)' },
  submitted: { label: 'Submitted', color: 'var(--info-700)',    bg: 'var(--info-50)',    border: 'rgba(59,130,246,0.2)', dot: 'var(--info-500)'    },
  shipped:   { label: 'Shipped',   color: '#065f46',            bg: '#ecfdf5',           border: 'rgba(5,150,105,0.2)', dot: 'var(--success-500)' },
};

export function GroupOrdersPage() {
  const [groupOrders, setGroupOrders] = useState<IGroupOrder[]>([]);
  const [sites, setSites] = useState<IShippingSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [minimumAmount, setMinimumAmount] = useState('');
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  const fetchOrders = async () => {
    const orders = await api.get<IGroupOrder[]>('/group-orders');
    setGroupOrders(orders);
  };

  useEffect(() => {
    fetchOrders();
    if (isAdmin) api.get<IShippingSite[]>('/shipping-sites').then(setSites);
  }, [isAdmin]);

  const handleCreate = async () => {
    if (!selectedSiteId) return;
    const amt = Number(minimumAmount);
    if (isNaN(amt) || amt < 0 || amt > 50000) {
      setError('Minimum amount must be a number between 0 and 50,000');
      return;
    }
    setError('');
    try {
      await api.post<IGroupOrder>('/group-orders', {
        shippingSiteId: selectedSiteId,
        minimumAmount: amt,
      } satisfies IGroupOrderCreate);
      setSelectedSiteId('');
      setMinimumAmount('');
      setShowForm(false);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id: string, action: 'close' | 'submit' | 'ship') => {
    try {
      await api.patch<IGroupOrder>(`/group-orders/${id}/${action}`);
      fetchOrders();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div className="page-header" style={{ margin: 0 }}>
          <h1>Group Orders</h1>
          <p>Coordinate group wine purchases across shipping sites</p>
        </div>
        {isAdmin && (
          <button
            className="btn btn--primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕ Cancel' : '+ New Group Order'}
          </button>
        )}
      </div>

      {error && <div className="error-msg">{error}</div>}

      {/* ── Create Form ── */}
      {isAdmin && showForm && (
        <div className="section-panel animate-in" style={{ marginBottom: 'var(--space-xl)', background: 'var(--wine-50)', border: '1px solid var(--wine-100)' }}>
          <h3 style={{ margin: '0 0 var(--space-lg)', fontFamily: 'var(--font-display)', color: 'var(--wine-900)' }}>
            Open New Group Order
          </h3>
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ flex: 1, minWidth: 200, marginBottom: 0 }}>
              <label>Shipping Site</label>
              <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
                <option value="">Select a site...</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>{site.name} — {site.city}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ width: 180, marginBottom: 0 }}>
              <label>Minimum Amount (₪)</label>
              <input
                type="number" min="0" max="50000" step="1" placeholder="0 – 50,000"
                value={minimumAmount}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === '' || (/^\d+$/.test(v) && Number(v) <= 50000)) setMinimumAmount(v);
                }}
              />
            </div>
            <button
              className="btn btn--primary"
              disabled={!selectedSiteId || minimumAmount === ''}
              onClick={handleCreate}
            >
              Open Order
            </button>
          </div>
        </div>
      )}

      {/* ── Orders List ── */}
      {groupOrders.length === 0 ? (
        <div className="empty-state section-panel">
          <span className="empty-state-icon">📦</span>
          <h3>No group orders yet</h3>
          <p>{isAdmin ? 'Create your first group order using the button above.' : 'Group orders will appear here once they are created by an admin.'}</p>
        </div>
      ) : (
        <div className="group-order-cards stagger">
          {groupOrders.map((go) => {
            const cfg = STATUS_CONFIG[go.status] ?? STATUS_CONFIG.open;
            const totalValue = go.participants.reduce(
              (sum, p) => sum + p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0),
              0,
            );
            return (
              <div key={go.id} className="group-order-card">
                <div className="group-order-card-header">
                  <div className="group-order-card-site">
                    <h3>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--wine-500)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: 'middle' }}>
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      {go.shippingSite.name}
                    </h3>
                    <p>{go.shippingSite.address}, {go.shippingSite.city}</p>
                  </div>
                  <span style={{
                    padding: '5px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: cfg.bg,
                    color: cfg.color,
                    border: `1px solid ${cfg.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    flexShrink: 0,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' }}/>
                    {cfg.label}
                  </span>
                </div>

                <div className="group-order-card-meta">
                  <div className="group-order-card-meta-item">
                    <div className="meta-label">Participants</div>
                    <div className="meta-value">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                      </svg>
                      {go.participants.length}
                    </div>
                  </div>
                  <div className="group-order-card-meta-item">
                    <div className="meta-label">Minimum</div>
                    <div className="meta-value">
                      {go.minimumAmount > 0 ? `₪${go.minimumAmount.toLocaleString()}` : <span className="text-muted">None</span>}
                    </div>
                  </div>
                  {totalValue > 0 && (
                    <div className="group-order-card-meta-item">
                      <div className="meta-label">Total Value</div>
                      <div className="meta-value" style={{ color: 'var(--wine-700)' }}>₪{totalValue.toFixed(2)}</div>
                    </div>
                  )}
                  <div className="group-order-card-meta-item">
                    <div className="meta-label">Created</div>
                    <div className="meta-value text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                      {new Date(go.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="group-order-card-footer">
                  <Link to={`/group-orders/${go.id}`} className="btn btn--secondary btn--small">
                    View Details →
                  </Link>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      {go.status === 'open' && (
                        <button className="btn btn--danger btn--small" onClick={() => handleStatusChange(go.id, 'close')}>
                          Close Order
                        </button>
                      )}
                      {go.status === 'closed' && (
                        <button className="btn btn--primary btn--small" onClick={() => handleStatusChange(go.id, 'submit')}>
                          Submit to Supplier
                        </button>
                      )}
                      {go.status === 'submitted' && (
                        <button className="btn btn--success btn--small" onClick={() => handleStatusChange(go.id, 'ship')}>
                          Mark as Shipped
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
