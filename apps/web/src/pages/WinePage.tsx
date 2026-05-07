import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { IWine, IWineReview, IWineReviewSummary } from '@wine-order-app/shared-types';
import { api, wishlistApi, reviewsApi } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useTranslation } from 'react-i18next';
import { Wine as WineIcon, MapPin, Calendar, ShoppingCart, CheckCircle, XCircle, Frown, Heart, Trash2 } from 'lucide-react';
import { StarRating } from '../components/StarRating';
import { useToast } from '../components/Toast';

const COLOR_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  red:    { bg: '#fde8e8', text: '#b91c1c', dot: '#8a2038', label: 'Red' },
  rose:   { bg: '#fce7f3', text: '#be185d', dot: '#c4517a', label: 'Rosé' },
  white:  { bg: '#f0fdf4', text: '#15803d', dot: '#c09848', label: 'White' },
  orange: { bg: '#fff7ed', text: '#c2410c', dot: '#c86030', label: 'Orange' },
};

const WineGlassSvg = () => (
  <svg width="100" height="130" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
    <path d="M14 8 L46 8 L39 34 Q36 44 30 44 Q24 44 21 34 Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M21 34 Q24 44 30 44 Q36 44 39 34 L37 28 Q34 38 30 38 Q26 38 23 28 Z" fill="rgba(255,255,255,0.12)"/>
    <rect x="27" y="44" width="6" height="24" fill="rgba(255,255,255,0.3)" rx="3"/>
    <rect x="20" y="68" width="20" height="4" rx="2" fill="rgba(255,255,255,0.35)"/>
    <ellipse cx="30" cy="22" rx="9" ry="5" fill="rgba(255,255,255,0.1)"/>
  </svg>
);

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function ReviewAvatar({ name }: { name: string }) {
  const initials = name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
  return <span className="review-avatar">{initials}</span>;
}

