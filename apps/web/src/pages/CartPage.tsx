import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cart.store';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../api/client';
import type {
  IShippingSite,
  IGroupOrder,
  IGroupOrderParticipant,
} from '@wine-order-app/shared-types';
import { useNavigate, Link } from 'react-router-dom';

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

  if (!cart) return <div className="spinner" />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>Review your selections before placing an order</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {cart.items.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Browse our catalog to discover and add wines you love.</p>
          <Link to="/wines" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            Browse Catalog
          </Link>
        </div>
      ) : (
        <>
          <div className="section-panel">
            <table>
              <thead>
                <tr>
                  <th>Wine</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th style={{ width: 60 }}></th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ color: 'var(--gray-900)' }}>{item.wine.name}</strong>
                      <br />
                      <span className="text-muted text-sm">
                        {item.wine.region} · {item.wine.vintage}
                      </span>
                    </td>
                    <td>₪{item.wine.price.toFixed(2)}</td>
                    <td>
                      <div className="qty-control">
                        <button
                          onClick={() =>
                            updateItem(item.id, { quantity: item.quantity - 1 })
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateItem(item.id, { quantity: item.quantity + 1 })
                          }
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--wine-700)' }}>
                      ₪{(item.wine.price * item.quantity).toFixed(2)}
                    </td>
                    <td>
                      <button
                        className="btn btn--ghost btn--small"
                        style={{ color: 'var(--danger-500)' }}
                        onClick={() => removeItem(item.id)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} style={{ textAlign: 'right', fontWeight: 700, fontSize: '1rem' }}>
                    Total
                  </td>
                  <td style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--wine-700)' }}>
                    ₪{cart.totalPrice.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="section-panel" style={{ marginTop: 'var(--space-lg)' }}>
            <div className="section-header">
              <div>
                <h3 style={{ margin: 0 }}>Enroll in a Group Order</h3>
                <p className="text-muted text-sm" style={{ marginTop: 4 }}>
                  Select a shipping site to join its active group order
                </p>
              </div>
            </div>

            <div className="form-group" style={{ maxWidth: 400 }}>
              <label>Shipping Site</label>
              <select
                value={selectedSiteId}
                onChange={(e) => setSelectedSiteId(e.target.value)}
              >
                <option value="">Select a shipping site...</option>
                {sites.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.name} — {site.city}
                  </option>
                ))}
              </select>
            </div>

            {selectedSiteId && !openGroupOrder && (
              <div className="info-box info-box--warning">
                ⚠️ No open group order at this site right now.
              </div>
            )}

            {openGroupOrder && (
              <div style={{ marginTop: 'var(--space-md)' }}>
                <div className="info-box info-box--success" style={{ marginBottom: 'var(--space-md)' }}>
                  ✅ Open group order found — {openGroupOrder.participants.length}{' '}
                  participant{openGroupOrder.participants.length !== 1 ? 's' : ''}{' '}
                  already enrolled
                </div>
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
    </div>
  );
}
