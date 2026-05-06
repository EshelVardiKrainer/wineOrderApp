import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
const STATUS_STYLES = {
    PENDING: { color: 'var(--warning-700)', bg: 'var(--warning-50)', border: 'rgba(245,158,11,0.2)', icon: '⏳' },
    APPROVED: { color: 'var(--success-700)', bg: 'var(--success-50)', border: 'rgba(16,185,129,0.2)', icon: '✅' },
    DENIED: { color: 'var(--danger-700)', bg: 'var(--danger-50)', border: 'rgba(239,68,68,0.2)', icon: '❌' },
};
export function RoleRequestPage() {
    const user = useAuthStore((s) => s.user);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [requestedRole, setRequestedRole] = useState('ADMIN');
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fetchRequests = async () => {
        try {
            const data = await roleRequestsApi.getMine();
            setRequests(data);
        }
        catch {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => { fetchRequests(); }, []);
    const hasPending = requests.some((r) => r.status === 'PENDING');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSubmitting(true);
        try {
            await roleRequestsApi.create({ requestedRole, reason: reason || undefined });
            setSuccess('Your role request has been submitted successfully. A super admin will review it shortly.');
            setReason('');
            await fetchRequests();
        }
        catch (err) {
            setError(err.message || 'Failed to submit request');
        }
        finally {
            setSubmitting(false);
        }
    };
    if (loading)
        return _jsx("div", { className: "spinner" });
    return (_jsxs("div", { className: "animate-in", children: [_jsxs("div", { className: "page-header", children: [_jsx("h1", { children: "Request a Role" }), _jsxs("p", { children: ["You're currently a ", _jsx("strong", { style: { color: 'var(--wine-700)' }, children: user?.role }), ". Submit a request to upgrade your access level."] })] }), _jsxs("div", { className: "role-request-layout", children: [_jsxs("div", { children: [!hasPending ? (_jsxs("div", { className: "section-panel", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 'var(--space-xl)' }, children: [_jsx("div", { style: {
                                                    width: 44, height: 44,
                                                    background: 'var(--wine-50)',
                                                    border: '1px solid var(--wine-100)',
                                                    borderRadius: 12,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: '1.3rem',
                                                }, children: "\uD83D\uDD11" }), _jsxs("div", { children: [_jsx("h3", { style: { margin: 0, fontSize: '1.05rem' }, children: "New Role Request" }), _jsx("p", { className: "text-muted text-sm", style: { marginTop: 2 }, children: "Requests are reviewed by the super administrator" })] })] }), error && _jsx("div", { className: "error-msg", children: error }), success && (_jsx("div", { className: "info-box info-box--success", style: { marginBottom: 'var(--space-lg)' }, children: success })), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Requested Role" }), _jsxs("select", { value: requestedRole, onChange: (e) => setRequestedRole(e.target.value), children: [_jsx("option", { value: "ADMIN", children: "Admin \u2014 Manage group orders and wines" }), _jsx("option", { value: "RETAIL", children: "Retailer \u2014 Access retail pricing and features" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Reason (optional)" }), _jsx("textarea", { value: reason, onChange: (e) => setReason(e.target.value), placeholder: "Briefly explain why you need this role...", rows: 4, style: {
                                                            width: '100%',
                                                            padding: '0.75rem 1rem',
                                                            border: '1.5px solid var(--gray-200)',
                                                            borderRadius: 'var(--radius-sm)',
                                                            fontFamily: 'var(--font-sans)',
                                                            fontSize: '0.925rem',
                                                            color: 'var(--gray-800)',
                                                            outline: 'none',
                                                            resize: 'vertical',
                                                            boxSizing: 'border-box',
                                                            transition: 'border-color 0.2s, box-shadow 0.2s',
                                                        }, onFocus: (e) => {
                                                            e.currentTarget.style.borderColor = 'var(--wine-400)';
                                                            e.currentTarget.style.boxShadow = '0 0 0 4px var(--wine-50)';
                                                        }, onBlur: (e) => {
                                                            e.currentTarget.style.borderColor = 'var(--gray-200)';
                                                            e.currentTarget.style.boxShadow = 'none';
                                                        } })] }), _jsx("button", { type: "submit", className: "btn btn--primary", disabled: submitting, children: submitting ? 'Submitting...' : 'Submit Request →' })] })] })) : (_jsxs("div", { className: "section-panel", style: { textAlign: 'center', padding: 'var(--space-3xl)' }, children: [_jsx("div", { style: { fontSize: '3rem', marginBottom: 'var(--space-md)' }, children: "\u23F3" }), _jsx("h3", { style: { marginBottom: 'var(--space-sm)' }, children: "Request Under Review" }), _jsx("p", { className: "text-muted", style: { maxWidth: 360, margin: '0 auto' }, children: "Your role request is pending review. The super admin will approve or deny it shortly. You'll be notified once a decision is made." })] })), requests.length > 0 && (_jsxs("div", { className: "section-panel", style: { marginTop: 'var(--space-lg)' }, children: [_jsx("h3", { style: { marginBottom: 'var(--space-lg)', fontFamily: 'var(--font-display)' }, children: "Request History" }), _jsx("div", { className: "table-wrap", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Requested Role" }), _jsx("th", { children: "Reason" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Submitted" })] }) }), _jsx("tbody", { children: requests.map((r) => {
                                                        const s = STATUS_STYLES[r.status] ?? STATUS_STYLES.PENDING;
                                                        return (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 700, color: 'var(--gray-900)' }, children: r.requestedRole }), _jsx("td", { className: "text-muted text-sm", style: { maxWidth: 200 }, children: r.reason || '—' }), _jsx("td", { children: _jsxs("span", { style: {
                                                                            display: 'inline-flex',
                                                                            alignItems: 'center',
                                                                            gap: 5,
                                                                            padding: '4px 12px',
                                                                            borderRadius: 'var(--radius-full)',
                                                                            fontSize: '0.75rem',
                                                                            fontWeight: 700,
                                                                            background: s.bg,
                                                                            color: s.color,
                                                                            border: `1px solid ${s.border}`,
                                                                        }, children: [s.icon, " ", r.status] }) }), _jsx("td", { className: "text-muted text-sm", children: new Date(r.createdAt).toLocaleDateString() })] }, r.id));
                                                    }) })] }) })] }))] }), _jsx("div", { children: _jsxs("div", { className: "section-panel", style: { background: 'linear-gradient(155deg, var(--wine-950), var(--wine-800))', border: 'none', color: 'white' }, children: [_jsx("h3", { style: { color: 'white', fontFamily: 'var(--font-display)', marginBottom: 'var(--space-lg)' }, children: "Available Roles" }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }, children: [
                                        { role: 'Admin', icon: '⚙️', desc: 'Create and manage group orders, wines, and shipping sites.' },
                                        { role: 'Retailer', icon: '🏪', desc: 'Access wholesale pricing and retailer-specific features.' },
                                    ].map(({ role, icon, desc }) => (_jsxs("div", { style: {
                                            padding: 'var(--space-md)',
                                            background: 'rgba(255,255,255,0.07)',
                                            border: '1px solid rgba(255,255,255,0.12)',
                                            borderRadius: 'var(--radius-md)',
                                        }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }, children: [_jsx("span", { style: { fontSize: '1.1rem' }, children: icon }), _jsx("strong", { style: { color: 'var(--gold-300)', fontSize: '0.9rem' }, children: role })] }), _jsx("p", { style: { color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', margin: 0, lineHeight: 1.55 }, children: desc })] }, role))) }), _jsx("div", { style: { marginTop: 'var(--space-lg)', paddingTop: 'var(--space-lg)', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }, children: "Role changes take effect immediately upon approval." })] }) })] })] }));
}
//# sourceMappingURL=RoleRequestPage.js.map