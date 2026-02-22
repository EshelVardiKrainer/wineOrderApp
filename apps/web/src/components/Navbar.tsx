import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useEffect } from 'react';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <nav className="main-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        <Link to="/wines" className="nav-brand">
          🍷 Wine Market
        </Link>
        <div className="nav-links">
          <Link to="/wines" className={isActive('/wines') ? 'active' : ''}>
            Catalog
          </Link>
          {user && (
            <Link
              to="/group-orders"
              className={isActive('/group-orders') ? 'active' : ''}
            >
              Group Orders
            </Link>
          )}
          {user && (
            <Link
              to="/my-orders"
              className={isActive('/my-orders') ? 'active' : ''}
            >
              My Orders
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''}>
              Admin
            </Link>
          )}
        </div>
      </div>
      <div className="nav-right">
        {user && (
          <Link to="/cart" className={isActive('/cart') ? 'active' : ''}>
            🛒 Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        )}
        {user ? (
          <div className="nav-user">
            <span className="nav-user-name">{user.name}</span>
            <button
              className="btn btn--ghost btn--small"
              style={{ color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.15)' }}
              onClick={logout}
            >
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}
