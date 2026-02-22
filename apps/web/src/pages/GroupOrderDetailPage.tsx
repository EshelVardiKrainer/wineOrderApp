import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api/client';
import type {
  IGroupOrder,
  IGroupOrderSummary,
} from '@wine-order-app/shared-types';

export function GroupOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [go, setGo] = useState<IGroupOrder | null>(null);
  const [summary, setSummary] = useState<IGroupOrderSummary | null>(null);

  useEffect(() => {
    if (!id) return;
    api.get<IGroupOrder>(`/group-orders/${id}`).then(setGo);
    api.get<IGroupOrderSummary>(`/group-orders/${id}/summary`).then(setSummary);
  }, [id]);

  if (!go) return <p>Loading...</p>;

  return (
    <>
      <h1>
        Group Order — {go.shippingSite.name}{' '}
        <span className={`badge badge--${go.status}`}>{go.status}</span>
      </h1>

      <p>
        <strong>Site:</strong> {go.shippingSite.address}, {go.shippingSite.city}
        <br />
        <strong>Created:</strong> {new Date(go.createdAt).toLocaleString()}
        {go.closedAt && (
          <>
            <br />
            <strong>Closed:</strong> {new Date(go.closedAt).toLocaleString()}
          </>
        )}
      </p>

      {summary && (
        <div
          style={{
            marginBottom: '2rem',
            padding: '1rem',
            background: '#f0f7ff',
            borderRadius: 12,
          }}
        >
          <h3>📊 Aggregated Summary</h3>
          <p>
            <strong>{summary.totalParticipants}</strong> participants ·{' '}
            <strong>{summary.totalBottles}</strong> total bottles ·{' '}
            <strong>₪{summary.totalPrice.toFixed(2)}</strong> total value
          </p>

          {summary.minimumAmount > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600 }}>
                  {summary.minimumReached ? '✅' : '⏳'} Minimum: ₪{summary.minimumAmount}
                </span>
                <span style={{ fontWeight: 600 }}>
                  ₪{summary.totalPrice.toFixed(2)} / ₪{summary.minimumAmount}
                </span>
              </div>
              <div style={{
                height: 12,
                background: '#e0e0e0',
                borderRadius: 6,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${Math.min(100, (summary.totalPrice / summary.minimumAmount) * 100)}%`,
                  background: summary.minimumReached ? '#4caf50' : '#ff9800',
                  borderRadius: 6,
                  transition: 'width 0.3s ease',
                }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: summary.minimumReached ? '#4caf50' : '#ff9800', marginTop: 4, fontWeight: 600 }}>
                {summary.minimumReached
                  ? 'Minimum reached! ✓'
                  : `₪${(summary.minimumAmount - summary.totalPrice).toFixed(2)} more needed`}
              </p>
            </div>
          )}

          {summary.wineAggregation.length > 0 && (
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
                    <td>{wa.wineName}</td>
                    <td>{wa.totalQuantity}</td>
                    <td>₪{wa.totalPrice.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <h2>Participants ({go.participants.length})</h2>
      {go.participants.length === 0 ? (
        <p style={{ color: '#888' }}>No one has enrolled yet.</p>
      ) : (
        go.participants.map((p) => (
          <div
            key={p.id}
            style={{
              marginBottom: '1rem',
              padding: '1rem',
              background: 'white',
              border: '1px solid #eee',
              borderRadius: 8,
            }}
          >
            <h4>
              {p.user.name}{' '}
              <span style={{ color: '#888', fontWeight: 400 }}>
                ({p.user.email})
              </span>
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#888' }}>
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
                      <td>{item.wine.name}</td>
                      <td>{item.quantity}</td>
                      <td>₪{item.unitPrice.toFixed(2)}</td>
                      <td>₪{(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
    </>
  );
}
