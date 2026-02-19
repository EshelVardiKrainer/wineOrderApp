import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useEffect } from 'react';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  return (
    <nav className="main-nav">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/wines" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
          🍷 Wine Market
        </Link>
        <Link to="/wines">Catalog</Link>
        {user && <Link to="/group-orders">Group Orders</Link>}
        {user && <Link to="/my-orders">My Orders</Link>}
        {user?.role === 'ADMIN' && <Link to="/admin">Admin</Link>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user && (
          <Link to="/cart">
            🛒 Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        )}
        {user ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', opacity: 0.8 }}>
              {user.name} ({user.role})
            </span>
            <button className="btn btn--secondary btn--small" onClick={logout}>
              Logout
            </button>
          </span>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
