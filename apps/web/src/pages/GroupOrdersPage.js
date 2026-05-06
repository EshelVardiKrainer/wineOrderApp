import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
const STATUS_CONFIG = {
    open: { label: 'Open', color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.2)', dot: 'var(--success-500)' },
    closed: { label: 'Closed', color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.2)', dot: 'var(--warning-500)' },
    submitted: { label: 'Submitted', color: 'var(--info-700)', bg: 'var(--info-50)', border: 'rgba(59,130,246,0.2)', dot: 'var(--info-500)' },
    shipped: { label: 'Shipped', color: '#065f46', bg: '#ecfdf5', border: 'rgba(5,150,105,0.2)', dot: 'var(--success-500)' },
};
export function GroupOrdersPage() {
    const [groupOrders, setGroupOrders] = useState([]);
    const [sites, setSites] = useState([]);
    const [selectedSiteId, setSelectedSiteId] = useState('');
    const [minimumAmount, setMinimumAmount] = useState('');
    const [error, setError] = useState('');
    const [showForm, setShowForm] = useState(false);
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'ADMIN';
    const fetchOrders = async () => {
        const orders = await api.get('/group-orders');
        setGroupOrders(orders);
    };
    useEffect(() => {
        fetchOrders();
        if (isAdmin)
            api.get('/shipping-sites').then(setSites);
    }, [isAdmin]);
    const handleCreate = async () => {
        if (!selectedSiteId)
            return;
        const amt = Number(minimumAmount);
        if (isNaN(amt) || amt < 0 || amt > 50000) {
            setError('Minimum amount must be a number between 0 and 50,000');
            return;
        }
        setError('');
        try {
            await api.post('/group-orders', {
                groupId: '', // TODO: Phase 4
                shippingSiteId: selectedSiteId,
                minimumAmount: amt,
            });
            setSelectedSiteId('');
            setMinimumAmount('');
            setShowForm(false);
            fetchOrders();
        }
        catch (err) {
            setError(err.message);
        }
    };
    const handleStatusChange = async (id, action) => {
        try {
            await api.patch(`/group-orders/${id}/${action}`);
            fetchOrders();
        }
        catch (err) {
            setError(err.message);
        }
    };
    return (_jsxs("div", { className: "animate-in", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }, children: [_jsxs("div", { className: "page-header", style: { margin: 0 }, children: [_jsx("h1", { children: "Group Orders" }), _jsx("p", { children: "Coordinate group wine purchases across shipping sites" })] }), isAdmin && (_jsx("button", { className: "btn btn--primary", onClick: () => setShowForm(!showForm), children: showForm ? '✕ Cancel' : '+ New Group Order' }))] }), error && _jsx("div", { className: "error-msg", children: error }), isAdmin && showForm && (_jsxs("div", { className: "section-panel animate-in", style: { marginBottom: 'var(--space-xl)', background: 'var(--wine-50)', border: '1px solid var(--wine-100)' }, children: [_jsx("h3", { style: { margin: '0 0 var(--space-lg)', fontFamily: 'var(--font-display)', color: 'var(--wine-900)' }, children: "Open New Group Order" }), _jsxs("div", { style: { display: 'flex', gap: 'var(--space-md)', alignItems: 'flex-end', flexWrap: 'wrap' }, children: [_jsxs("div", { className: "form-group", style: { flex: 1, minWidth: 200, marginBottom: 0 }, children: [_jsx("label", { children: "Shipping Site" }), _jsxs("select", { value: selectedSiteId, onChange: (e) => setSelectedSiteId(e.target.value), children: [_jsx("option", { value: "", children: "Select a site..." }), sites.map((site) => (_jsxs("option", { value: site.id, children: [site.name, " \u2014 ", site.city] }, site.id)))] })] }), _jsxs("div", { className: "form-group", style: { width: 180, marginBottom: 0 }, children: [_jsx("label", { children: "Minimum Amount (\u20AA)" }), _jsx("input", { type: "number", min: "0", max: "50000", step: "1", placeholder: "0 \u2013 50,000", value: minimumAmount, onChange: (e) => {
                                            const v = e.target.value;
                                            if (v === '' || (/^\d+$/.test(v) && Number(v) <= 50000))
                                                setMinimumAmount(v);
                                        } })] }), _jsx("button", { className: "btn btn--primary", disabled: !selectedSiteId || minimumAmount === '', onClick: handleCreate, children: "Open Order" })] })] })), groupOrders.length === 0 ? (_jsxs("div", { className: "empty-state section-panel", children: [_jsx("span", { className: "empty-state-icon", children: "\uD83D\uDCE6" }), _jsx("h3", { children: "No group orders yet" }), _jsx("p", { children: isAdmin ? 'Create your first group order using the button above.' : 'Group orders will appear here once they are created by an admin.' })] })) : (_jsx("div", { className: "group-order-cards stagger", children: groupOrders.map((go) => {
                    const cfg = STATUS_CONFIG[go.status] ?? STATUS_CONFIG.open;
                    const totalValue = go.participants.reduce((sum, p) => sum + p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
                    return (_jsxs("div", { className: "group-order-card", children: [_jsxs("div", { className: "group-order-card-header", children: [_jsxs("div", { className: "group-order-card-site", children: [_jsxs("h3", { children: [_jsxs("svg", { width: "13", height: "13", viewBox: "0 0 24 24", fill: "none", stroke: "var(--wine-500)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", style: { marginRight: 6, verticalAlign: 'middle' }, children: [_jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), _jsx("circle", { cx: "12", cy: "10", r: "3" })] }), go.shippingSite.name] }), _jsxs("p", { children: [go.shippingSite.address, ", ", go.shippingSite.city] })] }), _jsxs("span", { style: {
                                            padding: '5px 14px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            background: cfg.bg,
                                            color: cfg.color,
                                            border: `1px solid ${cfg.border}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            flexShrink: 0,
                                        }, children: [_jsx("span", { style: { width: 6, height: 6, borderRadius: '50%', background: cfg.dot, display: 'inline-block' } }), cfg.label] })] }), _jsxs("div", { className: "group-order-card-meta", children: [_jsxs("div", { className: "group-order-card-meta-item", children: [_jsx("div", { className: "meta-label", children: "Participants" }), _jsxs("div", { className: "meta-value", children: [_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", style: { marginRight: 4, verticalAlign: 'middle' }, children: [_jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }), _jsx("circle", { cx: "9", cy: "7", r: "4" }), _jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }), _jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })] }), go.participants.length] })] }), _jsxs("div", { className: "group-order-card-meta-item", children: [_jsx("div", { className: "meta-label", children: "Minimum" }), _jsx("div", { className: "meta-value", children: go.minimumAmount > 0 ? `₪${go.minimumAmount.toLocaleString()}` : _jsx("span", { className: "text-muted", children: "None" }) })] }), totalValue > 0 && (_jsxs("div", { className: "group-order-card-meta-item", children: [_jsx("div", { className: "meta-label", children: "Total Value" }), _jsxs("div", { className: "meta-value", style: { color: 'var(--wine-700)' }, children: ["\u20AA", totalValue.toFixed(2)] })] })), _jsxs("div", { className: "group-order-card-meta-item", children: [_jsx("div", { className: "meta-label", children: "Created" }), _jsx("div", { className: "meta-value text-muted", style: { fontSize: '0.85rem', fontWeight: 500 }, children: new Date(go.createdAt).toLocaleDateString() })] })] }), _jsxs("div", { className: "group-order-card-footer", children: [_jsx(Link, { to: `/group-orders/${go.id}`, className: "btn btn--secondary btn--small", children: "View Details \u2192" }), isAdmin && (_jsxs("div", { style: { display: 'flex', gap: 8 }, children: [go.status === 'open' && (_jsx("button", { className: "btn btn--danger btn--small", onClick: () => handleStatusChange(go.id, 'close'), children: "Close Order" })), go.status === 'closed' && (_jsx("button", { className: "btn btn--primary btn--small", onClick: () => handleStatusChange(go.id, 'submit'), children: "Submit to Supplier" })), go.status === 'submitted' && (_jsx("button", { className: "btn btn--success btn--small", onClick: () => handleStatusChange(go.id, 'ship'), children: "Mark as Shipped" }))] }))] })] }, go.id));
                }) }))] }));
}
//# sourceMappingURL=GroupOrdersPage.js.map