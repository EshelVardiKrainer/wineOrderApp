import { useEffect, useState } from 'react';
import type { IWineListResponse, IWine, WineColor } from '@wine-order-app/shared-types';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';

const COLOR_OPTIONS: { value: WineColor | ''; label: string; emoji: string }[] = [
  { value: '', label: 'All', emoji: '🍷' },
  { value: 'red', label: 'Red', emoji: '🌹' },
  { value: 'rose', label: 'Rosé', emoji: '🦩' },
  { value: 'white', label: 'White', emoji: '⚪️' },
  { value: 'orange', label: 'Orange', emoji: '🐅' },
];

const COLOR_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  red: { bg: '#fde8e8', text: '#b91c1c', label: '🌹 אדום' },
  rose: { bg: '#fce7f3', text: '#be185d', label: '🦩 רוזה' },
  white: { bg: '#f0fdf4', text: '#15803d', label: '⚪️ לבן' },
  orange: { bg: '#fff7ed', text: '#c2410c', label: '🐅 כתום' },
};

export function WineCatalogPage() {
  const [wines, setWines] = useState<IWine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [color, setColor] = useState<WineColor | ''>('');
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);

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

  useEffect(() => {
    fetchWines();
  }, [page, search, region, color]);

  const handleAddToCart = async (wine: IWine) => {
    await addItem({ wineId: wine.id, quantity: 1 });
  };

  return (
    <>
      <h1>🍷 Wine Catalog</h1>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`btn btn--small ${color === opt.value ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => { setColor(opt.value); setPage(1); }}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search wines..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <input
          type="text"
          placeholder="Filter by region..."
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setPage(1);
          }}
        />
        <span style={{ alignSelf: 'center', color: '#888' }}>
          {total} wine{total !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="wine-grid">
        {wines.map((wine) => (
          <div key={wine.id} className="wine-card">
            {COLOR_BADGE[wine.color] && (
              <span style={{
                display: 'inline-block',
                background: COLOR_BADGE[wine.color].bg,
                color: COLOR_BADGE[wine.color].text,
                padding: '2px 10px',
                borderRadius: 12,
                fontSize: '0.8rem',
                fontWeight: 600,
                marginBottom: 6,
              }}>
                {COLOR_BADGE[wine.color].label}
              </span>
            )}
            <h3>{wine.name}</h3>
            <p className="region">
              {wine.region} · <span className="vintage">{wine.vintage}</span>
            </p>
            <p className="price">₪{wine.price.toFixed(2)}</p>
            <p style={{ fontSize: '0.85rem', color: '#666' }}>
              {wine.description}
            </p>
            <p style={{ fontSize: '0.8rem', color: '#999' }}>
              {wine.stock} in stock
            </p>
            {user && (
              <button
                className="btn btn--primary btn--small"
                onClick={() => handleAddToCart(wine)}
              >
                Add to Cart
              </button>
            )}
          </div>
        ))}
      </div>

      {wines.length === 0 && (
        <p style={{ textAlign: 'center', color: '#888', marginTop: '2rem' }}>
          No wines found. Try adjusting your filters.
        </p>
      )}

      {total > 20 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <button
            className="btn btn--secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span style={{ alignSelf: 'center' }}>
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            className="btn btn--secondary"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}
