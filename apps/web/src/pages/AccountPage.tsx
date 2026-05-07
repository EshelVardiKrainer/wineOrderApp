import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { wishlistApi, reviewsApi } from '../api/client';
import { Heart, ShoppingBag, Users, Star, LogOut, ChevronRight } from 'lucide-react';
import type { IWishlistItem, IWineReview } from '@wine-order-app/shared-types';

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  SUPER_ADMIN: { label: 'Super Admin', color: 'var(--wine-700)',    bg: 'var(--wine-50)' },
  ADMIN:       { label: 'Admin',       color: 'var(--info-700)',    bg: 'var(--info-50)' },
  RETAIL:      { label: 'Retail',      color: 'var(--success-700)', bg: 'var(--success-50)' },
  CUSTOMER:    { label: 'Customer',    color: 'var(--gray-600)',    bg: 'var(--gray-100)' },
};

function Avatar({ name, size = 72 }: { name: string; size?: number }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, var(--wine-700), var(--wine-950))',
      color: 'rgba(255,255,255,0.95)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.33, fontWeight: 700, letterSpacing: '0.04em',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function StatCard({ icon, label, value, to }: { icon: React.ReactNode; label: string; value: number | string; to: string }) {
  return (
    <Link to={to} className="account-stat-card">
      <div className="account-stat-icon">{icon}</div>
      <div className="account-stat-value">{value}</div>
      <div className="account-stat-label">{label}</div>
    </Link>
  );
}

export function AccountPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [wishlist, setWishlist] = useState<IWishlistItem[]>([]);
  const [recentReviews, setRecentReviews] = useState<(IWineReview & { wineName: string; wineId: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      wishlistApi.getAll(),
    ]).then(([wl]) => {
      setWishlist(wl);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  const role = ROLE_LABEL[user.role] ?? ROLE_LABEL.CUSTOMER;
  const joinedDate = new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long' });

  return (
    <div className="animate-in">
      {/* ── Profile Header ── */}
      <div className="account-hero">
        <div className="account-hero-inner">
          <Avatar name={user.name} size={80} />
          <div className="account-hero-info">
            <h1 className="account-name">{user.name}</h1>
            <p className="account-email">{user.email}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
              <span style={{ padding: '3px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 700, background: role.bg, color: role.color }}>
                {role.label}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }}>Member since {joinedDate}</span>
            </div>
          </div>
          <button className="btn btn--ghost btn--small account-signout" onClick={logout}>
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="account-stats">
        <StatCard icon={<Heart size={20} />} label="Wishlist" value={loading ? '…' : wishlist.length} to="/wishlist" />
        <StatCard icon={<ShoppingBag size={20} />} label="My Orders" value="View" to="/my-orders" />
        <StatCard icon={<Users size={20} />} label="Group Orders" value="View" to="/group-orders" />
      </div>

      {/* ── Wishlist Preview ── */}
      {!loading && wishlist.length > 0 && (
        <div className="account-section">
          <div className="account-section-header">
            <h2>Wishlist</h2>
            <Link to="/wishlist" className="account-section-link">See all <ChevronRight size={14} /></Link>
          </div>
          <div className="account-wishlist-preview">
            {wishlist.slice(0, 4).map((item) => (
              <Link key={item.wineId} to={`/wines/${item.wineId}`} className="account-wishlist-item">
                <div className={`account-wishlist-thumb account-wishlist-thumb--${item.wine.color}`}>
                  {item.wine.imageUrl
                    ? <img src={item.wine.imageUrl} alt={item.wine.name} onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    : null
                  }
                </div>
                <div className="account-wishlist-name">{item.wine.name}</div>
                <div className="account-wishlist-price">₪{item.wine.price.toFixed(2)}</div>
              </Link>
            ))}
            {wishlist.length > 4 && (
              <Link to="/wishlist" className="account-wishlist-more">
                +{wishlist.length - 4} more
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── Quick Links ── */}
      <div className="account-section">
        <h2 style={{ marginBottom: 'var(--space-md)' }}>Quick Links</h2>
        <div className="account-links">
          {[
            { to: '/wines',        icon: <Star size={16} />,        label: 'Browse Catalog',  desc: 'Discover and rate wines' },
            { to: '/my-orders',    icon: <ShoppingBag size={16} />, label: 'My Orders',       desc: 'View your order history' },
            { to: '/group-orders', icon: <Users size={16} />,       label: 'Group Orders',    desc: 'Join or manage group orders' },
            { to: '/wishlist',     icon: <Heart size={16} />,       label: 'Wishlist',        desc: `${wishlist.length} saved wine${wishlist.length !== 1 ? 's' : ''}` },
          ].map((link) => (
            <Link key={link.to} to={link.to} className="account-link-card">
              <div className="account-link-icon">{link.icon}</div>
              <div>
                <div className="account-link-label">{link.label}</div>
                <div className="account-link-desc">{link.desc}</div>
              </div>
              <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'var(--gray-400)', flexShrink: 0 }} />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
