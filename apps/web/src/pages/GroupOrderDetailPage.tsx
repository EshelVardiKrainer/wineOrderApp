import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type {
  IGroupOrder,
  IGroupOrderSummary,
} from '@wine-order-app/shared-types';

export function GroupOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [go, setGo] = useState<IGroupOrder | null>(null);
  const [summary, setSummary] = useState<IGroupOrderSummary | null>(null);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!id) return;
    api.get<IGroupOrder>(`/group-orders/${id}`).then(setGo);
    api.get<IGroupOrderSummary>(`/group-orders/${id}/summary`).then(setSummary);
  }, [id]);

  if (!go) return <div className="spinner" />;

  const visibleParticipants = isAdmin
    ? go.participants
    : go.participants.filter((p) => p.userId === user?.id);

  return (
    <div className="animate-in">
      <div style={{ marginBottom: 'var(--space-sm)' }}>
        <Link to="/group-orders" className="text-muted text-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          ← Back to Group Orders
        </Link>
      </div>

      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0 }}>{go.shippingSite.name}</h1>
        <span className={`badge badge--${go.status}`}>{go.status}</span>
      </div>

      <div className="section-panel" style={{ marginBottom: 'var(--space-lg)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-xl)', flexWrap: 'wrap', fontSize: '0.9rem' }}>
          <div>
            <span className="text-muted">Address</span>
            <p style={{ fontWeight: 600, margin: '2px 0' }}>{go.shippingSite.address}, {go.shippingSite.city}</p>
          </div>
          <div>
            <span className="text-muted">Created</span>
            <p style={{ fontWeight: 600, margin: '2px 0' }}>{new Date(go.createdAt).toLocaleString()}</p>
          </div>
          {go.closedAt && (
            <div>
              <span className="text-muted">Closed</span>
              <p style={{ fontWeight: 600, margin: '2px 0' }}>{new Date(go.closedAt).toLocaleString()}</p>
            </div>
          )}
        </div>
      </div>

      {summary && (
        <div className="section-panel" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-md)', fontSize: '1rem' }}>Order Summary</h3>

          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-value">{summary.totalParticipants}</div>
              <div className="stat-label">Participants</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.totalBottles}</div>
              <div className="stat-label">Total Bottles</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₪{summary.totalPrice.toFixed(0)}</div>
              <div className="stat-label">Total Value</div>
            </div>
          </div>

          {summary.minimumAmount > 0 && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: summary.minimumReached ? 'var(--success-700)' : 'var(--warning-700)' }}>
                  {summary.minimumReached ? '✅' : '⏳'} Minimum: ₪{summary.minimumAmount}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>
                  ₪{summary.totalPrice.toFixed(2)} / ₪{summary.minimumAmount}
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className={`progress-bar__fill ${summary.minimumReached ? 'progress-bar__fill--success' : 'progress-bar__fill--warning'}`}
                  style={{ width: `${Math.min(100, (summary.totalPrice / summary.minimumAmount) * 100)}%` }}
                />
              </div>
              <p style={{ fontSize: '0.82rem', color: summary.minimumReached ? 'var(--success-700)' : 'var(--warning-700)', marginTop: 6, fontWeight: 600 }}>
                {summary.minimumReached
                  ? 'Minimum reached!'
                  : `₪${(summary.minimumAmount - summary.totalPrice).toFixed(2)} more needed`}
              </p>
            </div>
          )}

          {isAdmin && summary.wineAggregation.length > 0 && (
            <div>
              <h4 className="text-sm" style={{ marginBottom: 'var(--space-sm)', color: 'var(--gray-600)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Wine Breakdown
              </h4>
              <table>
                <thead>
                  <tr>
                    <th>Wine</th>
                    <th>Total Bottles</th>
                    <th>Total Value</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.wineAggregation.map((wa) => (
                    <tr key={wa.wineId}>
                      <td style={{ fontWeight: 600 }}>{wa.wineName}</td>
                      <td>{wa.totalQuantity}</td>
                      <td style={{ fontWeight: 600, color: 'var(--wine-700)' }}>₪{wa.totalPrice.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div className="section-header">
        <h2>{isAdmin ? `Participants (${go.participants.length})` : 'My Order'}</h2>
      </div>

      {visibleParticipants.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">{isAdmin ? '👥' : '📋'}</span>
          <h3>{isAdmin ? 'No participants yet' : 'Not enrolled'}</h3>
          <p>{isAdmin ? 'No one has enrolled in this group order.' : 'You are not enrolled in this group order.'}</p>
        </div>
      ) : (
        <div className="stagger">
          {visibleParticipants.map((p) => (
            <div key={p.id} className="section-panel" style={{ marginBottom: 'var(--space-md)' }}>
              {isAdmin && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }}>
                  <div>
                    <strong style={{ color: 'var(--gray-900)' }}>{p.user.name}</strong>
                    <span className="text-muted text-sm" style={{ marginLeft: 8 }}>
                      {p.user.email}
                    </span>
                  </div>
                </div>
              )}
              <p className="text-muted text-sm" style={{ marginBottom: 'var(--space-sm)' }}>
                Enrolled: {new Date(p.enrolledAt).toLocaleString()}
              </p>
              {p.orderItems.length > 0 && (
                <table>
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
                  <tfoot>
                    <tr>
                      <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>
                        Total
                      </td>
                      <td style={{ fontWeight: 800, color: 'var(--wine-700)' }}>
                        ₪{p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
