import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
const COLOR_OPTIONS = [
    { value: '', label: 'All Wines', emoji: '🍷' },
    { value: 'red', label: 'Red', emoji: '🌹' },
    { value: 'rose', label: 'Rosé', emoji: '🦩' },
    { value: 'white', label: 'White', emoji: '🥂' },
    { value: 'orange', label: 'Orange', emoji: '🍊' },
];
const WINE_META = {
    red: { label: 'Red Wine', dot: '#8a2038' },
    rose: { label: 'Rosé', dot: '#c4517a' },
    white: { label: 'White Wine', dot: '#c09848' },
    orange: { label: 'Orange Wine', dot: '#c86030' },
};
const WineGlass = () => (_jsxs("svg", { width: "60", height: "60", viewBox: "0 0 60 80", fill: "none", xmlns: "http://www.w3.org/2000/svg", className: "wine-card-image-glass", children: [_jsx("path", { d: "M14 8 L46 8 L39 34 Q36 44 30 44 Q24 44 21 34 Z", fill: "rgba(255,255,255,0.35)", stroke: "rgba(255,255,255,0.2)", strokeWidth: "1" }), _jsx("path", { d: "M21 34 Q24 44 30 44 Q36 44 39 34 L37 28 Q34 38 30 38 Q26 38 23 28 Z", fill: "rgba(255,255,255,0.12)" }), _jsx("rect", { x: "27", y: "44", width: "6", height: "24", fill: "rgba(255,255,255,0.3)", rx: "3" }), _jsx("rect", { x: "20", y: "68", width: "20", height: "4", rx: "2", fill: "rgba(255,255,255,0.35)" }), _jsx("ellipse", { cx: "30", cy: "22", rx: "9", ry: "5", fill: "rgba(255,255,255,0.1)" })] }));
export function WineCatalogPage() {
    const [wines, setWines] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [region, setRegion] = useState('');
    const [color, setColor] = useState('');
    const [addingId, setAddingId] = useState(null);
    const [quantities, setQuantities] = useState({});
    const [regions, setRegions] = useState([]);
    const [regionOpen, setRegionOpen] = useState(false);
    const regionRef = useRef(null);
    const user = useAuthStore((s) => s.user);
    const addItem = useCartStore((s) => s.addItem);
    useEffect(() => {
        const handler = (e) => {
            if (regionRef.current && !regionRef.current.contains(e.target)) {
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
        api.get('/wines?limit=100').then((res) => {
            const unique = Array.from(new Set(res.items.map((w) => w.region))).sort();
            setRegions(unique);
        });
    }, []);
    const fetchWines = async () => {
        const params = new URLSearchParams();
        params.set('page', String(page));
        params.set('limit', '20');
        if (search)
            params.set('search', search);
        if (region)
            params.set('region', region);
        if (color)
            params.set('color', color);
        const res = await api.get(`/wines?${params}`);
        setWines(res.items);
        setTotal(res.total);
    };
    useEffect(() => { fetchWines(); }, [page, search, region, color]);
    const getQty = (id) => quantities[id] ?? 1;
    const setQty = (id, val) => setQuantities((q) => ({ ...q, [id]: Math.max(1, Math.min(val, 99)) }));
    const handleAddToCart = async (wine) => {
        setAddingId(wine.id);
        await addItem({ wineId: wine.id, quantity: getQty(wine.id) });
        setTimeout(() => setAddingId(null), 700);
    };
    return (_jsxs("div", { className: "animate-in", children: [_jsx("div", { className: "catalog-hero", children: _jsxs("div", { className: "catalog-hero-inner", children: [_jsxs("h1", { children: ["Our ", _jsx("em", { children: "Wine" }), " Collection"] }), _jsx("p", { children: "Discover exceptional bottles from the world's finest regions, curated for discerning palates." }), _jsxs("div", { className: "catalog-hero-controls", children: [_jsx("input", { className: "catalog-hero-input", type: "text", placeholder: "\uD83D\uDD0D  Search by name, producer, style...", value: search, onChange: (e) => { setSearch(e.target.value); setPage(1); } }), _jsxs("div", { ref: regionRef, className: "region-dropdown", children: [_jsxs("button", { type: "button", className: "catalog-hero-input region-dropdown-trigger", onClick: () => setRegionOpen((o) => !o), children: [_jsxs("span", { children: ["\uD83D\uDCCD  ", region || 'All regions'] }), _jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { opacity: 0.6, flexShrink: 0, transform: regionOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }, children: _jsx("polyline", { points: "6 9 12 15 18 9" }) })] }), regionOpen && (_jsx("div", { className: "region-dropdown-menu", children: [{ value: '', label: '📍  All regions' }, ...regions.map((r) => ({ value: r, label: r }))].map((opt) => (_jsx("button", { type: "button", className: `region-dropdown-item${region === opt.value ? ' region-dropdown-item--active' : ''}`, onClick: () => { setRegion(opt.value); setPage(1); setRegionOpen(false); }, children: opt.label }, opt.value))) }))] }), _jsxs("span", { className: "catalog-hero-count", children: [total, " wine", total !== 1 ? 's' : ''] })] })] }) }), _jsx("div", { className: "filter-pills", children: COLOR_OPTIONS.map((opt) => (_jsxs("button", { className: `filter-pill ${color === opt.value ? 'filter-pill--active' : ''}`, onClick: () => { setColor(opt.value); setPage(1); }, children: [opt.emoji, " ", opt.label] }, opt.value))) }), _jsx("div", { className: "wine-grid stagger", children: wines.map((wine) => (_jsxs("div", { className: "wine-card", children: [_jsxs("div", { className: `wine-card-image wine-card-image--${wine.color}`, children: [wine.imageUrl
                                    ? _jsx("img", { src: wine.imageUrl, alt: wine.name, className: "wine-card-photo", onError: (e) => { e.currentTarget.style.display = 'none'; } })
                                    : _jsx(WineGlass, {}), WINE_META[wine.color] && (_jsxs("span", { className: "wine-card-image-label", children: [_jsx("span", { style: {
                                                width: 6, height: 6,
                                                borderRadius: '50%',
                                                background: WINE_META[wine.color].dot,
                                                display: 'inline-block',
                                                border: '1px solid rgba(255,255,255,0.5)',
                                            } }), WINE_META[wine.color].label] }))] }), _jsxs("div", { className: "wine-card-body", children: [_jsx(Link, { to: `/wines/${wine.id}`, className: "wine-card-name-link", children: _jsx("h3", { children: wine.name }) }), _jsxs("p", { className: "region", children: [_jsxs("svg", { width: "11", height: "11", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { flexShrink: 0 }, children: [_jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), _jsx("circle", { cx: "12", cy: "10", r: "3" })] }), wine.region, " \u00B7", ' ', _jsx("span", { className: "vintage", children: wine.vintage })] }), _jsxs("p", { className: "price", children: ["\u20AA", wine.price.toFixed(2)] }), _jsx("p", { className: "wine-description", children: wine.description }), _jsxs("div", { className: "wine-card-footer", children: [_jsxs("span", { className: "wine-stock", style: {
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 5,
                                                color: wine.stock > 10 ? 'var(--success-700)' : wine.stock > 0 ? 'var(--warning-700)' : 'var(--danger-700)',
                                                fontWeight: 600,
                                            }, children: [_jsx("span", { style: {
                                                        width: 6, height: 6,
                                                        borderRadius: '50%',
                                                        background: wine.stock > 10 ? 'var(--success-500)' : wine.stock > 0 ? 'var(--warning-500)' : 'var(--danger-500)',
                                                        display: 'inline-block',
                                                    } }), wine.stock > 0 ? `${wine.stock} in stock` : 'Out of stock'] }), user && wine.stock > 0 && (_jsxs("div", { className: "wine-card-add-row", children: [_jsxs("div", { className: "qty-control qty-control--sm", children: [_jsx("button", { onClick: () => setQty(wine.id, getQty(wine.id) - 1), children: "\u2212" }), _jsx("span", { children: getQty(wine.id) }), _jsx("button", { onClick: () => setQty(wine.id, getQty(wine.id) + 1), children: "+" })] }), _jsx("button", { className: "btn btn--primary btn--small", onClick: () => handleAddToCart(wine), disabled: addingId === wine.id, style: addingId === wine.id ? { background: 'var(--success-700)', boxShadow: 'none' } : {}, children: addingId === wine.id ? (_jsxs(_Fragment, { children: [_jsx("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polyline", { points: "20 6 9 17 4 12" }) }), "Added"] })) : (_jsxs(_Fragment, { children: [_jsxs("svg", { width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "12", y1: "5", x2: "12", y2: "19" }), _jsx("line", { x1: "5", y1: "12", x2: "19", y2: "12" })] }), "Add to Cart"] })) })] }))] })] })] }, wine.id))) }), wines.length === 0 && (_jsxs("div", { className: "empty-state", children: [_jsx("span", { className: "empty-state-icon", children: "\uD83D\uDD0D" }), _jsx("h3", { children: "No wines found" }), _jsx("p", { children: "Try adjusting your search or filters to find what you're looking for." })] })), total > 20 && (_jsxs("div", { style: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '2rem' }, children: [_jsx("button", { className: "btn btn--secondary", disabled: page <= 1, onClick: () => setPage((p) => p - 1), children: "\u2190 Previous" }), _jsxs("span", { className: "text-muted text-sm", style: { fontWeight: 600 }, children: ["Page ", page, " of ", Math.ceil(total / 20)] }), _jsx("button", { className: "btn btn--secondary", disabled: page >= Math.ceil(total / 20), onClick: () => setPage((p) => p + 1), children: "Next \u2192" })] }))] }));
}
//# sourceMappingURL=WineCatalogPage.js.map