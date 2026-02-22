import { useEffect, useState } from 'react';
import type { IWineListResponse, IWine, WineColor } from '@wine-order-app/shared-types';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';

const COLOR_OPTIONS: { value: WineColor | ''; label: string; emoji: string }[] = [
  { value: '', label: 'All Wines', emoji: '🍷' },
  { value: 'red', label: 'Red', emoji: '🌹' },
  { value: 'rose', label: 'Rosé', emoji: '🦩' },
  { value: 'white', label: 'White', emoji: '⚪️' },
  { value: 'orange', label: 'Orange', emoji: '🐅' },
];

const COLOR_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  red: { bg: '#fde8e8', text: '#b91c1c', label: '🌹 Red' },
  rose: { bg: '#fce7f3', text: '#be185d', label: '🦩 Rosé' },
  white: { bg: '#f0fdf4', text: '#15803d', label: '⚪️ White' },
  orange: { bg: '#fff7ed', text: '#c2410c', label: '🐅 Orange' },
};

export function WineCatalogPage() {
  const [wines, setWines] = useState<IWine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const [color, setColor] = useState<WineColor | ''>('');
  const [addingId, setAddingId] = useState<string | null>(null);
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
    setAddingId(wine.id);
    await addItem({ wineId: wine.id, quantity: 1 });
    setTimeout(() => setAddingId(null), 600);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>Wine Catalog</h1>
        <p>Explore our curated collection of fine wines</p>
      </div>

      <div className="filter-pills">
        {COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`filter-pill ${color === opt.value ? 'filter-pill--active' : ''}`}
            onClick={() => { setColor(opt.value); setPage(1); }}
          >
            {opt.emoji} {opt.label}
          </button>
        ))}
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="🔍  Search wines..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <input
          type="text"
          placeholder="📍  Filter by region..."
          value={region}
          onChange={(e) => { setRegion(e.target.value); setPage(1); }}
        />
        <span className="text-muted text-sm" style={{ marginLeft: 'auto' }}>
          {total} wine{total !== 1 ? 's' : ''} found
        </span>
      </div>

      <div className="wine-grid stagger">
        {wines.map((wine) => (
          <div key={wine.id} className="wine-card">
            {COLOR_BADGE[wine.color] && (
              <span
                className="color-badge"
                style={{
                  background: COLOR_BADGE[wine.color].bg,
                  color: COLOR_BADGE[wine.color].text,
                  marginBottom: 8,
                  alignSelf: 'flex-start',
                }}
              >
                {COLOR_BADGE[wine.color].label}
              </span>
            )}
            <h3>{wine.name}</h3>
            <p className="region">
              {wine.region} · <span className="vintage">{wine.vintage}</span>
            </p>
            <p className="price">₪{wine.price.toFixed(2)}</p>
            <p className="wine-description">{wine.description}</p>
            <div className="wine-card-footer">
              <span className="wine-stock">
                {wine.stock > 0 ? `${wine.stock} in stock` : 'Out of stock'}
              </span>
              {user && wine.stock > 0 && (
                <button
                  className="btn btn--primary btn--small"
                  onClick={() => handleAddToCart(wine)}
                  disabled={addingId === wine.id}
                >
                  {addingId === wine.id ? '✓ Added' : 'Add to Cart'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {wines.length === 0 && (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <h3>No wines found</h3>
          <p>Try adjusting your search or filters to find what you're looking for.</p>
        </div>
      )}

      {total > 20 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2rem',
          }}
        >
          <button
            className="btn btn--secondary"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Previous
          </button>
          <span className="text-muted text-sm">
            Page {page} of {Math.ceil(total / 20)}
          </span>
          <button
            className="btn btn--secondary"
            disabled={page >= Math.ceil(total / 20)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
