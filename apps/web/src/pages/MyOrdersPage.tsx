import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import type { IGroupOrderParticipant, IGroupOrder, IShippingSite } from '@wine-order-app/shared-types';

interface SiteGroup {
  site: IShippingSite;
  participations: (IGroupOrderParticipant & { groupOrderStatus: string; groupOrderId: string })[];
  siteTotal: number;
}

const STATUS_STYLES: Record<string, { color: string; bg: string; border: string; icon: string }> = {
  open:      { color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.2)',  icon: '🔓' },
  closed:    { color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.2)',  icon: '🔒' },
  submitted: { color: 'var(--info-700)',    bg: 'var(--info-50)',    border: 'rgba(59,130,246,0.2)',  icon: '📤' },
  shipped:   { color: '#065f46',            bg: '#ecfdf5',           border: 'rgba(5,150,105,0.2)',  icon: '🚚' },
};

export function MyOrdersPage() {
  const [participations, setParticipations] = useState<IGroupOrderParticipant[]>([]);
  const [groupOrders, setGroupOrders] = useState<IGroupOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<IGroupOrderParticipant[]>('/group-orders/my/participations'),
      api.get<IGroupOrder[]>('/group-orders'),
    ]).then(([parts, orders]) => {
      setParticipations(parts);
      setGroupOrders(orders);
      setLoading(false);
    });
  }, []);

  const goMap = useMemo(() => {
    const m = new Map<string, IGroupOrder>();
    groupOrders.forEach((go) => m.set(go.id, go));
    return m;
  }, [groupOrders]);

  const siteGroups: SiteGroup[] = useMemo(() => {
    const map = new Map<string, SiteGroup>();
    for (const p of participations) {
      const go = goMap.get(p.groupOrderId);
      if (!go) continue;
      const siteId = go.shippingSiteId;
      if (!map.has(siteId)) map.set(siteId, { site: go.shippingSite, participations: [], siteTotal: 0 });
      const group = map.get(siteId)!;
      const myTotal = p.orderItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
      group.participations.push({ ...p, groupOrderStatus: go.status, groupOrderId: go.id });
      group.siteTotal += myTotal;
    }
    return Array.from(map.values());
  }, [participations, goMap]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track your group order enrollments and purchase history</p>
      </div>

      {siteGroups.length === 0 ? (
        <div className="empty-state section-panel">
          <span className="empty-state-icon">📋</span>
          <h3>No orders yet</h3>
          <p>You haven't enrolled in any group orders. Head to the catalog to browse wines and join a group order.</p>
          <Link to="/wines" className="btn btn--primary" style={{ marginTop: 'var(--space-lg)' }}>
            Browse Catalog →
          </Link>
        </div>
      ) : (
        <div className="stagger">
          {siteGroups.map((sg) => (
            <div key={sg.site.id} className="section-panel" style={{ marginBottom: 'var(--space-lg)', padding: 0, overflow: 'hidden' }}>
              {/* Site Header */}
              <div style={{
                background: 'linear-gradient(135deg, var(--wine-950) 0%, var(--wine-800) 100%)',
                padding: 'var(--space-lg) var(--space-xl)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--space-md)',
              }}>
                <div style={{ color: 'white' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                      Shipping Site
                    </span>
                  </div>
                  <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'white', fontFamily: 'var(--font-display)' }}>
                    {sg.site.name}
                  </h2>
                  <p style={{ margin: '4px 0 0', fontSize: '0.83rem', color: 'rgba(255,255,255,0.5)' }}>
                    {sg.site.address}, {sg.site.city}
                  </p>
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-md) var(--space-lg)',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                }}>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-300)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
                    ₪{sg.siteTotal.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 2 }}>
                    Total Spent
                  </div>
                </div>
              </div>

              {/* Participations */}
              <div style={{ padding: 'var(--space-xl)' }}>
                {sg.participations.map((p, idx) => {
                  const myTotal = p.orderItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
                  const statusCfg = STATUS_STYLES[p.groupOrderStatus] ?? STATUS_STYLES.open;
                  return (
                    <div
                      key={p.id}
                      style={{
                        marginBottom: idx < sg.participations.length - 1 ? 'var(--space-lg)' : 0,
                        border: '1px solid var(--gray-100)',
                        borderRadius: 'var(--radius-md)',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: 'var(--space-md) var(--space-lg)',
                        background: 'var(--gray-50)',
                        borderBottom: '1px solid var(--gray-100)',
                        flexWrap: 'wrap',
                        gap: 'var(--space-sm)',
                      }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <span style={{ fontSize: '1rem' }}>{statusCfg.icon}</span>
                            <span style={{ fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.92rem' }}>
                              Order #{p.groupOrderId.slice(0, 8).toUpperCase()}
                            </span>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: 'var(--radius-full)',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              background: statusCfg.bg,
                              color: statusCfg.color,
                              border: `1px solid ${statusCfg.border}`,
                            }}>
                              {p.groupOrderStatus}
                            </span>
                          </div>
                          <p className="text-xs text-muted" style={{ marginTop: 4, marginLeft: 28 }}>
                            Enrolled: {new Date(p.enrolledAt).toLocaleString()}
                          </p>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--wine-700)' }}>
                          ₪{myTotal.toFixed(2)}
                        </div>
                      </div>

                      {p.orderItems.length > 0 && (
                        <div className="table-wrap">
                          <table>
                            <thead>
                              <tr>
                                <th>Wine</th>
                                <th>Region</th>
                                <th>Qty</th>
                                <th>Unit Price</th>
                                <th>Subtotal</th>
                              </tr>
                            </thead>
                            <tbody>
                              {p.orderItems.map((item) => (
                                <tr key={item.id}>
                                  <td style={{ fontWeight: 600 }}>{item.wine.name}</td>
                                  <td className="text-muted">{item.wine.region}</td>
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
                          </table>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
