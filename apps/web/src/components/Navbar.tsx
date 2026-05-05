import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';

const WineGlassIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 2L16 2L14 10C13.5 13 11 14 11 14L11 20L14 20L14 22L10 22L10 20L13 20L13 14C13 14 10.5 13 10 10L8 2Z" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5"/>
    <ellipse cx="12" cy="7" rx="3.5" ry="2" fill="rgba(201,168,76,0.3)"/>
    <rect x="9" y="20" width="6" height="1.5" rx="0.75" fill="rgba(255,255,255,0.7)"/>
  </svg>
);

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const cart = useCartStore((s) => s.cart);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  useEffect(() => {
    if (user?.role === 'SUPER_ADMIN') {
      roleRequestsApi.getPendingCount().then((res) => setPendingCount(res.count)).catch(() => {});
    }
  }, [user, location.pathname]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';

  const navLinks = (
    <>
      <Link to="/wines" className={isActive('/wines') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
        Catalog
      </Link>
      {user && (
        <Link to="/group-orders" className={isActive('/group-orders') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
          Group Orders
        </Link>
      )}
      {user && (
        <Link to="/my-orders" className={isActive('/my-orders') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
          My Orders
        </Link>
      )}
      {isAdminOrSuper && (
        <Link to="/admin" className={isActive('/admin') ? 'active' : ''} style={{ position: 'relative' }} onClick={() => setMenuOpen(false)}>
          Admin
          {user?.role === 'SUPER_ADMIN' && pendingCount > 0 && (
            <span style={{
              position: 'absolute',
              top: 2,
              right: 2,
              background: '#ef4444',
              color: 'white',
              borderRadius: '999px',
              minWidth: '16px',
              height: '16px',
              padding: '0 4px',
              fontSize: '0.6rem',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}>{pendingCount}</span>
          )}
        </Link>
      )}
      {user?.role === 'CUSTOMER' && (
        <Link to="/request-role" className={isActive('/request-role') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
          Request Role
        </Link>
      )}
    </>
  );

  return (
    <nav className="main-nav">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/wines" className="nav-brand">
          <div className="brand-icon">
            <WineGlassIcon />
          </div>
          <div className="brand-text">
            <span>Wine Market</span>
            <span>Fine Wines & Group Orders</span>
          </div>
        </Link>

        <div className="nav-links">
          {navLinks}
        </div>
      </div>

      <div className="nav-right">
        {user && (
          <Link
            to="/cart"
            className={`nav-cart-link ${isActive('/cart') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Cart
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </Link>
        )}

        {user ? (
          <div className="nav-user nav-user--desktop">
            <span className="nav-user-name">{user.name.split(' ')[0]}</span>
            <button
              className="btn btn--ghost btn--small"
              style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.8rem' }}
              onClick={logout}
            >
              Sign out
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="nav-signin-btn"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
        )}

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="nav-mobile-menu">
          {navLinks}
          {user && (
            <div className="nav-mobile-footer">
              <span className="nav-user-name">{user.name.split(' ')[0]}</span>
              <button
                className="btn btn--ghost btn--small"
                style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.8rem' }}
                onClick={() => { logout(); setMenuOpen(false); }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
