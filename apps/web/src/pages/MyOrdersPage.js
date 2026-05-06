import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { api } from '../api/client';
import { Link } from 'react-router-dom';
const STATUS_STYLES = {
    open: { color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.2)', icon: '🔓' },
    closed: { color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.2)', icon: '🔒' },
    submitted: { color: 'var(--info-700)', bg: 'var(--info-50)', border: 'rgba(59,130,246,0.2)', icon: '📤' },
    shipped: { color: '#065f46', bg: '#ecfdf5', border: 'rgba(5,150,105,0.2)', icon: '🚚' },
};
export function MyOrdersPage() {
    const [participations, setParticipations] = useState([]);
    const [groupOrders, setGroupOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        Promise.all([
            api.get('/group-orders/my/participations'),
            api.get('/group-orders'),
        ]).then(([parts, orders]) => {
            setParticipations(parts);
            setGroupOrders(orders);
            setLoading(false);
        });
    }, []);
    const goMap = useMemo(() => {
        const m = new Map();
        groupOrders.forEach((go) => m.set(go.id, go));
        return m;
    }, [groupOrders]);
    const siteGroups = useMemo(() => {
        const map = new Map();
        for (const p of participations) {
            const go = goMap.get(p.groupOrderId);
            if (!go)
                continue;
            const siteId = go.shippingSiteId;
            if (!map.has(siteId))
                map.set(siteId, { site: go.shippingSite, participations: [], siteTotal: 0 });
            const group = map.get(siteId);
            const myTotal = p.orderItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
            group.participations.push({ ...p, groupOrderStatus: go.status, groupOrderId: go.id });
            group.siteTotal += myTotal;
        }
        return Array.from(map.values());
    }, [participations, goMap]);
    if (loading)
        return _jsx("div", { className: "spinner" });
    return (_jsxs("div", { className: "animate-in", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "My Orders" }), _jsx("p", { children: "Track your group order enrollments and purchase history" })] }), siteGroups.length === 0 ? (_jsxs("div", { className: "empty-state section-panel", children: [_jsx("span", { className: "empty-state-icon", children: "\uD83D\uDCCB" }), _jsx("h3", { children: "No orders yet" }), _jsx("p", { children: "You haven't enrolled in any group orders. Head to the catalog to browse wines and join a group order." }), _jsx(Link, { to: "/wines", className: "btn btn--primary", style: { marginTop: 'var(--space-lg)' }, children: "Browse Catalog \u2192" })] })) : (_jsx("div", { className: "stagger", children: siteGroups.map((sg) => (_jsxs("div", { className: "section-panel", style: { marginBottom: 'var(--space-lg)', padding: 0, overflow: 'hidden' }, children: [_jsxs("div", { className: "site-order-header", style: {
                                background: 'linear-gradient(135deg, var(--wine-950) 0%, var(--wine-800) 100%)',
                                padding: 'var(--space-lg) var(--space-xl)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexWrap: 'wrap',
                                gap: 'var(--space-md)',
                            }, children: [_jsxs("div", { style: { color: 'white' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }, children: [_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "rgba(255,255,255,0.6)", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }), _jsx("circle", { cx: "12", cy: "10", r: "3" })] }), _jsx("span", { style: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }, children: "Shipping Site" })] }), _jsx("h2", { style: { margin: 0, fontSize: '1.15rem', color: 'white', fontFamily: 'var(--font-display)' }, children: sg.site.name }), _jsxs("p", { style: { margin: '4px 0 0', fontSize: '0.83rem', color: 'rgba(255,255,255,0.5)' }, children: [sg.site.address, ", ", sg.site.city] })] }), _jsxs("div", { style: {
                                        background: 'rgba(255,255,255,0.1)',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        borderRadius: 'var(--radius-md)',
                                        padding: 'var(--space-md) var(--space-lg)',
                                        textAlign: 'center',
                                        backdropFilter: 'blur(8px)',
                                    }, children: [_jsxs("div", { style: { fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-300)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }, children: ["\u20AA", sg.siteTotal.toFixed(2)] }), _jsx("div", { style: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginTop: 2 }, children: "Total Spent" })] })] }), _jsx("div", { style: { padding: 'var(--space-xl)' }, children: sg.participations.map((p, idx) => {
                                const myTotal = p.orderItems.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
                                const statusCfg = STATUS_STYLES[p.groupOrderStatus] ?? STATUS_STYLES.open;
                                return (_jsxs("div", { style: {
                                        marginBottom: idx < sg.participations.length - 1 ? 'var(--space-lg)' : 0,
                                        border: '1px solid var(--gray-100)',
                                        borderRadius: 'var(--radius-md)',
                                        overflow: 'hidden',
                                    }, children: [_jsxs("div", { style: {
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: 'var(--space-md) var(--space-lg)',
                                                background: 'var(--gray-50)',
                                                borderBottom: '1px solid var(--gray-100)',
                                                flexWrap: 'wrap',
                                                gap: 'var(--space-sm)',
                                            }, children: [_jsxs("div", { children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 10 }, children: [_jsx("span", { style: { fontSize: '1rem' }, children: statusCfg.icon }), _jsxs("span", { style: { fontWeight: 700, color: 'var(--gray-800)', fontSize: '0.92rem' }, children: ["Order #", p.groupOrderId.slice(0, 8).toUpperCase()] }), _jsx("span", { style: {
                                                                        padding: '3px 10px',
                                                                        borderRadius: 'var(--radius-full)',
                                                                        fontSize: '0.7rem',
                                                                        fontWeight: 700,
                                                                        textTransform: 'uppercase',
                                                                        letterSpacing: '0.04em',
                                                                        background: statusCfg.bg,
                                                                        color: statusCfg.color,
                                                                        border: `1px solid ${statusCfg.border}`,
                                                                    }, children: p.groupOrderStatus })] }), _jsxs("p", { className: "text-xs text-muted", style: { marginTop: 4, marginLeft: 28 }, children: ["Enrolled: ", new Date(p.enrolledAt).toLocaleString()] })] }), _jsxs("div", { style: { fontWeight: 800, fontSize: '1rem', color: 'var(--wine-700)' }, children: ["\u20AA", myTotal.toFixed(2)] })] }), p.orderItems.length > 0 && (_jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Wine" }), _jsx("th", { children: "Region" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Unit Price" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: p.orderItems.map((item) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600 }, children: item.wine.name }), _jsx("td", { className: "text-muted", children: item.wine.region }), _jsx("td", { children: _jsxs("span", { style: { background: 'var(--gray-100)', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: '0.85rem' }, children: ["\u00D7", item.quantity] }) }), _jsxs("td", { children: ["\u20AA", item.unitPrice.toFixed(2)] }), _jsxs("td", { style: { fontWeight: 700, color: 'var(--wine-700)' }, children: ["\u20AA", (item.quantity * item.unitPrice).toFixed(2)] })] }, item.id))) })] }) }))] }, p.id));
                            }) })] }, sg.site.id))) }))] }));
}
//# sourceMappingURL=MyOrdersPage.js.map