import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
const STATUS_CONFIG = {
    open: { label: 'Open', color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.25)' },
    closed: { label: 'Closed', color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.25)' },
    submitted: { label: 'Submitted', color: 'var(--info-700)', bg: 'var(--info-50)', border: 'rgba(59,130,246,0.25)' },
    shipped: { label: 'Shipped', color: '#065f46', bg: '#ecfdf5', border: 'rgba(5,150,105,0.25)' },
};
export function GroupOrderDetailPage() {
    const { id } = useParams();
    const [go, setGo] = useState(null);
    const [summary, setSummary] = useState(null);
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'ADMIN';
    useEffect(() => {
        if (!id)
            return;
        api.get(`/group-orders/${id}`).then(setGo);
        api.get(`/group-orders/${id}/summary`).then(setSummary);
    }, [id]);
    if (!go)
        return _jsx("div", { className: "spinner" });
    const visibleParticipants = isAdmin
        ? go.participants
        : go.participants.filter((p) => p.userId === user?.id);
    const cfg = STATUS_CONFIG[go.status] ?? STATUS_CONFIG.open;
    return (_jsxs("div", { className: "animate-in", children: [_jsx("div", { style: { marginBottom: 'var(--space-md)' }, children: _jsxs(Link, { to: "/group-orders", style: {
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 6,
                        color: 'var(--gray-500)',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        transition: 'color 0.2s',
                    }, children: [_jsxs("svg", { width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("line", { x1: "19", y1: "12", x2: "5", y2: "12" }), _jsx("polyline", { points: "12 19 5 12 12 5" })] }), "Back to Group Orders"] }) }), _jsxs("div", { className: "section-panel", style: { marginBottom: 'var(--space-lg)', padding: 0, overflow: 'hidden' }, children: [_jsxs("div", { style: {
                            background: 'linear-gradient(135deg, var(--wine-950) 0%, var(--wine-800) 100%)',
                            padding: 'var(--space-xl) var(--space-2xl)',
                            color: 'white',
                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }, children: [_jsx("h1", { style: { margin: 0, fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white' }, children: go.shippingSite.name }), _jsx("span", { style: {
                                            padding: '5px 14px',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.75rem',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.04em',
                                            background: cfg.bg,
                                            color: cfg.color,
                                            border: `1px solid ${cfg.border}`,
                                        }, children: cfg.label })] }), _jsxs("p", { style: { margin: 0, color: 'rgba(255,255,255,0.55)', fontSize: '0.9rem' }, children: [go.shippingSite.address, ", ", go.shippingSite.city] })] }), _jsxs("div", { style: { padding: 'var(--space-lg) var(--space-2xl)', display: 'flex', gap: 'var(--space-2xl)', flexWrap: 'wrap' }, children: [_jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted", style: { textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }, children: "Created" }), _jsx("div", { style: { fontWeight: 600, fontSize: '0.9rem' }, children: new Date(go.createdAt).toLocaleString() })] }), go.closedAt && (_jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted", style: { textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }, children: "Closed" }), _jsx("div", { style: { fontWeight: 600, fontSize: '0.9rem' }, children: new Date(go.closedAt).toLocaleString() })] })), _jsxs("div", { children: [_jsx("div", { className: "text-xs text-muted", style: { textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, marginBottom: 2 }, children: "Order ID" }), _jsxs("div", { style: { fontWeight: 600, fontSize: '0.9rem', fontFamily: 'monospace' }, children: [go.id.slice(0, 12).toUpperCase(), "\u2026"] })] })] })] }), summary && (_jsxs("div", { className: "section-panel", style: { marginBottom: 'var(--space-lg)' }, children: [_jsx("h3", { style: { marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }, children: "Order Summary" }), _jsxs("div", { className: "stat-row", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: summary.totalParticipants }), _jsx("div", { className: "stat-label", children: "Participants" })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: summary.totalBottles }), _jsx("div", { className: "stat-label", children: "Bottles" })] }), _jsxs("div", { className: "stat-card", children: [_jsxs("div", { className: "stat-value", children: ["\u20AA", summary.totalPrice.toFixed(0)] }), _jsx("div", { className: "stat-label", children: "Total Value" })] }), summary.minimumAmount > 0 && (_jsxs("div", { className: "stat-card", style: { borderTop: `3px solid ${summary.minimumReached ? 'var(--success-500)' : 'var(--warning-500)'}` }, children: [_jsx("div", { className: "stat-value", style: { color: summary.minimumReached ? 'var(--success-700)' : 'var(--warning-700)' }, children: summary.minimumReached ? '✓' : `${Math.round((summary.totalPrice / summary.minimumAmount) * 100)}%` }), _jsx("div", { className: "stat-label", children: summary.minimumReached ? 'Min Reached' : 'Of Minimum' })] }))] }), summary.minimumAmount > 0 && (_jsxs("div", { style: { marginBottom: 'var(--space-lg)' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.85rem' }, children: [_jsx("span", { style: { fontWeight: 600, color: summary.minimumReached ? 'var(--success-700)' : 'var(--warning-700)' }, children: summary.minimumReached ? '✅ Minimum reached' : '⏳ Working towards minimum' }), _jsxs("span", { style: { fontWeight: 600, color: 'var(--gray-600)' }, children: ["\u20AA", summary.totalPrice.toFixed(0), " / \u20AA", summary.minimumAmount.toLocaleString()] })] }), _jsx("div", { className: "progress-bar", style: { height: 10 }, children: _jsx("div", { className: `progress-bar__fill ${summary.minimumReached ? 'progress-bar__fill--success' : 'progress-bar__fill--warning'}`, style: { width: `${Math.min(100, (summary.totalPrice / summary.minimumAmount) * 100)}%` } }) }), !summary.minimumReached && (_jsxs("p", { style: { fontSize: '0.82rem', color: 'var(--warning-700)', marginTop: 6, fontWeight: 600 }, children: ["\u20AA", (summary.minimumAmount - summary.totalPrice).toFixed(2), " more needed to reach the minimum"] }))] })), isAdmin && summary.wineAggregation.length > 0 && (_jsxs(_Fragment, { children: [_jsx("h4", { style: { fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--gray-500)', marginBottom: 'var(--space-sm)', fontWeight: 600 }, children: "Wine Breakdown" }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Wine" }), _jsx("th", { children: "Total Bottles" }), _jsx("th", { children: "Total Value" })] }) }), _jsx("tbody", { children: summary.wineAggregation.map((wa) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600 }, children: wa.wineName }), _jsx("td", { children: _jsxs("span", { style: { background: 'var(--gray-100)', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: '0.85rem' }, children: ["\u00D7", wa.totalQuantity] }) }), _jsxs("td", { style: { fontWeight: 700, color: 'var(--wine-700)' }, children: ["\u20AA", wa.totalPrice.toFixed(2)] })] }, wa.wineId))) })] }) })] }))] })), _jsx("div", { className: "section-header", children: _jsx("h2", { style: { fontFamily: 'var(--font-display)' }, children: isAdmin ? `Participants (${go.participants.length})` : 'My Order' }) }), visibleParticipants.length === 0 ? (_jsxs("div", { className: "empty-state section-panel", children: [_jsx("span", { className: "empty-state-icon", children: isAdmin ? '👥' : '📋' }), _jsx("h3", { children: isAdmin ? 'No participants yet' : 'Not enrolled' }), _jsx("p", { children: isAdmin ? 'No one has enrolled in this group order yet.' : 'You are not enrolled in this group order.' })] })) : (_jsx("div", { className: "stagger", children: visibleParticipants.map((p) => {
                    const pTotal = p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                    return (_jsxs("div", { className: "section-panel", style: { marginBottom: 'var(--space-md)', padding: 0, overflow: 'hidden' }, children: [_jsxs("div", { style: {
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: 'var(--space-md) var(--space-xl)',
                                    background: 'var(--gray-50)',
                                    borderBottom: '1px solid var(--gray-100)',
                                    flexWrap: 'wrap',
                                    gap: 'var(--space-md)',
                                }, children: [isAdmin ? (_jsx("div", { children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8 }, children: [_jsx("div", { style: {
                                                        width: 32, height: 32, borderRadius: '50%',
                                                        background: 'linear-gradient(135deg, var(--wine-700), var(--wine-900))',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        color: 'white', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                                                    }, children: p.user.name.charAt(0).toUpperCase() }), _jsxs("div", { children: [_jsx("strong", { style: { color: 'var(--gray-900)', fontSize: '0.92rem' }, children: p.user.name }), _jsx("span", { className: "text-muted text-xs", style: { marginLeft: 8 }, children: p.user.email })] })] }) })) : (_jsxs("div", { style: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--gray-700)' }, children: ["Enrolled: ", new Date(p.enrolledAt).toLocaleString()] })), _jsxs("div", { style: { fontWeight: 800, fontSize: '1.05rem', color: 'var(--wine-700)' }, children: ["\u20AA", pTotal.toFixed(2)] })] }), p.orderItems.length > 0 && (_jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Wine" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Unit Price" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: p.orderItems.map((item) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600 }, children: item.wine.name }), _jsx("td", { children: _jsxs("span", { style: { background: 'var(--gray-100)', borderRadius: 6, padding: '2px 8px', fontWeight: 600, fontSize: '0.85rem' }, children: ["\u00D7", item.quantity] }) }), _jsxs("td", { children: ["\u20AA", item.unitPrice.toFixed(2)] }), _jsxs("td", { style: { fontWeight: 700, color: 'var(--wine-700)' }, children: ["\u20AA", (item.quantity * item.unitPrice).toFixed(2)] })] }, item.id))) }), _jsx("tfoot", { children: _jsxs("tr", { children: [_jsx("td", { colSpan: 3, style: { textAlign: 'right', fontWeight: 700 }, children: "Total" }), _jsxs("td", { style: { fontWeight: 800, color: 'var(--wine-700)' }, children: ["\u20AA", pTotal.toFixed(2)] })] }) })] }) }))] }, p.id));
                }) }))] }));
}
//# sourceMappingURL=GroupOrderDetailPage.js.map