import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

const BrandMark = () => (
  <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="wm-bg" cx="40%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#7a1a2e"/>
        <stop offset="100%" stopColor="#220810"/>
      </radialGradient>
      <linearGradient id="wm-gold" x1="4" y1="4" x2="34" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#d4a840"/>
        <stop offset="40%" stopColor="#f0d878"/>
        <stop offset="100%" stopColor="#b8892a"/>
      </linearGradient>
      <linearGradient id="wm-wine" x1="19" y1="14" x2="19" y2="22" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#6b0f20" stopOpacity="0.5"/>
        <stop offset="100%" stopColor="#3d0610" stopOpacity="0.85"/>
      </linearGradient>
    </defs>
    {/* Background */}
    <circle cx="19" cy="19" r="18.5" fill="url(#wm-bg)"/>
    {/* Outer gold ring */}
    <circle cx="19" cy="19" r="17.8" stroke="url(#wm-gold)" strokeWidth="0.9"/>
    {/* Inner decorative ring */}
    <circle cx="19" cy="19" r="15.2" stroke="rgba(212,168,64,0.18)" strokeWidth="0.5"/>
    {/* Glass bowl — wide elegant Burgundy shape */}
    <path d="M11 7.5 L27 7.5 C27 7.5 25 17 21.5 19.5 Q20.2 20.5 19 20.5 Q17.8 20.5 16.5 19.5 C13 17 11 7.5 11 7.5 Z" fill="rgba(255,255,255,0.86)"/>
    {/* Wine fill — deep claret in lower bowl */}
    <path d="M13.2 15 C13 17.2 14.8 19.8 16.5 19.5 Q17.8 20.5 19 20.5 Q20.2 20.5 21.5 19.5 C23.2 19.8 25 17.2 24.8 15 Z" fill="url(#wm-wine)"/>
    {/* Glass highlight / shine */}
    <path d="M13.5 9.5 L14.5 14.5" stroke="rgba(255,255,255,0.38)" strokeWidth="0.7" strokeLinecap="round"/>
    {/* Stem */}
    <rect x="18.2" y="20.5" width="1.6" height="7.5" rx="0.8" fill="rgba(255,255,255,0.8)"/>
    {/* Base */}
    <path d="M14 29.5 Q19 28.5 24 29.5" stroke="rgba(255,255,255,0.72)" strokeWidth="1.7" strokeLinecap="round" fill="none"/>
    {/* Three tiny gold dots at top — classic medallion accent */}
    <circle cx="19" cy="4.5" r="0.7" fill="rgba(212,168,64,0.7)"/>
    <circle cx="16.8" cy="5.2" r="0.45" fill="rgba(212,168,64,0.4)"/>
    <circle cx="21.2" cy="5.2" r="0.45" fill="rgba(212,168,64,0.4)"/>
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
  const { t } = useTranslation();

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
        {t('nav.catalog')}
      </Link>
      {user && (
        <Link to="/group-orders" className={isActive('/group-orders') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
          {t('nav.groupOrders')}
        </Link>
      )}
      {user && (
        <Link to="/my-orders" className={isActive('/my-orders') ? 'active' : ''} onClick={() => setMenuOpen(false)}>
          {t('nav.myOrders')}
        </Link>
      )}
      {isAdminOrSuper && (
        <Link to="/admin" className={isActive('/admin') ? 'active' : ''} style={{ position: 'relative' }} onClick={() => setMenuOpen(false)}>
          {t('nav.admin')}
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
          {t('nav.requestRole')}
        </Link>
      )}
    </>
  );

  return (
    <nav className="main-nav">
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/wines" className="nav-brand">
          <div className="brand-icon">
            <BrandMark />
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
            {t('nav.cart')}
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
              {t('nav.signOut')}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="nav-signin-btn"
            onClick={() => setMenuOpen(false)}
          >
            {t('nav.signIn')}
          </Link>
        )}

        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={18} /> : <Menu size={18} />}
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
                {t('nav.signOut')}
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
