import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
import type {
  IGroupOrderParticipant,
  IGroupOrder,
  IShippingSite,
} from '@wine-order-app/shared-types';

interface SiteGroup {
  site: IShippingSite;
  participations: (IGroupOrderParticipant & { groupOrderStatus: string })[];
  siteTotal: number;
}

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
      if (!map.has(siteId)) {
        map.set(siteId, {
          site: go.shippingSite,
          participations: [],
          siteTotal: 0,
        });
      }
      const group = map.get(siteId)!;
      const myTotal = p.orderItems.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0,
      );
      group.participations.push({ ...p, groupOrderStatus: go.status });
      group.siteTotal += myTotal;
    }

    return Array.from(map.values());
  }, [participations, goMap]);

  if (loading) return <div className="spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>My Orders</h1>
        <p>Track your group order enrollments and purchases</p>
      </div>

      {siteGroups.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📋</span>
          <h3>No orders yet</h3>
          <p>You haven't enrolled in any group orders. Head to the cart to join one.</p>
          <Link to="/cart" className="btn btn--primary">Go to Cart</Link>
        </div>
      ) : (
        <div className="stagger">
          {siteGroups.map((sg) => (
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
                  <h2 style={{ margin: 0, fontSize: '1.15rem' }}>📍 {sg.site.name}</h2>
                  <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
                    {sg.site.address}, {sg.site.city}
                  </p>
                </div>
                <div className="stat-card" style={{ minWidth: 110, margin: 0, border: 'none', background: 'var(--wine-50)', padding: '0.5rem 1rem' }}>
                  <div className="stat-value" style={{ fontSize: '1.15rem' }}>₪{sg.siteTotal.toFixed(2)}</div>
                  <div className="stat-label">Site Total</div>
                </div>
              </div>

              {sg.participations.map((p) => {
                const myTotal = p.orderItems.reduce(
                  (sum, i) => sum + i.quantity * i.unitPrice,
                  0,
                );
                return (
                  <div
                    key={p.id}
                    style={{
                      marginBottom: 'var(--space-md)',
                      padding: 'var(--space-md)',
                      background: 'var(--gray-50)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--gray-100)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '0.95rem' }}>
                          Order #{p.groupOrderId.slice(0, 8)}{' '}
                          <span className={`badge badge--${p.groupOrderStatus}`}>
                            {p.groupOrderStatus}
                          </span>
                        </h3>
                        <p className="text-muted text-sm" style={{ margin: '4px 0 0' }}>
                          Enrolled: {new Date(p.enrolledAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {p.orderItems.length > 0 && (
                      <table style={{ marginTop: 'var(--space-sm)' }}>
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
                              <td style={{ fontWeight: 500 }}>{item.wine.name}</td>
                              <td className="text-muted">{item.wine.region}</td>
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
                            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>
                              Order Total
                            </td>
                            <td style={{ fontWeight: 800, color: 'var(--wine-700)' }}>
                              ₪{myTotal.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
