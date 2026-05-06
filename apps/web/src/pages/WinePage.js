import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useTranslation } from 'react-i18next';
const COLOR_BADGE = {
    red: { bg: '#fde8e8', text: '#b91c1c', label: '🌹 Red' },
    rose: { bg: '#fce7f3', text: '#be185d', label: '🦩 Rosé' },
    white: { bg: '#f0fdf4', text: '#15803d', label: '⚪️ White' },
    orange: { bg: '#fff7ed', text: '#c2410c', label: '🐅 Orange' },
};
export function WinePage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const [wine, setWine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
                const wineData = await api.get(`/wines/${id}`);
                setWine(wineData);
            }
            catch (err) {
                setError(err.message || 'Failed to load wine');
                console.error('Error fetching wine:', err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchWine();
    }, [id, navigate]);
    const handleAddToCart = async () => {
        if (!wine)
            return;
        try {
            setAddingToCart(true);
            await addItem({ wineId: wine.id, quantity });
            // Show success feedback for a moment
            setTimeout(() => setAddingToCart(false), 1000);
        }
        catch (err) {
            setAddingToCart(false);
            console.error('Error adding to cart:', err);
        }
    };
    const handleQuantityChange = (newQuantity) => {
        if (newQuantity < 1)
            return;
        if (wine && newQuantity > wine.stock)
            return;
        setQuantity(newQuantity);
    };
    if (loading) {
        return (_jsxs("div", { className: "animate-in", style: { textAlign: 'center', padding: '3rem 0' }, children: [_jsx("div", { style: { fontSize: '2rem', marginBottom: '1rem' }, children: "\uD83C\uDF77" }), _jsx("p", { children: t('wine.loading') })] }));
    }
    if (error || !wine) {
        return (_jsxs("div", { className: "animate-in", style: { textAlign: 'center', padding: '3rem 0' }, children: [_jsx("div", { style: { fontSize: '2rem', marginBottom: '1rem' }, children: "\uD83D\uDE1E" }), _jsx("h2", { children: t('wine.notFound') }), _jsx("p", { style: { color: '#6b7280', marginBottom: '2rem' }, children: error || t('wine.notFoundDesc') }), _jsxs(Link, { to: "/wines", className: "btn btn--primary", children: ["\u2190 ", t('wine.backToCatalog')] })] }));
    }
    return (_jsxs("div", { className: "animate-in", children: [_jsx("div", { style: { marginBottom: '2rem' }, children: _jsxs(Link, { to: "/wines", className: "btn btn--secondary", style: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }, children: ["\u2190 ", t('wine.backToCatalog')] }) }), _jsxs("div", { style: {
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: '2rem',
                    alignItems: 'start'
                }, children: [_jsxs("div", { style: { textAlign: 'center' }, children: [wine.imageUrl ? (_jsx("img", { src: wine.imageUrl, alt: wine.name, style: {
                                    width: '100%',
                                    maxWidth: '300px',
                                    height: 'auto',
                                    borderRadius: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                }, onError: (e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                                } })) : null, _jsx("div", { style: {
                                    display: wine.imageUrl ? 'none' : 'flex',
                                    width: '100%',
                                    maxWidth: '300px',
                                    height: 'clamp(300px, 50vw, 400px)',
                                    backgroundColor: '#f3f4f6',
                                    borderRadius: '0.5rem',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 'clamp(2rem, 8vw, 4rem)',
                                    color: '#9ca3af',
                                    margin: '0 auto',
                                }, children: "\uD83C\uDF77" })] }), _jsxs("div", { children: [COLOR_BADGE[wine.color] && (_jsx("span", { className: "color-badge", style: {
                                    background: COLOR_BADGE[wine.color].bg,
                                    color: COLOR_BADGE[wine.color].text,
                                    display: 'inline-block',
                                    marginBottom: '1rem',
                                }, children: COLOR_BADGE[wine.color].label })), _jsx("h1", { style: {
                                    fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
                                    marginBottom: '1rem',
                                    lineHeight: '1.2',
                                    textAlign: 'center'
                                }, children: wine.name }), _jsxs("div", { style: {
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '1rem',
                                    marginBottom: '1.5rem',
                                    fontSize: 'clamp(1rem, 3vw, 1.125rem)',
                                    color: '#6b7280',
                                    flexWrap: 'wrap'
                                }, children: [_jsxs("span", { children: ["\uD83D\uDCCD ", wine.region] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["\uD83D\uDCC5 ", wine.vintage] })] }), _jsx("div", { style: { marginBottom: '1.5rem', textAlign: 'center' }, children: _jsxs("span", { style: {
                                        fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                                        fontWeight: 'bold',
                                        color: '#059669'
                                    }, children: ["\u20AA", wine.price.toFixed(2)] }) }), _jsx("div", { style: { marginBottom: '2rem', textAlign: 'center' }, children: _jsx("span", { style: {
                                        color: wine.stock > 0 ? '#059669' : '#dc2626',
                                        fontWeight: '500',
                                        fontSize: 'clamp(0.9rem, 2.5vw, 1rem)'
                                    }, children: wine.stock > 0 ? `✅ ${wine.stock} in stock` : '❌ Out of stock' }) }), _jsxs("div", { style: { marginBottom: '2rem' }, children: [_jsx("h3", { style: { marginBottom: '1rem' }, children: t('wine.description') }), _jsx("p", { style: {
                                            lineHeight: '1.6',
                                            color: '#374151',
                                            fontSize: '1rem'
                                        }, children: wine.description })] }), user && wine.stock > 0 && (_jsxs("div", { style: { marginBottom: '2rem' }, children: [_jsx("label", { style: { display: 'block', marginBottom: '0.5rem', fontWeight: '500' }, children: t('wine.quantity') }), _jsxs("div", { style: {
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.75rem',
                                            flexWrap: 'wrap'
                                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx("button", { onClick: () => handleQuantityChange(quantity - 1), disabled: quantity <= 1, className: "btn btn--secondary", style: {
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '1.25rem',
                                                            lineHeight: '1',
                                                            minWidth: '2.5rem'
                                                        }, children: "\u2212" }), _jsx("input", { type: "number", min: "1", max: wine.stock, value: quantity, onChange: (e) => handleQuantityChange(parseInt(e.target.value) || 1), style: {
                                                            width: '4rem',
                                                            textAlign: 'center',
                                                            padding: '0.5rem',
                                                            border: '1px solid #d1d5db',
                                                            borderRadius: '0.375rem',
                                                            fontSize: '1rem'
                                                        } }), _jsx("button", { onClick: () => handleQuantityChange(quantity + 1), disabled: quantity >= wine.stock, className: "btn btn--secondary", style: {
                                                            padding: '0.5rem 0.75rem',
                                                            fontSize: '1.25rem',
                                                            lineHeight: '1',
                                                            minWidth: '2.5rem'
                                                        }, children: "+" })] }), _jsx("span", { style: {
                                                    color: '#6b7280',
                                                    fontSize: 'clamp(0.8rem, 2vw, 0.875rem)',
                                                    whiteSpace: 'nowrap'
                                                }, children: t('wine.max', { count: wine.stock }) })] })] })), user && wine.stock > 0 && (_jsxs("div", { style: {
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexWrap: 'wrap'
                                }, children: [_jsx("button", { onClick: handleAddToCart, disabled: addingToCart, className: "btn btn--primary", style: {
                                            fontSize: 'clamp(1rem, 2.5vw, 1.125rem)',
                                            padding: '0.75rem 1.5rem',
                                            minWidth: '200px'
                                        }, children: addingToCart ? `✅ ${t('wine.addedToCart')}` : `🛒 ${t('wine.addToCart', { count: quantity })}` }), _jsx(Link, { to: "/cart", className: "btn btn--secondary", children: t('wine.viewCart') })] })), !user && (_jsx("div", { style: {
                                    padding: '1.5rem',
                                    backgroundColor: '#f9fafb',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb'
                                }, children: _jsxs("p", { style: { marginBottom: '1rem' }, children: [_jsx(Link, { to: "/login", style: { color: '#2563eb', textDecoration: 'underline' }, children: t('nav.login') }), ' ', t('wine.signInToOrder')] }) }))] })] })] }));
}
//# sourceMappingURL=WinePage.js.map