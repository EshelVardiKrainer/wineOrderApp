import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cart.store';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../api/client';
import type { IShippingSite, IGroupOrder, IGroupOrderParticipant } from '@wine-order-app/shared-types';
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
    if (!selectedSiteId) { setOpenGroupOrder(null); return; }
    api.get<IGroupOrder[]>(`/group-orders/site/${selectedSiteId}`).then((orders) => {
      const open = orders.find((o) => o.status === 'open');
      setOpenGroupOrder(open ?? null);
    });
  }, [selectedSiteId]);

  const handleEnroll = async () => {
    if (!openGroupOrder) return;
    setEnrolling(true);
    setError('');
    try {
      await api.post<IGroupOrderParticipant>(`/group-orders/${openGroupOrder.id}/enroll`);
      navigate('/my-orders');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEnrolling(false);
    }
  };

  if (!cart) return <div className="spinner" />;

  const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <p>{itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''} ready for checkout` : 'Your cart is empty'}</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {cart.items.length === 0 ? (
        <div className="empty-state" style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-card)' }}>
          <span className="empty-state-icon">🛒</span>
          <h3>Your cart is empty</h3>
          <p>Browse our catalog to discover and add wines you love.</p>
          <Link to="/wines" className="btn btn--primary btn--large" style={{ marginTop: '1.5rem' }}>
            Browse Catalog →
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* ── Left: Cart Items ── */}
          <div>
            <div className="section-panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--gray-100)' }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
                  Your Selections
                </h3>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Wine</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Subtotal</th>
                      <th style={{ width: 50 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                              width: 40, height: 48,
                              borderRadius: 8,
                              background: item.wine.color === 'red'
                                ? 'linear-gradient(160deg, #4a1420, #8a2038)'
                                : item.wine.color === 'rose'
                                ? 'linear-gradient(160deg, #5a1530, #c4517a)'
                                : item.wine.color === 'white'
                                ? 'linear-gradient(160deg, #5a4418, #c09848)'
                                : 'linear-gradient(160deg, #5a2810, #c86030)',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.1rem',
                            }}>
                              🍷
                            </div>
                            <div>
                              <div style={{ fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9rem' }}>{item.wine.name}</div>
                              <div className="text-muted text-xs" style={{ marginTop: 2 }}>
                                {item.wine.region} · {item.wine.vintage}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600, color: 'var(--gray-700)' }}>₪{item.wine.price.toFixed(2)}</td>
                        <td>
                          <div className="qty-control">
                            <button onClick={() => updateItem(item.id, { quantity: item.quantity - 1 })}>−</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateItem(item.id, { quantity: item.quantity + 1 })}>+</button>
                          </div>
                        </td>
                        <td style={{ fontWeight: 800, color: 'var(--wine-700)', fontSize: '1rem' }}>
                          ₪{(item.wine.price * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <button
                            onClick={() => removeItem(item.id)}
                            title="Remove"
                            style={{
                              width: 28, height: 28,
                              border: 'none',
                              background: 'var(--danger-50)',
                              color: 'var(--danger-500)',
                              borderRadius: 6,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.8rem',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-500)';
                              (e.currentTarget as HTMLButtonElement).style.color = 'white';
                            }}
                            onMouseLeave={(e) => {
                              (e.currentTarget as HTMLButtonElement).style.background = 'var(--danger-50)';
                              (e.currentTarget as HTMLButtonElement).style.color = 'var(--danger-500)';
                            }}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Group Order Enrollment ── */}
            <div className="section-panel" style={{ marginTop: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-lg)' }}>
                <div style={{
                  width: 40, height: 40,
                  background: 'var(--wine-50)',
                  border: '1px solid var(--wine-100)',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                }}>🤝</div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>Join a Group Order</h3>
                  <p className="text-muted text-sm" style={{ marginTop: 2 }}>
                    Select a shipping site to join its active group order
                  </p>
                </div>
              </div>

              <div className="form-group" style={{ maxWidth: 400, marginBottom: 'var(--space-md)' }}>
                <label>Shipping Site</label>
                <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
                  <option value="">Select a shipping site...</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>{site.name} — {site.city}</option>
                  ))}
                </select>
              </div>

              {selectedSiteId && !openGroupOrder && (
                <div className="info-box info-box--warning">
                  No open group order at this site right now. Check back later or select another site.
                </div>
              )}

              {openGroupOrder && (
                <div>
                  <div className="info-box info-box--success" style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.1rem' }}>✅</span>
                    <div>
                      <strong>Open group order found!</strong>
                      <span className="text-sm" style={{ marginLeft: 8 }}>
                        {openGroupOrder.participants.length} participant{openGroupOrder.participants.length !== 1 ? 's' : ''} already enrolled
                      </span>
                    </div>
                  </div>
                  <button className="btn btn--success" disabled={enrolling} onClick={handleEnroll} style={{ minWidth: 180 }}>
                    {enrolling ? 'Enrolling...' : '✓ Enroll & Submit Order'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="order-summary-panel">
            <div className="order-summary-header">
              <h3>Order Summary</h3>
            </div>
            <div className="order-summary-body">
              {cart.items.map((item) => (
                <div key={item.id} className="order-summary-row">
                  <span className="row-label" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.wine.name} ×{item.quantity}
                  </span>
                  <span className="row-value">₪{(item.wine.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}

              <div className="order-summary-row total">
                <span>Total</span>
                <span>₪{cart.totalPrice.toFixed(2)}</span>
              </div>

              <div style={{ marginTop: 'var(--space-lg)', padding: 'var(--space-md)', background: 'var(--gray-50)', borderRadius: 'var(--radius-sm)', fontSize: '0.82rem', color: 'var(--gray-500)', lineHeight: 1.6 }}>
                Final price confirmed upon group order enrollment. Shipping calculated at checkout.
              </div>

              <Link
                to="/wines"
                className="btn btn--secondary"
                style={{ width: '100%', marginTop: 'var(--space-md)', justifyContent: 'center' }}
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
