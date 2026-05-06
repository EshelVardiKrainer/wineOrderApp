import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useCartStore } from '../stores/cart.store';
import { useEffect, useState } from 'react';
import { roleRequestsApi } from '../api/client';
import { useTranslation } from 'react-i18next';
const WineGlassIcon = () => (_jsxs("svg", { width: "20", height: "20", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M8 2L16 2L14 10C13.5 13 11 14 11 14L11 20L14 20L14 22L10 22L10 20L13 20L13 14C13 14 10.5 13 10 10L8 2Z", fill: "rgba(255,255,255,0.9)", stroke: "rgba(255,255,255,0.2)", strokeWidth: "0.5" }), _jsx("ellipse", { cx: "12", cy: "7", rx: "3.5", ry: "2", fill: "rgba(201,168,76,0.3)" }), _jsx("rect", { x: "9", y: "20", width: "6", height: "1.5", rx: "0.75", fill: "rgba(255,255,255,0.7)" })] }));
export function Navbar() {
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);
    const cart = useCartStore((s) => s.cart);
    const fetchCart = useCartStore((s) => s.fetchCart);
    const location = useLocation();
    const [pendingCount, setPendingCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const { t } = useTranslation();
    useEffect(() => {
        if (user)
            fetchCart();
    }, [user, fetchCart]);
    useEffect(() => {
        if (user?.role === 'SUPER_ADMIN') {
            roleRequestsApi.getPendingCount().then((res) => setPendingCount(res.count)).catch(() => { });
        }
    }, [user, location.pathname]);
    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);
    const cartCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
    const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const navLinks = (_jsxs(_Fragment, { children: [_jsx(Link, { to: "/wines", className: isActive('/wines') ? 'active' : '', onClick: () => setMenuOpen(false), children: t('nav.catalog') }), user && (_jsx(Link, { to: "/group-orders", className: isActive('/group-orders') ? 'active' : '', onClick: () => setMenuOpen(false), children: t('nav.groupOrders') })), user && (_jsx(Link, { to: "/my-orders", className: isActive('/my-orders') ? 'active' : '', onClick: () => setMenuOpen(false), children: t('nav.myOrders') })), isAdminOrSuper && (_jsxs(Link, { to: "/admin", className: isActive('/admin') ? 'active' : '', style: { position: 'relative' }, onClick: () => setMenuOpen(false), children: [t('nav.admin'), user?.role === 'SUPER_ADMIN' && pendingCount > 0 && (_jsx("span", { style: {
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            background: '#ef4444',
                            color: 'white',
                            borderRadius: '999px',
                            minWidth: '16px',
                            height: '16px',
                            padding: '0 4px',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            animation: 'pop-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }, children: pendingCount }))] })), user?.role === 'CUSTOMER' && (_jsx(Link, { to: "/request-role", className: isActive('/request-role') ? 'active' : '', onClick: () => setMenuOpen(false), children: t('nav.requestRole') }))] }));
    return (_jsxs("nav", { className: "main-nav", children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center' }, children: [_jsxs(Link, { to: "/wines", className: "nav-brand", children: [_jsx("div", { className: "brand-icon", children: _jsx(WineGlassIcon, {}) }), _jsxs("div", { className: "brand-text", children: [_jsx("span", { children: "Wine Market" }), _jsx("span", { children: "Fine Wines & Group Orders" })] })] }), _jsx("div", { className: "nav-links", children: navLinks })] }), _jsxs("div", { className: "nav-right", children: [user && (_jsxs(Link, { to: "/cart", className: `nav-cart-link ${isActive('/cart') ? 'active' : ''}`, onClick: () => setMenuOpen(false), children: [_jsxs("svg", { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2.5", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("circle", { cx: "9", cy: "21", r: "1" }), _jsx("circle", { cx: "20", cy: "21", r: "1" }), _jsx("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })] }), t('nav.cart'), cartCount > 0 && _jsx("span", { className: "cart-count", children: cartCount })] })), user ? (_jsxs("div", { className: "nav-user nav-user--desktop", children: [_jsx("span", { className: "nav-user-name", children: user.name.split(' ')[0] }), _jsx("button", { className: "btn btn--ghost btn--small", style: { color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.8rem' }, onClick: logout, children: t('nav.signOut') })] })) : (_jsx(Link, { to: "/login", className: "nav-signin-btn", onClick: () => setMenuOpen(false), children: t('nav.signIn') })), _jsx("button", { className: "nav-hamburger", onClick: () => setMenuOpen((o) => !o), "aria-label": "Toggle menu", children: menuOpen ? '✕' : '☰' })] }), menuOpen && (_jsxs("div", { className: "nav-mobile-menu", children: [navLinks, user && (_jsxs("div", { className: "nav-mobile-footer", children: [_jsx("span", { className: "nav-user-name", children: user.name.split(' ')[0] }), _jsx("button", { className: "btn btn--ghost btn--small", style: { color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.12)', fontSize: '0.8rem' }, onClick: () => { logout(); setMenuOpen(false); }, children: t('nav.signOut') })] }))] }))] }));
}
//# sourceMappingURL=Navbar.js.map