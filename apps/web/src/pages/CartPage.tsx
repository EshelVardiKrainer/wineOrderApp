import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cart.store';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../api/client';
import type {
  IShippingSite,
  IGroupOrder,
  IGroupOrderParticipant,
} from '@wine-order-app/shared-types';
import { useNavigate } from 'react-router-dom';

export function CartPage() {
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const updateItem = useCartStore((s) => s.updateItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [sites, setSites] = useState<IShippingSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState('');
  const [openGroupOrder, setOpenGroupOrder] = useState<IGroupOrder | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
    api.get<IShippingSite[]>('/shipping-sites').then(setSites);
  }, [fetchCart]);

  // When user selects a site, check for open group order
  useEffect(() => {
    if (!selectedSiteId) {
      setOpenGroupOrder(null);
      return;
    }
    api
      .get<IGroupOrder[]>(`/group-orders/site/${selectedSiteId}`)
      .then((orders) => {
        const open = orders.find((o) => o.status === 'open');
        setOpenGroupOrder(open ?? null);
      });
  }, [selectedSiteId]);

  const handleEnroll = async () => {
    if (!openGroupOrder) return;
    setEnrolling(true);
    setError('');
    try {
      await api.post<IGroupOrderParticipant>(
        `/group-orders/${openGroupOrder.id}/enroll`,
      );
      navigate('/my-orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (!cart) return <p>Loading cart...</p>;

  return (
    <>
      <h1>🛒 Your Cart</h1>

      {error && <div className="error-msg">{error}</div>}

      {cart.items.length === 0 ? (
        <p>Your cart is empty. Browse the <a href="/wines">catalog</a> to add wines.</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>Wine</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.wine.name}</strong>
                    <br />
                    <small style={{ color: '#888' }}>
                      {item.wine.region} · {item.wine.vintage}
                    </small>
                  </td>
                  <td>${item.wine.price.toFixed(2)}</td>
                  <td style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button
                      className="btn btn--secondary btn--small"
                      onClick={() =>
                        updateItem(item.id, { quantity: item.quantity - 1 })
                      }
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      className="btn btn--secondary btn--small"
                      onClick={() =>
                        updateItem(item.id, { quantity: item.quantity + 1 })
                      }
                    >
                      +
                    </button>
                  </td>
                  <td>${(item.wine.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn btn--danger btn--small"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>
                  Total:
                </td>
                <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  ${cart.totalPrice.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>

          <div
            style={{
              marginTop: '2rem',
              padding: '1.5rem',
              background: '#f9f9f9',
              borderRadius: 12,
            }}
          >
            <h3>Enroll in a Group Order</h3>
            <p style={{ color: '#666', fontSize: '0.9rem' }}>
              Select a shipping site to join its active group order. Your cart
              items will be committed to the group.
            </p>

            <div className="form-group">
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

            {selectedSiteId && !openGroupOrder && (
              <p style={{ color: '#856404' }}>
                ⚠️ No open group order for this site right now.
              </p>
            )}

            {openGroupOrder && (
              <div>
                <p style={{ color: '#155724' }}>
                  ✅ Open group order found ({openGroupOrder.participants.length}{' '}
                  participant{openGroupOrder.participants.length !== 1 ? 's' : ''}{' '}
                  enrolled)
                </p>
                <button
                  className="btn btn--success"
                  disabled={enrolling}
                  onClick={handleEnroll}
                >
                  {enrolling ? 'Enrolling...' : 'Enroll & Submit Order'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