export function WinePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wine, setWine] = useState<IWine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const [inWishlist, setInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);

  const [reviewSummary, setReviewSummary] = useState<IWineReviewSummary | null>(null);
  const [myReview, setMyReview] = useState<IWineReview | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftComment, setDraftComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [deletingReview, setDeletingReview] = useState(false);

  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);
  const toast = useToast();

  useEffect(() => {
    if (!id) { navigate('/wines'); return; }
    const fetch = async () => {
      try {
        setLoading(true);
        setError(null);
        const [wineData, summary] = await Promise.all([
          api.get<IWine>(`/wines/${id}`),
          reviewsApi.getForWine(id),
        ]);
        setWine(wineData);
        setReviewSummary(summary);
      } catch (err: any) {
        setError(err.message || 'Failed to load wine');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  useEffect(() => {
    if (!user || !id) return;
    wishlistApi.getIds().then((ids) => setInWishlist(ids.includes(id))).catch(() => {});
    reviewsApi.getMyReview(id).then((r) => {
      if (r) {
        setMyReview(r);
        setDraftRating(r.rating);
        setDraftComment(r.comment ?? '');
      }
    }).catch(() => {});
  }, [user, id]);

  const handleToggleWishlist = async () => {
    if (!user || !wine || togglingWishlist) return;
    setTogglingWishlist(true);
    try {
      if (inWishlist) {
        await wishlistApi.remove(wine.id);
        setInWishlist(false);
        toast('Removed from wishlist', 'info');
      } else {
        await wishlistApi.add(wine.id);
        setInWishlist(true);
        toast('Added to wishlist');
      }
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleAddToCart = async () => {
    if (!wine) return;
    setAddingToCart(true);
    await addItem({ wineId: wine.id, quantity });
    toast(`Added ${quantity}× ${wine.name} to cart`);
    setTimeout(() => setAddingToCart(false), 1000);
  };

  const handleQuantityChange = (n: number) => {
    if (n < 1) return;
    if (wine && n > wine.stock) return;
    setQuantity(n);
  };

  const handleSubmitReview = async () => {
    if (!id || draftRating === 0) return;
    setSubmittingReview(true);
    try {
      const updated = await reviewsApi.upsert(id, { rating: draftRating, comment: draftComment || undefined });
      setMyReview(updated);
      const summary = await reviewsApi.getForWine(id);
      setReviewSummary(summary);
      if (wine) setWine({ ...wine, avgRating: summary.avgRating, reviewCount: summary.count });
      toast(myReview ? 'Review updated' : 'Review submitted');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!id) return;
    setDeletingReview(true);
    try {
      await reviewsApi.delete(id);
      setMyReview(null);
      setDraftRating(0);
      setDraftComment('');
      const summary = await reviewsApi.getForWine(id);
      setReviewSummary(summary);
      if (wine) setWine({ ...wine, avgRating: summary.avgRating, reviewCount: summary.count });
      toast('Review deleted', 'info');
    } finally {
      setDeletingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <WineIcon size={40} strokeWidth={1.5} style={{ color: 'var(--wine-400)', marginBottom: '1rem' }} />
        <p>{t('wine.loading')}</p>
      </div>
    );
  }

  if (error || !wine) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <Frown size={40} strokeWidth={1.5} style={{ color: 'var(--gray-400)', marginBottom: '1rem' }} />
        <h2>{t('wine.notFound')}</h2>
        <p style={{ color: 'var(--gray-500)', marginBottom: '2rem' }}>{error || t('wine.notFoundDesc')}</p>
        <Link to="/wines" className="btn btn--primary">← {t('wine.backToCatalog')}</Link>
      </div>
    );
  }

  const stockClass = wine.stock > 10 ? '--in' : wine.stock > 0 ? '--low' : '--out';

  return (
    <div className="animate-in">
      <Link to="/wines" className="wine-detail-back">← {t('wine.backToCatalog')}</Link>

      <div className="wine-detail-layout">
        {/* ── Image Column ── */}
        <div className="wine-detail-visual">
          <div className={`wine-detail-image-panel wine-detail-image-panel--${wine.color}`}>
            {wine.imageUrl
              ? <img src={wine.imageUrl} alt={wine.name} className="wine-detail-photo"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
              : (
                <div className="wine-detail-glass-wrap">
                  <div className="wine-detail-color-chip">
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: COLOR_BADGE[wine.color]?.dot || '#888', display: 'inline-block' }} />
                    {COLOR_BADGE[wine.color]?.label ?? wine.color}
                  </div>
                  <WineGlassSvg />
                </div>
              )
            }
          </div>
        </div>

        {/* ── Info Column ── */}
        <div className="wine-detail-info">
          <div className="wine-detail-badges">
            <span className="wine-detail-badge wine-detail-badge--region">
              <MapPin size={11} /> {wine.region}
            </span>
            <span className="wine-detail-badge wine-detail-badge--vintage">
              <Calendar size={11} /> {wine.vintage}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <h1 className="wine-detail-name" style={{ flex: 1 }}>{wine.name}</h1>
            {user && (
              <button
                className={`wine-detail-wishlist-btn${inWishlist ? ' wine-detail-wishlist-btn--active' : ''}`}
                onClick={handleToggleWishlist}
                disabled={togglingWishlist}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart size={18} fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            )}
          </div>

          {wine.reviewCount > 0 && (
            <div className="wine-detail-rating-row">
              <StarRating value={Math.round(wine.avgRating)} size={16} />
              <span className="wine-detail-rating-text">{wine.avgRating.toFixed(1)}</span>
              <span className="wine-detail-rating-count">({wine.reviewCount} review{wine.reviewCount !== 1 ? 's' : ''})</span>
            </div>
          )}

          <div className="wine-detail-price-row">
            <span className="wine-detail-price">₪{wine.price.toFixed(2)}</span>
            <span className={`wine-detail-stock wine-detail-stock${stockClass}`}>
              <span className={`wine-detail-stock-dot wine-detail-stock-dot${stockClass}`} />
              {wine.stock > 10 ? `${wine.stock} in stock` : wine.stock > 0 ? `Only ${wine.stock} left` : 'Out of stock'}
            </span>
          </div>

          <p className="wine-detail-section-label">About this wine</p>
          <p className="wine-detail-description">{wine.description}</p>

          {user && wine.stock > 0 && (
            <>
              <div className="wine-detail-qty-row">
                <button className="wine-detail-qty-btn" onClick={() => handleQuantityChange(quantity - 1)} disabled={quantity <= 1}>−</button>
                <input
                  className="wine-detail-qty-input"
                  type="number" min={1} max={wine.stock}
                  value={quantity}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                />
                <button className="wine-detail-qty-btn" onClick={() => handleQuantityChange(quantity + 1)} disabled={quantity >= wine.stock}>+</button>
                <span className="wine-detail-qty-max">max {wine.stock}</span>
              </div>
              <div className="wine-detail-actions">
                <button
                  className="btn btn--primary"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  style={addingToCart ? { background: 'var(--success-700)', boxShadow: 'none' } : {}}
                >
                  {addingToCart
                    ? <><CheckCircle size={16} style={{ marginRight: 6 }} />{t('wine.addedToCart')}</>
                    : <><ShoppingCart size={16} style={{ marginRight: 6 }} />{t('wine.addToCart', { count: quantity })}</>
                  }
                </button>
                <Link to="/cart" className="btn btn--secondary">{t('wine.viewCart')}</Link>
              </div>
            </>
          )}

          {!user && wine.stock > 0 && (
            <div className="wine-detail-signin-prompt">
              <Link to="/login">{t('nav.login')}</Link>{' '}{t('wine.signInToOrder')}
            </div>
          )}

          {wine.stock === 0 && (
            <div className="wine-detail-signin-prompt" style={{ background: 'var(--danger-50)', borderColor: 'var(--danger-500)', color: 'var(--danger-700)' }}>
              <XCircle size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              This wine is currently out of stock.
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="wine-reviews-section">
        <h2 className="wine-reviews-title">
          Reviews
          {reviewSummary && reviewSummary.count > 0 && (
            <span className="wine-reviews-count">{reviewSummary.count}</span>
          )}
        </h2>

        {user && (
          <div className="review-form-card">
            <p className="review-form-heading">{myReview ? 'Edit your review' : 'Write a review'}</p>
            <div style={{ marginBottom: '0.75rem' }}>
              <StarRating value={draftRating} size={24} interactive onChange={setDraftRating} />
            </div>
            <textarea
              className="review-comment-input"
              placeholder="Share your thoughts about this wine... (optional)"
              value={draftComment}
              onChange={(e) => setDraftComment(e.target.value)}
              rows={3}
            />
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
              <button
                className="btn btn--primary btn--small"
                onClick={handleSubmitReview}
                disabled={draftRating === 0 || submittingReview}
              >
                {submittingReview ? 'Saving…' : myReview ? 'Update Review' : 'Submit Review'}
              </button>
              {myReview && (
                <button
                  className="btn btn--secondary btn--small"
                  onClick={handleDeleteReview}
                  disabled={deletingReview}
                  style={{ color: 'var(--danger-700)' }}
                >
                  <Trash2 size={13} style={{ marginRight: 4 }} />
                  {deletingReview ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        )}

        {reviewSummary && reviewSummary.reviews.length > 0 ? (
          <div className="reviews-list">
            {reviewSummary.reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-item-header">
                  <ReviewAvatar name={review.userName} />
                  <div>
                    <span className="review-author">{review.userName}</span>
                    <StarRating value={review.rating} size={12} />
                  </div>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                {review.comment && <p className="review-comment">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          !user && (
            <p style={{ color: 'var(--gray-500)', fontSize: '0.9rem' }}>No reviews yet. <Link to="/login" style={{ color: 'var(--wine-600)' }}>Sign in</Link> to be the first.</p>
          )
        )}
      </div>
    </div>
  );
}
