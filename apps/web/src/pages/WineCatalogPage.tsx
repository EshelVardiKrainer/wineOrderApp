import { useEffect, useState } from 'react';
import type { IWineListResponse, IWine } from '@wine-order-app/shared-types';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';

export function WineCatalogPage() {
  const [wines, setWines] = useState<IWine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('');
  const user = useAuthStore((s) => s.user);
  const addItem = useCartStore((s) => s.addItem);

  const fetchWines = async () => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', '20');
    if (search) params.set('search', search);
    if (region) params.set('region', region);

    const res = await api.get<IWineListResponse>(`/wines?${params}`);
    setWines(res.items);
    setTotal(res.total);
  };

  useEffect(() => {
    fetchWines();
  }, [page, search, region]);

  const handleAddToCart = async (wine: IWine) => {
    await addItem({ wineId: wine.id, quantity: 1 });
  };

  return (
    <>
      <h1>🍷 Wine Catalog</h1>

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
            <h3>{wine.name}</h3>
            <p className="region">
              {wine.region} · <span className="vintage">{wine.vintage}</span>
            </p>
            <p className="price">${wine.price.toFixed(2)}</p>
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
