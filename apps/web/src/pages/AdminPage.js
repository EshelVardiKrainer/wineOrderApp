import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { api, usersApi, roleRequestsApi, groupsApi } from '../api/client';
import { useAuthStore } from '../stores/auth.store';
export function AdminPage() {
    const user = useAuthStore((s) => s.user);
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';
    const [tab, setTab] = useState('orders');
    const TABS = [
        { id: 'orders', label: 'Orders', icon: '📦' },
        { id: 'wines', label: 'Wines', icon: '🍷' },
        { id: 'sites', label: 'Shipping Sites', icon: '🚚' },
        { id: 'groups', label: 'Group Requests', icon: '👥' },
        ...(isSuperAdmin ? [{ id: 'users', label: 'Users', icon: '👥' }] : []),
    ];
    return (_jsxs("div", { className: "animate-in", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }, children: [_jsxs("div", { className: "page-header", style: { margin: 0 }, children: [_jsx("h1", { children: "Admin Panel" }), _jsxs("p", { children: ["Manage your wine market operations", isSuperAdmin ? ' and users' : ''] })] }), _jsx("div", { style: {
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 16px',
                            background: isSuperAdmin ? 'var(--wine-50)' : 'var(--info-50)',
                            border: `1px solid ${isSuperAdmin ? 'var(--wine-100)' : 'rgba(59,130,246,0.2)'}`,
                            borderRadius: 'var(--radius-full)',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: isSuperAdmin ? 'var(--wine-700)' : 'var(--info-700)',
                        }, children: isSuperAdmin ? '⚡ Super Admin' : '🔑 Admin' })] }), _jsx("div", { className: "tab-bar", style: { marginBottom: 'var(--space-xl)' }, children: TABS.map((t) => (_jsxs("button", { className: `tab-item ${tab === t.id ? 'tab-item--active' : ''}`, onClick: () => setTab(t.id), children: [t.icon, " ", t.label] }, t.id))) }), tab === 'orders' && _jsx(OrdersAdmin, {}), tab === 'wines' && _jsx(WinesAdmin, {}), tab === 'sites' && _jsx(SitesAdmin, {}), tab === 'groups' && _jsx(GroupsAdmin, {}), tab === 'users' && isSuperAdmin && _jsx(UsersAdmin, {})] }));
}
// ─── Orders Admin ──────────────────────────────────────────────────
function OrdersAdmin() {
    const [groupOrders, setGroupOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get('/group-orders').then((orders) => {
            setGroupOrders(orders);
            setLoading(false);
        });
    }, []);
    const filtered = useMemo(() => {
        if (statusFilter === 'all')
            return groupOrders;
        return groupOrders.filter((go) => go.status === statusFilter);
    }, [groupOrders, statusFilter]);
    const siteGroups = useMemo(() => {
        const map = new Map();
        for (const go of filtered) {
            const siteId = go.shippingSiteId;
            if (!map.has(siteId)) {
                map.set(siteId, { site: go.shippingSite, orders: [], siteTotal: 0 });
            }
            const group = map.get(siteId);
            group.orders.push(go);
            for (const p of go.participants) {
                for (const item of p.orderItems) {
                    group.siteTotal += item.quantity * item.unitPrice;
                }
            }
        }
        return Array.from(map.values());
    }, [filtered]);
    if (loading)
        return _jsx("div", { className: "spinner" });
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { style: { fontFamily: 'var(--font-display)' }, children: "All Orders" }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', alignItems: 'center' }, children: [_jsx("span", { className: "text-muted text-sm", style: { fontWeight: 600 }, children: "Filter:" }), _jsxs("select", { value: statusFilter, onChange: (e) => setStatusFilter(e.target.value), style: {
                                    padding: '0.5rem 0.85rem',
                                    borderRadius: 'var(--radius-sm)',
                                    border: '1.5px solid var(--gray-200)',
                                    fontSize: '0.875rem',
                                    fontFamily: 'var(--font-sans)',
                                    outline: 'none',
                                    background: 'white',
                                    cursor: 'pointer',
                                }, children: [_jsx("option", { value: "all", children: "All Statuses" }), _jsx("option", { value: "open", children: "Open" }), _jsx("option", { value: "closed", children: "Closed" }), _jsx("option", { value: "submitted", children: "Submitted" }), _jsx("option", { value: "shipped", children: "Shipped" })] })] })] }), siteGroups.length === 0 ? (_jsxs("div", { className: "empty-state", children: [_jsx("span", { className: "empty-state-icon", children: "\uD83D\uDCE6" }), _jsx("h3", { children: "No orders found" }), _jsx("p", { children: "Try adjusting your status filter." })] })) : (siteGroups.map((sg) => (_jsxs("div", { className: "section-panel", style: { marginBottom: 'var(--space-lg)', padding: 0, overflow: 'hidden' }, children: [_jsxs("div", { style: {
                            background: 'linear-gradient(135deg, var(--gray-800) 0%, var(--gray-900) 100%)',
                            padding: 'var(--space-md) var(--space-xl)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 'var(--space-md)',
                        }, children: [_jsxs("div", { style: { color: 'white' }, children: [_jsxs("h3", { style: { margin: 0, fontSize: '1.05rem', color: 'white', fontFamily: 'var(--font-display)' }, children: ["\uD83D\uDCCD ", sg.site.name] }), _jsxs("p", { style: { margin: '2px 0 0', fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)' }, children: [sg.site.address, ", ", sg.site.city] })] }), _jsxs("div", { style: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-lg)', textAlign: 'center' }, children: [_jsxs("div", { style: { fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-300)', fontFamily: 'var(--font-display)' }, children: ["\u20AA", sg.siteTotal.toFixed(2)] }), _jsx("div", { style: { fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }, children: "Site Total" })] })] }), _jsx("div", { style: { padding: 'var(--space-lg) var(--space-xl)' }, children: sg.orders.map((go) => {
                            const goTotal = go.participants.reduce((sum, p) => sum + p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
                            return (_jsxs("div", { style: {
                                    marginBottom: 'var(--space-md)',
                                    padding: 'var(--space-md)',
                                    background: 'var(--gray-50)',
                                    borderRadius: 'var(--radius-md)',
                                    border: '1px solid var(--gray-100)',
                                }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-sm)' }, children: _jsxs("div", { children: [_jsxs("strong", { style: { color: 'var(--gray-900)' }, children: ["Order #", go.id.slice(0, 8)] }), ' ', _jsx("span", { className: `badge badge--${go.status}`, children: go.status }), _jsxs("p", { className: "text-muted text-xs", style: { margin: '2px 0 0' }, children: [new Date(go.createdAt).toLocaleDateString(), " \u00B7 ", go.participants.length, " participant(s) \u00B7 \u20AA", goTotal.toFixed(2)] })] }) }), go.participants.length === 0 ? (_jsx("p", { className: "text-muted text-sm", children: "No participants yet." })) : (go.participants.map((p) => {
                                        const pTotal = p.orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                                        return (_jsxs("div", { style: {
                                                marginBottom: 'var(--space-sm)',
                                                padding: 'var(--space-sm) var(--space-md)',
                                                background: 'white',
                                                border: '1px solid var(--gray-200)',
                                                borderRadius: 'var(--radius-sm)',
                                            }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("strong", { style: { color: 'var(--gray-900)' }, children: p.user.name }), ' ', _jsx("span", { className: "text-muted text-sm", children: p.user.email })] }), _jsxs("span", { style: { fontWeight: 700, color: 'var(--wine-700)' }, children: ["\u20AA", pTotal.toFixed(2)] })] }), p.orderItems.length > 0 && (_jsxs("table", { style: { marginTop: 'var(--space-sm)', fontSize: '0.85rem' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Wine" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Unit Price" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: p.orderItems.map((item) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 500 }, children: item.wine.name }), _jsx("td", { children: item.quantity }), _jsxs("td", { children: ["\u20AA", item.unitPrice.toFixed(2)] }), _jsxs("td", { style: { fontWeight: 600, color: 'var(--wine-700)' }, children: ["\u20AA", (item.quantity * item.unitPrice).toFixed(2)] })] }, item.id))) })] }))] }, p.id));
                                    }))] }, go.id));
                        }) })] }, sg.site.id))))] }));
}
// ─── Wines Admin ───────────────────────────────────────────────────
function WinesAdmin() {
    const [wines, setWines] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        color: 'red',
        description: '',
        price: 0,
        region: '',
        vintage: 2024,
        stock: 0,
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState('');
    const fetchWines = async () => {
        const res = await api.get('/wines?limit=100');
        setWines(res.items);
    };
    useEffect(() => { fetchWines(); }, []);
    const handleImageChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setImageFile(file);
        setImagePreview(file ? URL.createObjectURL(file) : null);
    };
    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const wine = await api.post('/wines', form);
            if (imageFile) {
                const fd = new FormData();
                fd.append('image', imageFile);
                await api.upload(`/wines/${wine.id}/image`, fd);
            }
            setForm({ name: '', color: 'red', description: '', price: 0, region: '', vintage: 2024, stock: 0 });
            setImageFile(null);
            setImagePreview(null);
            setShowForm(false);
            fetchWines();
        }
        catch (err) {
            setError(err.message);
        }
    };
    const handleDelete = async (id) => {
        if (!confirm('Delete this wine?'))
            return;
        await api.delete(`/wines/${id}`);
        fetchWines();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "section-header", children: [_jsxs("h2", { children: ["Wines (", wines.length, ")"] }), _jsx("button", { className: "btn btn--primary", onClick: () => setShowForm(!showForm), children: showForm ? 'Cancel' : '+ Add Wine' })] }), error && _jsx("div", { className: "error-msg", children: error }), showForm && (_jsxs("form", { onSubmit: handleCreate, className: "section-panel", style: { marginBottom: 'var(--space-lg)', background: 'var(--gray-50)' }, children: [_jsxs("div", { className: "form-grid-2", children: [_jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Name" }), _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Region" }), _jsx("input", { value: form.region, onChange: (e) => setForm({ ...form, region: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Color" }), _jsxs("select", { value: form.color || 'red', onChange: (e) => setForm({ ...form, color: e.target.value }), children: [_jsx("option", { value: "red", children: "\uD83C\uDF39 Red" }), _jsx("option", { value: "rose", children: "\uD83E\uDDA9 Ros\u00E9" }), _jsx("option", { value: "white", children: "\u26AA\uFE0F White" }), _jsx("option", { value: "orange", children: "\uD83D\uDC05 Orange" })] })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Price (\u20AA)" }), _jsx("input", { type: "number", step: "0.01", value: form.price, onChange: (e) => setForm({ ...form, price: Number(e.target.value) }), required: true })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Vintage" }), _jsx("input", { type: "number", value: form.vintage, onChange: (e) => setForm({ ...form, vintage: Number(e.target.value) }), required: true })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Stock" }), _jsx("input", { type: "number", value: form.stock, onChange: (e) => setForm({ ...form, stock: Number(e.target.value) }), required: true })] }), _jsxs("div", { className: "form-group", style: { gridColumn: '1 / -1', marginBottom: 0 }, children: [_jsx("label", { children: "Description" }), _jsx("input", { value: form.description, onChange: (e) => setForm({ ...form, description: e.target.value }), placeholder: "A brief description of the wine..." })] }), _jsxs("div", { className: "form-group", style: { gridColumn: '1 / -1', marginBottom: 0 }, children: [_jsxs("label", { children: ["Image ", _jsx("span", { style: { fontWeight: 400, color: 'var(--gray-500)' }, children: "(optional, max 5 MB)" })] }), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageChange }), imagePreview && (_jsx("div", { style: { marginTop: 8 }, children: _jsx("img", { src: imagePreview, alt: "preview", style: { height: 120, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--gray-200)' } }) }))] })] }), _jsx("div", { style: { marginTop: 'var(--space-lg)' }, children: _jsx("button", { className: "btn btn--success", type: "submit", children: "Create Wine" }) })] })), _jsx("div", { className: "section-panel", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Color" }), _jsx("th", { children: "Region" }), _jsx("th", { children: "Vintage" }), _jsx("th", { children: "Price" }), _jsx("th", { children: "Stock" }), _jsx("th", { style: { width: 80 } })] }) }), _jsx("tbody", { children: wines.map((w) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600, color: 'var(--gray-900)' }, children: w.name }), _jsx("td", { children: w.color === 'red' ? '🌹' : w.color === 'rose' ? '🦩' : w.color === 'white' ? '⚪️' : '🐅' }), _jsx("td", { className: "text-muted", children: w.region }), _jsx("td", { children: w.vintage }), _jsxs("td", { style: { fontWeight: 600, color: 'var(--wine-700)' }, children: ["\u20AA", w.price.toFixed(2)] }), _jsx("td", { children: w.stock }), _jsx("td", { children: _jsx("button", { className: "btn btn--danger btn--small", onClick: () => handleDelete(w.id), children: "Delete" }) })] }, w.id))) })] }) })] }));
}
// ─── Shipping Sites Admin ──────────────────────────────────────────
function SitesAdmin() {
    const [sites, setSites] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        name: '',
        address: '',
        city: '',
    });
    const [error, setError] = useState('');
    const fetchSites = async () => {
        const res = await api.get('/shipping-sites/all');
        setSites(res);
    };
    useEffect(() => {
        fetchSites();
    }, []);
    const handleCreate = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/shipping-sites', form);
            setForm({ name: '', address: '', city: '' });
            setShowForm(false);
            fetchSites();
        }
        catch (err) {
            setError(err.message);
        }
    };
    const handleToggle = async (site) => {
        await api.patch(`/shipping-sites/${site.id}`, {
            isActive: !site.isActive,
        });
        fetchSites();
    };
    const handleDelete = async (id) => {
        if (!confirm('Delete this shipping site?'))
            return;
        await api.delete(`/shipping-sites/${id}`);
        fetchSites();
    };
    return (_jsxs(_Fragment, { children: [_jsxs("div", { className: "section-header", children: [_jsxs("h2", { children: ["Shipping Sites (", sites.length, ")"] }), _jsx("button", { className: "btn btn--primary", onClick: () => setShowForm(!showForm), children: showForm ? 'Cancel' : '+ Add Site' })] }), error && _jsx("div", { className: "error-msg", children: error }), showForm && (_jsxs("form", { onSubmit: handleCreate, className: "section-panel", style: { marginBottom: 'var(--space-lg)', background: 'var(--gray-50)' }, children: [_jsxs("div", { className: "form-grid-3", children: [_jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Name" }), _jsx("input", { value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "Address" }), _jsx("input", { value: form.address, onChange: (e) => setForm({ ...form, address: e.target.value }), required: true })] }), _jsxs("div", { className: "form-group", style: { marginBottom: 0 }, children: [_jsx("label", { children: "City" }), _jsx("input", { value: form.city, onChange: (e) => setForm({ ...form, city: e.target.value }), required: true })] })] }), _jsx("div", { style: { marginTop: 'var(--space-lg)' }, children: _jsx("button", { className: "btn btn--success", type: "submit", children: "Create Site" }) })] })), _jsx("div", { className: "section-panel", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Address" }), _jsx("th", { children: "City" }), _jsx("th", { children: "Status" }), _jsx("th", { style: { width: 80 } })] }) }), _jsx("tbody", { children: sites.map((s) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600, color: 'var(--gray-900)' }, children: s.name }), _jsx("td", { className: "text-muted", children: s.address }), _jsx("td", { children: s.city }), _jsx("td", { children: _jsx("button", { className: `btn btn--small ${s.isActive ? 'btn--success' : 'btn--secondary'}`, onClick: () => handleToggle(s), children: s.isActive ? 'Active' : 'Inactive' }) }), _jsx("td", { children: _jsx("button", { className: "btn btn--danger btn--small", onClick: () => handleDelete(s.id), children: "Delete" }) })] }, s.id))) })] }) })] }));
}
// ─── Users & Role Requests Admin (SUPER_ADMIN) ────────────
function UsersAdmin() {
    const [users, setUsers] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const fetchData = async () => {
        try {
            const [usersData, requestsData] = await Promise.all([
                usersApi.getAll(),
                roleRequestsApi.getPending(),
            ]);
            setUsers(usersData);
            setPendingRequests(requestsData);
        }
        catch {
            // ignore
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, []);
    const filteredUsers = useMemo(() => {
        if (!search)
            return users;
        const q = search.toLowerCase();
        return users.filter((u) => u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q));
    }, [users, search]);
    const handleRoleChange = async (userId, newRole) => {
        setActionLoading(userId);
        try {
            await usersApi.updateRole(userId, newRole);
            await fetchData();
        }
        catch (err) {
            alert(err.message || 'Failed to update role');
        }
        finally {
            setActionLoading(null);
        }
    };
    const handleReview = async (requestId, status) => {
        setActionLoading(requestId);
        try {
            await roleRequestsApi.review(requestId, status);
            await fetchData();
        }
        catch (err) {
            alert(err.message || 'Failed to review request');
        }
        finally {
            setActionLoading(null);
        }
    };
    if (loading)
        return _jsx("div", { className: "spinner" });
    const roleColorMap = {
        SUPER_ADMIN: 'var(--wine-700)',
        ADMIN: 'var(--info-700)',
        RETAIL: 'var(--success-700)',
        CUSTOMER: 'var(--gray-500)',
    };
    const roleBgMap = {
        SUPER_ADMIN: 'var(--wine-50)',
        ADMIN: 'var(--info-50)',
        RETAIL: 'var(--success-50)',
        CUSTOMER: 'var(--gray-100)',
    };
    return (_jsxs(_Fragment, { children: [pendingRequests.length > 0 && (_jsxs(_Fragment, { children: [_jsx("div", { className: "section-header", children: _jsxs("h2", { children: ["Pending Role Requests (", pendingRequests.length, ")"] }) }), _jsx("div", { className: "section-panel", style: { marginBottom: 'var(--space-xl)' }, children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "User" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Current Role" }), _jsx("th", { children: "Requested Role" }), _jsx("th", { children: "Reason" }), _jsx("th", { children: "Date" }), _jsx("th", { style: { width: 180 }, children: "Actions" })] }) }), _jsx("tbody", { children: pendingRequests.map((req) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600, color: 'var(--gray-900)' }, children: req.user.name }), _jsx("td", { className: "text-muted", children: req.user.email }), _jsx("td", { children: _jsx("span", { style: {
                                                        padding: '3px 10px',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        background: roleBgMap[req.user.role] || 'var(--gray-100)',
                                                        color: roleColorMap[req.user.role] || 'var(--gray-600)',
                                                    }, children: req.user.role }) }), _jsx("td", { children: _jsx("span", { style: {
                                                        padding: '3px 10px',
                                                        borderRadius: '999px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        background: roleBgMap[req.requestedRole] || 'var(--gray-100)',
                                                        color: roleColorMap[req.requestedRole] || 'var(--gray-600)',
                                                    }, children: req.requestedRole }) }), _jsx("td", { className: "text-muted text-sm", style: { maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: req.reason || '—' }), _jsx("td", { className: "text-muted text-sm", children: new Date(req.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsxs("div", { style: { display: 'flex', gap: '0.5rem' }, children: [_jsx("button", { className: "btn btn--success btn--small", disabled: actionLoading === req.id, onClick: () => handleReview(req.id, 'APPROVED'), children: "Approve" }), _jsx("button", { className: "btn btn--danger btn--small", disabled: actionLoading === req.id, onClick: () => handleReview(req.id, 'DENIED'), children: "Deny" })] }) })] }, req.id))) })] }) })] })), _jsxs("div", { className: "section-header", children: [_jsxs("h2", { children: ["All Users (", users.length, ")"] }), _jsx("input", { placeholder: "Search users...", value: search, onChange: (e) => setSearch(e.target.value), style: {
                            padding: '0.5rem 0.85rem',
                            border: '1.5px solid var(--gray-200)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.875rem',
                            fontFamily: 'var(--font-sans)',
                            outline: 'none',
                            width: 250,
                        } })] }), _jsx("div", { className: "section-panel", children: _jsxs("table", { children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Current Role" }), _jsx("th", { children: "Change Role" }), _jsx("th", { children: "Joined" })] }) }), _jsx("tbody", { children: filteredUsers.map((u) => (_jsxs("tr", { children: [_jsx("td", { style: { fontWeight: 600, color: 'var(--gray-900)' }, children: u.name }), _jsx("td", { className: "text-muted", children: u.email }), _jsx("td", { children: _jsx("span", { style: {
                                                padding: '3px 10px',
                                                borderRadius: '999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: roleBgMap[u.role] || 'var(--gray-100)',
                                                color: roleColorMap[u.role] || 'var(--gray-600)',
                                            }, children: u.role }) }), _jsx("td", { children: u.role === 'SUPER_ADMIN' ? (_jsx("span", { className: "text-muted text-sm", children: "\u2014" })) : (_jsxs("select", { value: u.role, disabled: actionLoading === u.id, onChange: (e) => handleRoleChange(u.id, e.target.value), style: {
                                                padding: '0.35rem 0.7rem',
                                                borderRadius: '6px',
                                                border: '1.5px solid var(--gray-200)',
                                                fontSize: '0.8rem',
                                                fontFamily: 'var(--font-sans)',
                                                outline: 'none',
                                                cursor: 'pointer',
                                            }, children: [_jsx("option", { value: "CUSTOMER", children: "CUSTOMER" }), _jsx("option", { value: "RETAIL", children: "RETAIL" }), _jsx("option", { value: "ADMIN", children: "ADMIN" })] })) }), _jsx("td", { className: "text-muted text-sm", children: new Date(u.createdAt).toLocaleDateString() })] }, u.id))) })] }) })] }));
}
function GroupsAdmin() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        groupsApi.getPendingGroups().then(setGroups).finally(() => setLoading(false));
    }, []);
    const handleApprove = async (id) => {
        await groupsApi.approveGroup(id);
        setGroups(groups.filter(g => g.id !== id));
    };
    if (loading)
        return _jsx("div", { children: "Loading..." });
    return (_jsxs("div", { children: [_jsx("h2", { children: "Pending Groups" }), groups.length === 0 && _jsx("p", { children: "No pending groups" }), groups.map(g => (_jsxs("div", { className: "card", style: { marginBottom: '1rem' }, children: [_jsxs("h4", { children: ["Group Name: ", g.name] }), _jsxs("p", { children: ["Requested by: ", g.members?.find((m) => m.role === 'OWNER')?.user?.name] }), _jsxs("p", { children: ["Location: ", g.shippingSite?.name, " - ", g.shippingSite?.address] }), _jsx("button", { onClick: () => handleApprove(g.id), children: "Approve" })] }, g.id)))] }));
}
//# sourceMappingURL=AdminPage.js.map