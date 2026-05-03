import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user, fetchCart]);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      roleRequestsApi.getPendingCount().then((res) => setPendingCount(res.count)).catch(() => {});
    }
  }, [user, location.pathname]);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

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
          {isAdminOrSuper && (
            <Link to="/admin" className={isActive('/admin') ? 'active' : ''} style={{ position: 'relative' }}>
              Admin
              {user?.role === 'SUPER_ADMIN' && pendingCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: -2,
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '999px',
                  minWidth: '18px',
                  height: '18px',
                  padding: '0 5px',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  lineHeight: 1,
                  animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}>{pendingCount}</span>
              )}
            </Link>
          )}
          {user && user.role === 'CUSTOMER' && (
            <Link
              to="/request-role"
              className={isActive('/request-role') ? 'active' : ''}
            >
              Request Role
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
