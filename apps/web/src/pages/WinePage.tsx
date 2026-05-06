import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { IWine } from '@wine-order-app/shared-types';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useTranslation } from 'react-i18next';
import { Wine as WineIcon, MapPin, Calendar, ShoppingCart, CheckCircle, XCircle, Frown } from 'lucide-react';

const COLOR_BADGE: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  red:    { bg: '#fde8e8', text: '#b91c1c', dot: '#8a2038', label: 'Red' },
  rose:   { bg: '#fce7f3', text: '#be185d', dot: '#c4517a', label: 'Rosé' },
  white:  { bg: '#f0fdf4', text: '#15803d', dot: '#c09848', label: 'White' },
  orange: { bg: '#fff7ed', text: '#c2410c', dot: '#c86030', label: 'Orange' },
};

export function WinePage() {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [wine, setWine] = useState<IWine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) {
      navigate('/wines');
      return;
    }

    const fetchWine = async () => {
      try {
        setLoading(true);
        setError(null);
        const wineData = await api.get<IWine>(`/wines/${id}`);
        setWine(wineData);
      } catch (err: any) {
        setError(err.message || 'Failed to load wine');
        console.error('Error fetching wine:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchWine();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!wine) return;
    
    try {
      setAddingToCart(true);
      await addItem({ wineId: wine.id, quantity });
      // Show success feedback for a moment
      setTimeout(() => setAddingToCart(false), 1000);
    } catch (err) {
      setAddingToCart(false);
      console.error('Error adding to cart:', err);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    if (wine && newQuantity > wine.stock) return;
    setQuantity(newQuantity);
  };

  if (loading) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--wine-400)' }}><WineIcon size={40} strokeWidth={1.5} /></div>
        <p>{t('wine.loading')}</p>
      </div>
    );
  }

  if (error || !wine) {
    return (
      <div className="animate-in" style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--gray-400)' }}><Frown size={40} strokeWidth={1.5} /></div>
        <h2>{t('wine.notFound')}</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          {error || t('wine.notFoundDesc')}
        </p>
        <Link to="/wines" className="btn btn--primary">
          ← {t('wine.backToCatalog')}
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/wines"
          className="btn btn--secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          ← {t('wine.backToCatalog')}
        </Link>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Image Section */}
        <div style={{ textAlign: 'center' }}>
          {wine.imageUrl ? (
            <img
              src={wine.imageUrl}
              alt={wine.name}
              style={{
                width: '100%',
                maxWidth: '300px',
                height: 'auto',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.removeAttribute('style');
              }}
            />
          ) : null}
          <div
            style={{
              display: wine.imageUrl ? 'none' : 'flex',
              width: '100%',
              maxWidth: '300px',
              height: 'clamp(300px, 50vw, 400px)',
              backgroundColor: '#f3f4f6',
              borderRadius: '0.5rem',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              margin: '0 auto',
            }}
          >
            <WineIcon size={64} strokeWidth={1} />
          </div>
        </div>

        {/* Details Section */}
        <div>
          {/* Color Badge */}
          {COLOR_BADGE[wine.color] && (
            <span
              className="color-badge"
              style={{
                background: COLOR_BADGE[wine.color].bg,
                color: COLOR_BADGE[wine.color].text,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: '1rem',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLOR_BADGE[wine.color].dot, display: 'inline-block' }} />
              {COLOR_BADGE[wine.color].label}
            </span>
          )}

          {/* Wine Name */}
          <h1 style={{ 
            fontSize: 'clamp(1.75rem, 5vw, 2.5rem)', 
            marginBottom: '1rem', 
            lineHeight: '1.2',
            textAlign: 'center'
          }}>
            {wine.name}
          </h1>

          {/* Region and Vintage */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            gap: '1rem', 
            marginBottom: '1.5rem',
            fontSize: 'clamp(1rem, 3vw, 1.125rem)',
            color: '#6b7280',
            flexWrap: 'wrap'
          }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={14} /> {wine.region}</span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={14} /> {wine.vintage}</span>
          </div>

          {/* Price */}
          <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            <span style={{ 
              fontSize: 'clamp(1.5rem, 5vw, 2rem)', 
              fontWeight: 'bold', 
              color: '#059669' 
            }}>
              ₪{wine.price.toFixed(2)}
            </span>
          </div>

          {/* Stock */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <span 
              style={{ 
                color: wine.stock > 0 ? '#059669' : '#dc2626',
                fontWeight: '500',
                fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
              }}
            >
              {wine.stock > 0
                ? <><CheckCircle size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />{wine.stock} in stock</>
                : <><XCircle size={15} style={{ verticalAlign: 'middle', marginRight: 4 }} />Out of stock</>
              }
            </span>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>{t('wine.description')}</h3>
            <p style={{ 
              lineHeight: '1.6', 
              color: '#374151',
              fontSize: '1rem'
            }}>
              {wine.description}
            </p>
          </div>

          {/* Quantity Selector */}
          {user && wine.stock > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                {t('wine.quantity')}
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="btn btn--secondary"
                    style={{ 
                      padding: '0.5rem 0.75rem',
                      fontSize: '1.25rem',
                      lineHeight: '1',
                      minWidth: '2.5rem'
                    }}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={wine.stock}
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                    style={{
                      width: '4rem',
                      textAlign: 'center',
                      padding: '0.5rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '0.375rem',
                      fontSize: '1rem'
                    }}
                  />
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= wine.stock}
                    className="btn btn--secondary"
                    style={{ 
                      padding: '0.5rem 0.75rem',
                      fontSize: '1.25rem',
                      lineHeight: '1',
                      minWidth: '2.5rem'
                    }}
                  >
                    +
                  </button>
                </div>
                <span style={{
                  color: '#6b7280',
                  fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                  whiteSpace: 'nowrap'
                }}>
                  {t('wine.max', { count: wine.stock })}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          {user && wine.stock > 0 && (
            <div style={{ 
              display: 'flex', 
              gap: '1rem', 
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="btn btn--primary"
                style={{ 
                  fontSize: 'clamp(1rem, 2.5vw, 1.125rem)', 
                  padding: '0.75rem 1.5rem',
                  minWidth: '200px'
                }}
              >
                {addingToCart
                  ? <><CheckCircle size={16} style={{ marginRight: 6 }} />{t('wine.addedToCart')}</>
                  : <><ShoppingCart size={16} style={{ marginRight: 6 }} />{t('wine.addToCart', { count: quantity })}</>
                }
              </button>
              <Link to="/cart" className="btn btn--secondary">
                {t('wine.viewCart')}
              </Link>
            </div>
          )}

          {!user && (
            <div style={{ 
              padding: '1.5rem', 
              backgroundColor: '#f9fafb', 
              borderRadius: '0.5rem',
              border: '1px solid #e5e7eb'
            }}>
              <p style={{ marginBottom: '1rem' }}>
                <Link to="/login" style={{ color: '#2563eb', textDecoration: 'underline' }}>
                  {t('nav.login')}
                </Link>{' '}{t('wine.signInToOrder')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}