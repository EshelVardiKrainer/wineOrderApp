import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import type { IGroupOrder, IGroupOrderSummary } from '@wine-order-app/shared-types';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  open:      { label: 'Open',      color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.25)' },
  closed:    { label: 'Closed',    color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.25)' },
  submitted: { label: 'Submitted', color: 'var(--info-700)',    bg: 'var(--info-50)',    border: 'rgba(59,130,246,0.25)' },
  shipped:   { label: 'Shipped',   color: '#065f46',            bg: '#ecfdf5',           border: 'rgba(5,150,105,0.25)' },
};

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

  const cfg = STATUS_CONFIG[go.status] ?? STATUS_CONFIG.open;

  return (
    <div className="animate-in">
      {/* ── Back Link ── */}
      <div style={{ marginBottom: 'var(--space-md)' }}>
        <Link to="/group-orders" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          color: 'var(--gray-500)',
          fontSize: '0.875rem',
          fontWeight: 500,
          transition: 'color 0.2s',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Group Orders
        </Link>
      </div>

      {/* ── Page Header ── */}
      <div className="section-panel" style={{ marginBottom: 'var(--space-lg)', padding: 0, overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--wine-950) 0%, var(--wine-800) 100%)',
          padding: 'var(--space-xl) var(--space-2xl)',
          color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white' }}>
              {go.shippingSite.name}
            </h1>
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
            }}>
              {cfg.label}
            </span>
          </div>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }}>
            {go.shippingSite.address}, {go.shippingSite.city}
          </p>
        </div>
        <div style={{ padding: 'var(--space-lg) var(--space-2xl)', display: 'flex', gap: 'var(--space-2xl)', flexWrap: 'wrap' }}>
          <div>
            <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }}>Created</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(go.createdAt).toLocaleString()}</div>
          </div>
          {go.closedAt && (
            <div>
              <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }}>Closed</div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{new Date(go.closedAt).toLocaleString()}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }}>Order ID</div>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }}>{go.id.slice(0, 12).toUpperCase()}…</div>
          </div>
        </div>
      </div>

      {/* ── Summary ── */}
      {summary && (
        <div className="section-panel" style={{ marginBottom: 'var(--space-lg)' }}>
          <h3 style={{ marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            Order Summary
          </h3>

          <div className="stat-row">
            <div className="stat-card">
              <div className="stat-value">{summary.totalParticipants}</div>
              <div className="stat-label">Participants</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{summary.totalBottles}</div>
              <div className="stat-label">Bottles</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">₪{summary.totalPrice.toFixed(0)}</div>
              <div className="stat-label">Total Value</div>
            </div>
            {summary.minimumAmount > 0 && (
              <div className="stat-card" style={{ borderTop: `3px solid ${summary.minimumReached ? 'var(--success-500)' : 'var(--warning-500)'}` }}>
                <div className="stat-value" style={{ color: summary.minimumReached ? 'var(--success-700)' : 'var(--warning-700)' }}>
                  {summary.minimumReached ? '✓' : `${Math.round((summary.totalPrice / summary.minimumAmount) * 100)}%`}
                </div>
                <div className="stat-label">{summary.minimumReached ? 'Min Reached' : 'Of Minimum'}</div>
              </div>
            )}
          </div>

          {summary.minimumAmount > 0 && (
            <div style={{ marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 600, color: summary.minimumReached ? 'var(--success-700)' : 'var(--warning-700)' }}>
                  {summary.minimumReached ? '✅ Minimum reached' : '⏳ Working towards minimum'}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--gray-600)' }}>
                  ₪{summary.totalPrice.toFixed(0)} / ₪{summary.minimumAmount.toLocaleString()}
                </span>
              </div>
              <div className="progress-bar" style={{ height: 10 }}>
                <div
                  className={`progress-bar__fill ${summary.minimumReached ? 'progress-bar__fill--success' : 'progress-bar__fill--warning'}`}
                  style={{ width: `${Math.min(100, (summary.totalPrice / summary.minimumAmount) * 100)}%` }}
                />
              </div>
              {!summary.minimumReached && (
                <p style={{ fontSize: '0.82rem', color: 'var(--warning-700)', marginTop: 6, fontWeight: 600 }}>
                  ₪{(summary.minimumAmount - summary.totalPrice).toFixed(2)} more needed to reach the minimum
                </p>
              )}
            </div>
          )}

          {isAdmin && summary.wineAggregation.length > 0 && (
            <>
              <h4 style={{ fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)', marginBottom: 'var(--space-sm)', fontWeight: 600 }}>
                Wine Breakdown
              </h4>
              <div className="table-wrap">
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
                        <td>
                          <span style={{ background: 'var(--gray-100)', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: '0.85rem' }}>
                            ×{wa.totalQuantity}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: 'var(--wine-700)' }}>₪{wa.totalPrice.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Participants ── */}
      <div className="section-header">
        <h2 style={{ fontFamily: 'var(--font-display)' }}>
          {isAdmin ? `Participants (${go.participants.length})` : 'My Order'}
        </h2>
      </div>

      {visibleParticipants.length === 0 ? (
        <div className="empty-state section-panel">
          <span className="empty-state-icon">{isAdmin ? '👥' : '📋'}</span>
          <h3>{isAdmin ? 'No participants yet' : 'Not enrolled'}</h3>
          <p>{isAdmin ? 'No one has enrolled in this group order yet.' : 'You are not enrolled in this group order.'}</p>
        </div>
      ) : (
        <div className="stagger">
          {visibleParticipants.map((p) => {
            const pTotal = p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
            return (
              <div key={p.id} className="section-panel" style={{ marginBottom: 'var(--space-md)', padding: 0, overflow: 'hidden' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: 'var(--space-md) var(--space-xl)',
                  background: 'var(--gray-50)',
                  borderBottom: '1px solid var(--gray-100)',
                  flexWrap: 'wrap',
                  gap: 'var(--space-md)',
                }}>
                  {isAdmin ? (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--wine-700), var(--wine-900))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                        }}>
                          {p.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ color: 'var(--gray-900)', fontSize: '0.92rem' }}>{p.user.name}</strong>
                          <span className="text-muted text-xs" style={{ marginLeft: 8 }}>{p.user.email}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }}>
                      Enrolled: {new Date(p.enrolledAt).toLocaleString()}
                    </div>
                  )}
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--wine-700)' }}>
                    ₪{pTotal.toFixed(2)}
                  </div>
                </div>

                {p.orderItems.length > 0 && (
                  <div className="table-wrap">
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
                            <td style={{ fontWeight: 600 }}>{item.wine.name}</td>
                            <td>
                              <span style={{ background: 'var(--gray-100)', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: '0.85rem' }}>
                                ×{item.quantity}
                              </span>
                            </td>
                            <td>₪{item.unitPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 700, color: 'var(--wine-700)' }}>
                              ₪{(item.quantity * item.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total</td>
                          <td style={{ fontWeight: 800, color: 'var(--wine-700)' }}>₪{pTotal.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
