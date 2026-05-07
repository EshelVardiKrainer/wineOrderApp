import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { IWishlistItem } from '@wine-order-app/shared-types';
import { wishlistApi } from '../api/client';
import { useCartStore } from '../stores/cart.store';
import { useToast } from '../components/Toast';
import { Heart, ShoppingCart } from 'lucide-react';
import { StarRating } from '../components/StarRating';

const WINE_META: Record<string, { dot: string; label: string }> = {
  red:    { dot: '#8a2038', label: 'Red Wine' },
  rose:   { dot: '#c4517a', label: 'Rosé' },
  white:  { dot: '#c09848', label: 'White Wine' },
  orange: { dot: '#c86030', label: 'Orange Wine' },
};

export function WishlistPage() {
  const [items, setItems] = useState<IWishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<string | null>(null);
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();

  useEffect(() => {
    wishlistApi.getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (wineId: string) => {
    setRemovingId(wineId);
    try {
      await wishlistApi.remove(wineId);
      setItems((prev) => prev.filter((i) => i.wineId !== wineId));
      toast('Removed from wishlist', 'info');
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (wineId: string) => {
    setAddingId(wineId);
    try {
      await addItem({ wineId, quantity: 1 });
      toast('Added to cart');
    } finally {
      setTimeout(() => setAddingId(null), 700);
    }
  };

  return (
    <div className="animate-in">
      <div className="wishlist-hero">
        <h1><Heart size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />My Wishlist</h1>
        <p>{items.length} saved wine{items.length !== 1 ? 's' : ''}</p>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gray-400)' }}>Loading…</div>
      )}

      {!loading && items.length === 0 && (
        <div className="empty-state" style={{ marginTop: '3rem' }}>
          <span className="empty-state-icon"><Heart size={40} strokeWidth={1.5} /></span>
          <h3>Your wishlist is empty</h3>
          <p>Save wines you love by clicking the heart icon on any wine.</p>
          <Link to="/wines" className="btn btn--primary" style={{ marginTop: '1rem' }}>Browse Catalog</Link>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="wishlist-grid">
          {items.map(({ wineId, wine }) => (
            <div key={wineId} className="wine-card">
              <div className={`wine-card-image wine-card-image--${wine.color}`}>
                {wine.imageUrl
                  ? <img src={wine.imageUrl} alt={wine.name} className="wine-card-photo"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                    />
                  : null
                }
                {WINE_META[wine.color] && (
                  <span className="wine-card-image-label">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: WINE_META[wine.color].dot, display: 'inline-block', border: '1px solid rgba(255,255,255,0.5)' }} />
                    {WINE_META[wine.color].label}
                  </span>
                )}
                <button
                  className="wine-card-wishlist wine-card-wishlist--active"
                  onClick={() => handleRemove(wineId)}
                  disabled={removingId === wineId}
                  aria-label="Remove from wishlist"
                >
                  <Heart size={14} fill="currentColor" />
                </button>
              </div>

              <div className="wine-card-body">
                <Link to={`/wines/${wineId}`} className="wine-card-name-link"><h3>{wine.name}</h3></Link>
                <p className="region">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                  </svg>
                  {wine.region} · <span className="vintage">{wine.vintage}</span>
                </p>
                {wine.reviewCount > 0 && (
                  <div className="wine-card-rating">
                    <StarRating value={Math.round(wine.avgRating)} size={12} />
                    <span className="wine-card-rating-text">{wine.avgRating.toFixed(1)} ({wine.reviewCount})</span>
                  </div>
                )}
                <p className="price">₪{wine.price.toFixed(2)}</p>

                <div className="wine-card-footer">
                  <span className="wine-stock" style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    color: wine.stock > 10 ? 'var(--success-700)' : wine.stock > 0 ? 'var(--warning-700)' : 'var(--danger-700)',
                    fontWeight: 600,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: wine.stock > 10 ? 'var(--success-500)' : wine.stock > 0 ? 'var(--warning-500)' : 'var(--danger-500)', display: 'inline-block' }} />
                    {wine.stock > 0 ? `${wine.stock} in stock` : 'Out of stock'}
                  </span>
                  {wine.stock > 0 && (
                    <button
                      className="btn btn--primary btn--small"
                      onClick={() => handleAddToCart(wineId)}
                      disabled={addingId === wineId}
                      style={addingId === wineId ? { background: 'var(--success-700)', boxShadow: 'none' } : {}}
                    >
                      {addingId === wineId
                        ? <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added</>
                        : <><ShoppingCart size={12} /> Add to Cart</>
                      }
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
