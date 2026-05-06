import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useCartStore } from '../stores/cart.store';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PayPalCheckout } from '../components/PayPalCheckout';
export function CartPage() {
    const { t } = useTranslation();
    const cart = useCartStore((s) => s.cart);
    const fetchCart = useCartStore((s) => s.fetchCart);
    const updateItem = useCartStore((s) => s.updateItem);
    const removeItem = useCartStore((s) => s.removeItem);
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();
    const [sites, setSites] = useState([]);
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [openGroupOrder, setOpenGroupOrder] = useState(null);
    const [enrolling, setEnrolling] = useState(false);
    const [error, setError] = useState('');
    const [currency, setCurrency] = useState('ILS');
    const [showPayment, setShowPayment] = useState(false);
    useEffect(() => {
        fetchCart();
        api.get('/shipping-sites').then(setSites);
    }, [fetchCart]);
    useEffect(() => {
        if (!selectedSiteId) {
            setOpenGroupOrder(null);
            return;
        }
        api.get(`/group-orders/site/${selectedSiteId}`).then((orders) => {
            const open = orders.find((o) => o.status === 'open');
            setOpenGroupOrder(open ?? null);
        });
    }, [selectedSiteId]);
    const handleEnroll = async () => {
        if (!openGroupOrder)
            return;
        setEnrolling(true);
        setError('');
        try {
            await api.post(`/group-orders/${openGroupOrder.id}/enroll`);
            navigate('/my-orders');
        }
        catch (err) {
            setError(err.message);
        }
        finally {
            setEnrolling(false);
        }
    };
    if (!cart)
        return _jsx("div", { className: "spinner" });
    const itemCount = cart.items.reduce((s, i) => s + i.quantity, 0);
    return (_jsxs("div", { className: "animate-in", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: t('cart.title') }), _jsx("p", { children: itemCount > 0 ? `${itemCount} item${itemCount !== 1 ? 's' : ''} ready for checkout` : t('cart.empty') })] }), error && _jsx("div", { className: "error-msg", children: error }), cart.items.length === 0 ? (_jsxs("div", { className: "empty-state", style: { background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--gray-200)', boxShadow: 'var(--shadow-card)' }, children: [_jsx("span", { className: "empty-state-icon", children: "\uD83D\uDED2" }), _jsx("h3", { children: t('cart.empty') }), _jsx("p", { children: t('cart.emptyDesc') }), _jsxs(Link, { to: "/wines", className: "btn btn--primary btn--large", style: { marginTop: '1.5rem' }, children: [t('cart.browseCatalog'), " \u2192"] })] })) : (_jsxs("div", { className: "cart-layout", children: [_jsxs("div", { children: [_jsxs("div", { className: "section-panel", style: { padding: 0, overflow: 'hidden' }, children: [_jsx("div", { style: { padding: 'var(--space-xl)', borderBottom: '1px solid var(--gray-100)' }, children: _jsx("h3", { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.1rem' }, children: "Your Selections" }) }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: t('cart.wine') }), _jsx("th", { className: "cart-table-price", children: t('cart.price') }), _jsx("th", { children: t('cart.quantity') }), _jsx("th", { children: t('cart.subtotal') }), _jsx("th", { style: { width: 50 } })] }) }), _jsx("tbody", { children: cart.items.map((item) => (_jsxs("tr", { children: [_jsx("td", { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12 }, children: [_jsx("div", { style: {
                                                                                width: 40, height: 48,
                                                                                borderRadius: 8,
                                                                                background: item.wine.color === 'red'
                                                                                    ? 'linear-gradient(160deg, #4a1420, #8a2038)'
                                                                                    : item.wine.color === 'rose'
                                                                                        ? 'linear-gradient(160deg, #5a1530, #c4517a)'
                                                                                        : item.wine.color === 'white'
                                                                                            ? 'linear-gradient(160deg, #5a4418, #c09848)'
                                                                                            : 'linear-gradient(160deg, #5a2810, #c86030)',
                                                                                flexShrink: 0,
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'center',
                                                                                fontSize: '1.1rem',
                                                                            }, children: "\uD83C\uDF77" }), _jsxs("div", { children: [_jsx("div", { style: { fontWeight: 700, color: 'var(--gray-900)', fontSize: '0.9rem' }, children: item.wine.name }), _jsxs("div", { className: "text-muted text-xs", style: { marginTop: 2 }, children: [item.wine.region, " \u00B7 ", item.wine.vintage] })] })] }) }), _jsxs("td", { className: "cart-table-price", style: { fontWeight: 600, color: 'var(--gray-700)' }, children: ["\u20AA", item.wine.price.toFixed(2)] }), _jsx("td", { children: _jsxs("div", { className: "qty-control", children: [_jsx("button", { onClick: () => updateItem(item.id, { quantity: item.quantity - 1 }), children: "\u2212" }), _jsx("span", { children: item.quantity }), _jsx("button", { onClick: () => updateItem(item.id, { quantity: item.quantity + 1 }), children: "+" })] }) }), _jsxs("td", { style: { fontWeight: 800, color: 'var(--wine-700)', fontSize: '1rem' }, children: ["\u20AA", (item.wine.price * item.quantity).toFixed(2)] }), _jsx("td", { children: _jsx("button", { onClick: () => removeItem(item.id), title: "Remove", style: {
                                                                        width: 28, height: 28,
                                                                        border: 'none',
                                                                        background: 'var(--danger-50)',
                                                                        color: 'var(--danger-500)',
                                                                        borderRadius: 6,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.8rem',
                                                                        transition: 'all 0.15s ease',
                                                                    }, onMouseEnter: (e) => {
                                                                        e.currentTarget.style.background = 'var(--danger-500)';
                                                                        e.currentTarget.style.color = 'white';
                                                                    }, onMouseLeave: (e) => {
                                                                        e.currentTarget.style.background = 'var(--danger-50)';
                                                                        e.currentTarget.style.color = 'var(--danger-500)';
                                                                    }, children: "\u2715" }) })] }, item.id))) })] }) })] }), _jsxs("div", { className: "section-panel", style: { marginTop: 'var(--space-lg)' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-lg)' }, children: [_jsx("div", { style: {
                                                    width: 40, height: 40,
                                                    background: 'var(--wine-50)',
                                                    border: '1px solid var(--wine-100)',
                                                    borderRadius: 10,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '1.1rem',
                                                }, children: "\uD83E\uDD1D" }), _jsxs("div", { children: [_jsx("h3", { style: { margin: 0, fontSize: '1rem' }, children: t('cart.enrollTitle') }), _jsx("p", { className: "text-muted text-sm", style: { marginTop: 2 }, children: t('cart.enrollDesc') })] })] }), _jsxs("div", { className: "form-group", style: { maxWidth: 400, marginBottom: 'var(--space-md)' }, children: [_jsx("label", { children: t('cart.shippingSite') }), _jsxs("select", { value: selectedSiteId, onChange: (e) => setSelectedSiteId(e.target.value), children: [_jsx("option", { value: "", children: t('cart.selectSite') }), sites.map((site) => (_jsxs("option", { value: site.id, children: [site.name, " \u2014 ", site.city] }, site.id)))] })] }), selectedSiteId && !openGroupOrder && (_jsx("div", { className: "info-box info-box--warning", children: t('cart.noGroupOrder') })), openGroupOrder && (_jsxs("div", { children: [_jsxs("div", { className: "info-box info-box--success", style: { marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("span", { style: { fontSize: '1.1rem' }, children: "\u2705" }), _jsx("div", { children: _jsx("strong", { children: t('cart.groupOrderFound', { count: openGroupOrder.participants.length }) }) })] }), _jsx("button", { className: "btn btn--success", disabled: enrolling, onClick: handleEnroll, style: { minWidth: 180 }, children: enrolling ? t('cart.enrolling') : `✓ ${t('cart.enrollSubmit')}` })] }))] })] }), _jsxs("div", { className: "order-summary-panel", children: [_jsx("div", { className: "order-summary-header", children: _jsx("h3", { children: "Order Summary" }) }), _jsxs("div", { className: "order-summary-body", children: [cart.items.map((item) => (_jsxs("div", { className: "order-summary-row", children: [_jsxs("span", { className: "row-label", style: { maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: [item.wine.name, " \u00D7", item.quantity] }), _jsxs("span", { className: "row-value", children: ["\u20AA", (item.wine.price * item.quantity).toFixed(2)] })] }, item.id))), _jsxs("div", { className: "order-summary-row total", children: [_jsx("span", { children: t('cart.total') }), _jsxs("span", { children: ["\u20AA", cart.totalPrice.toFixed(2)] })] }), _jsxs("div", { style: { marginTop: 'var(--space-lg)', borderTop: '1px solid var(--gray-100)', paddingTop: 'var(--space-lg)' }, children: [_jsx("button", { className: "btn btn--primary", style: { width: '100%', justifyContent: 'center', marginBottom: 'var(--space-sm)' }, onClick: () => setShowPayment(true), children: t('cart.proceedToPayment') }), _jsxs(Link, { to: "/wines", className: "btn btn--secondary", style: { width: '100%', justifyContent: 'center' }, children: ["\u2190 ", t('cart.browseCatalog')] })] })] })] })] })), showPayment && (_jsx("div", { className: "payment-modal-overlay", onClick: () => setShowPayment(false), children: _jsxs("div", { className: "payment-modal", onClick: (e) => e.stopPropagation(), children: [_jsxs("div", { className: "payment-modal-header", children: [_jsxs("div", { children: [_jsx("h2", { children: t('cart.paymentTitle') }), _jsx("p", { children: t('cart.paymentNote') })] }), _jsx("button", { className: "payment-modal-close", onClick: () => setShowPayment(false), children: "\u2715" })] }), _jsxs("div", { className: "payment-modal-body", children: [_jsxs("div", { className: "payment-modal-summary", children: [_jsx("span", { className: "label", children: t('cart.total') }), _jsxs("span", { className: "amount", children: [currency === 'ILS' ? '₪' : '$', cart.totalPrice.toFixed(2)] })] }), _jsx("div", { style: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-500)', marginBottom: 8 }, children: t('cart.currency') }), _jsx("div", { className: "payment-modal-currency", children: ['ILS', 'USD'].map((c) => (_jsx("button", { className: currency === c ? 'active' : '', onClick: () => setCurrency(c), children: c === 'ILS' ? '₪ ILS' : '$ USD' }, c))) }), _jsx(PayPalCheckout, { amount: cart.totalPrice.toFixed(2), currency: currency, items: cart.items.map((i) => ({ name: i.wine.name, quantity: i.quantity, price: i.wine.price })), onSuccess: (details) => {
                                        setShowPayment(false);
                                        navigate(`/payment/success?orderId=${details.orderID}&paymentId=${details.paymentID}`);
                                    }, onError: () => {
                                        setShowPayment(false);
                                        setError('Payment failed. Please try again.');
                                    }, onCancel: () => {
                                        setShowPayment(false);
                                        navigate('/payment/cancel');
                                    } })] })] }) }))] }));
}
//# sourceMappingURL=CartPage.js.map