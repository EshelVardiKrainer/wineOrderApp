import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import type { IWineListResponse, IWine, WineColor } from '@wine-order-app/shared-types';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { MapPin, Search, Wine as WineIcon } from 'lucide-react';
import type { ReactNode } from 'react';

const ColorDot = ({ color }: { color: string }) => (
  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
);

const COLOR_OPTIONS: { value: WineColor | ''; label: string; icon: ReactNode }[] = [
  { value: '', label: 'All Wines', icon: <WineIcon size={13} /> },
  { value: 'red', label: 'Red', icon: <ColorDot color="#8a2038" /> },
  { value: 'rose', label: 'Rosé', icon: <ColorDot color="#c4517a" /> },
  { value: 'white', label: 'White', icon: <ColorDot color="#c09848" /> },
  { value: 'orange', label: 'Orange', icon: <ColorDot color="#c86030" /> },
];

const WINE_META: Record<string, { label: string; dot: string }> = {
  red:    { label: 'Red Wine',    dot: '#8a2038' },
  rose:   { label: 'Rosé',       dot: '#c4517a' },
  white:  { label: 'White Wine', dot: '#c09848' },
  orange: { label: 'Orange Wine',dot: '#c86030' },
};

const WineGlass = () => (
  <svg width="60" height="60" viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="wine-card-image-glass">
    <path d="M14 8 L46 8 L39 34 Q36 44 30 44 Q24 44 21 34 Z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
    <path d="M21 34 Q24 44 30 44 Q36 44 39 34 L37 28 Q34 38 30 38 Q26 38 23 28 Z" fill="rgba(255,255,255,0.12)"/>
    <rect x="27" y="44" width="6" height="24" fill="rgba(255,255,255,0.3)" rx="3"/>
    <rect x="20" y="68" width="20" height="4" rx="2" fill="rgba(255,255,255,0.35)"/>
    <ellipse cx="30" cy="22" rx="9" ry="5" fill="rgba(255,255,255,0.1)"/>
  </svg>
);

export function WineCatalogPage() {
  const [wines, setWines] = useState<IWine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [color, setColor] = useState<WineColor | ''>('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [regionOpen, setRegionOpen] = useState(false);
  const regionRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (regionRef.current && !regionRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    };
    const onScroll = () => setRegionOpen(false);
    document.addEventListener('mousedown', handler);
    document.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('scroll', onScroll, true);
    };
  }, []);

  useEffect(() => {
    api.get<IWineListResponse>('/wines?limit=100').then((res) => {
      const unique = Array.from(new Set(res.items.map((w) => w.region))).sort();
      setRegions(unique);
    });
  }, []);

  const fetchWines = async () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (region) params.set('region', region);
    if (color) params.set('color', color);
    const res = await api.get<IWineListResponse>(`/wines?${params}`);
    setWines(res.items);
    setTotal(res.total);
  };

  useEffect(() => { fetchWines(); }, [page, search, region, color]);

  const getQty = (id: string) => quantities[id] ?? 1;
  const setQty = (id: string, val: number) =>
    setQuantities((q) => ({ ...q, [id]: Math.max(1, Math.min(val, 99)) }));

  const handleAddToCart = async (wine: IWine) => {
    setAddingId(wine.id);
    await addItem({ wineId: wine.id, quantity: getQty(wine.id) });
    setTimeout(() => setAddingId(null), 700);
  };

  return (
    <div className="animate-in">
      {/* ── Hero Banner ── */}
      <div className="catalog-hero">
        <div className="catalog-hero-inner">
          <h1>Our <em>Wine</em> Collection</h1>
          <p>Discover exceptional bottles from the world's finest regions, curated for discerning palates.</p>
          <div className="catalog-hero-controls">
            <input
              className="catalog-hero-input"
              type="text"
              placeholder="Search by name, producer, style..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
            <div ref={regionRef} className="region-dropdown">
              <button
                type="button"
                className="catalog-hero-input region-dropdown-trigger"
                onClick={() => setRegionOpen((o) => !o)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, flex: 1 }}>
                  <MapPin size={14} style={{ flexShrink: 0, opacity: 0.7 }} />
                  {region || 'All regions'}
                </span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, flexShrink: 0, transform: regionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {regionOpen && (
                <div className="region-dropdown-menu">
                  {[{ value: '', label: 'All regions' }, ...regions.map((r) => ({ value: r, label: r }))].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`region-dropdown-item${region === opt.value ? ' region-dropdown-item--active' : ''}`}
                      onClick={() => { setRegion(opt.value); setPage(1); setRegionOpen(false); }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="catalog-hero-count">
              {total} wine{total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* ── Color Filter Pills ── */}
      <div className="filter-pills">
        {COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-pill ${color === opt.value ? 'filter-pill--active' : ''}`}
            onClick={() => { setColor(opt.value); setPage(1); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>

      {/* ── Wine Grid ── */}
      <div className="wine-grid stagger">
        {wines.map((wine) => (
          <div key={wine.id} className="wine-card">
            <div className={`wine-card-image wine-card-image--${wine.color}`}>
              {wine.imageUrl
                ? <img src={wine.imageUrl} alt={wine.name} className="wine-card-photo" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                : <WineGlass />
              }
              {WINE_META[wine.color] && (
                <span className="wine-card-image-label">
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: WINE_META[wine.color].dot,
                    display: 'inline-block',
                    border: '1px solid rgba(255,255,255,0.5)',
                  }}/>
                  {WINE_META[wine.color].label}
                </span>
              )}
            </div>

            <div className="wine-card-body">
              <Link to={`/wines/${wine.id}`} className="wine-card-name-link"><h3>{wine.name}</h3></Link>
              <p className="region">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                </svg>
                {wine.region} ·{' '}
                <span className="vintage">{wine.vintage}</span>
              </p>
              <p className="price">₪{wine.price.toFixed(2)}</p>
              <p className="wine-description">{wine.description}</p>

              <div className="wine-card-footer">
                <span className="wine-stock" style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  color: wine.stock > 10 ? 'var(--success-700)' : wine.stock > 0 ? 'var(--warning-700)' : 'var(--danger-700)',
                  fontWeight: 600,
                }}>
                  <span style={{
                    width: 6, height: 6,
                    borderRadius: '50%',
                    background: wine.stock > 10 ? 'var(--success-500)' : wine.stock > 0 ? 'var(--warning-500)' : 'var(--danger-500)',
                    display: 'inline-block',
                  }}/>
                  {wine.stock > 0 ? `${wine.stock} in stock` : 'Out of stock'}
                </span>
                {user && wine.stock > 0 && (
                  <div className="wine-card-add-row">
                    <div className="qty-control qty-control--sm">
                      <button onClick={() => setQty(wine.id, getQty(wine.id) - 1)}>−</button>
                      <span>{getQty(wine.id)}</span>
                      <button onClick={() => setQty(wine.id, getQty(wine.id) + 1)}>+</button>
                    </div>
                    <button
                      className="btn btn--primary btn--small"
                      onClick={() => handleAddToCart(wine)}
                      disabled={addingId === wine.id}
                      style={addingId === wine.id ? { background: 'var(--success-700)', boxShadow: 'none' } : {}}
                    >
                    {addingId === wine.id ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        Added
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                        </svg>
                        Add to Cart
                      </>
                    )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {wines.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon"><Search size={40} strokeWidth={1.5} /></span>
          <h3>No wines found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {total > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }}>
          <button className="btn btn--secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            ← Previous
          </button>
          <span className="text-muted text-sm" style={{ fontWeight: 600 }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button className="btn btn--secondary" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage((p) => p + 1)}>
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
