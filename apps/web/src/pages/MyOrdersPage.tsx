import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
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

  // Build a map of groupOrderId → group order (for site info + status)
  const goMap = useMemo(() => {
    const m = new Map<string, IGroupOrder>();
    groupOrders.forEach((go) => m.set(go.id, go));
    return m;
  }, [groupOrders]);

  // Group participations by shipping site
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

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <h1>📋 My Orders</h1>

      {siteGroups.length === 0 ? (
        <p style={{ color: '#888' }}>
          You haven't enrolled in any group orders yet. Go to the{' '}
          <a href="/cart">cart</a> to enroll.
        </p>
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
            {/* Site header */}
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
                <h2 style={{ margin: 0 }}>📍 {sg.site.name}</h2>
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

            {/* Each participation/group order for this site */}
            {sg.participations.map((p) => {
              const myTotal = p.orderItems.reduce(
                (sum, i) => sum + i.quantity * i.unitPrice,
                0,
              );
              return (
                <div
                  key={p.id}
                  style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: '#fafafa',
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1rem' }}>
                        Order #{p.groupOrderId.slice(0, 8)}{' '}
                        <span className={`badge badge--${p.groupOrderStatus}`}>
                          {p.groupOrderStatus}
                        </span>
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#888', margin: '4px 0' }}>
                        Enrolled: {new Date(p.enrolledAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {p.orderItems.length > 0 && (
                    <table style={{ marginTop: '0.75rem' }}>
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
                            <td>{item.wine.name}</td>
                            <td style={{ color: '#888' }}>{item.wine.region}</td>
                            <td>{item.quantity}</td>
                            <td>₪{item.unitPrice.toFixed(2)}</td>
                            <td style={{ fontWeight: 600 }}>
                              ₪{(item.quantity * item.unitPrice).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td
                            colSpan={4}
                            style={{ textAlign: 'right', fontWeight: 700 }}
                          >
                            Order Total:
                          </td>
                          <td style={{ fontWeight: 700 }}>
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
        ))
      )}
    </>
  );
}
