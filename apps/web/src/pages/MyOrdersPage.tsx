import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { IGroupOrderParticipant } from '@wine-order-app/shared-types';

export function MyOrdersPage() {
  const [participations, setParticipations] = useState<
    IGroupOrderParticipant[]
  >([]);

  useEffect(() => {
    api
      .get<IGroupOrderParticipant[]>('/group-orders/my/participations')
      .then(setParticipations);
  }, []);

  return (
    <>
      <h1>📋 My Orders</h1>

      {participations.length === 0 ? (
        <p style={{ color: '#888' }}>
          You haven't enrolled in any group orders yet. Go to the{' '}
          <a href="/cart">cart</a> to enroll.
        </p>
      ) : (
        participations.map((p) => (
          <div
            key={p.id}
            style={{
              marginBottom: '1.5rem',
              padding: '1.25rem',
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 12,
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
                <h3 style={{ margin: 0 }}>
                  Group Order #{p.groupOrderId.slice(0, 8)}
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
                      Total:
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      $
                      {p.orderItems
                        .reduce(
                          (sum, i) => sum + i.quantity * i.unitPrice,
                          0,
                        )
                        .toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        ))
      )}
    </>
  );
}
