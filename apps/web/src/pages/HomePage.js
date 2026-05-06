import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { useTranslation } from 'react-i18next';
const CARDS_GUEST = [
    { icon: '🍷', titleKey: 'home.browseWines', descKey: 'home.browseWinesDesc', labelKey: 'home.viewCatalog', to: '/wines' },
    { icon: '🔑', titleKey: 'home.signIn', descKey: 'home.signInDesc', labelKey: 'home.signIn', to: '/login' },
];
const CARDS_USER = [
    { icon: '🍷', titleKey: 'home.browseWines', descKey: 'home.browseWinesDesc', labelKey: 'home.viewCatalog', to: '/wines' },
    { icon: '🛒', titleKey: 'home.yourCart', descKey: 'home.yourCartDesc', labelKey: 'home.viewCart', to: '/cart' },
    { icon: '🤝', titleKey: 'home.groupOrders', descKey: 'home.groupOrdersDesc', labelKey: 'home.viewOrders', to: '/group-orders' },
    { icon: '📋', titleKey: 'home.myOrders', descKey: 'home.welcomeBackDesc', labelKey: 'home.myOrders', to: '/my-orders' },
];
export function HomePage() {
    const user = useAuthStore((s) => s.user);
    const { t } = useTranslation();
    const cards = user ? CARDS_USER : CARDS_GUEST;
    return (_jsxs("div", { className: "animate-in", children: [_jsx("div", { className: "home-hero", children: _jsxs("div", { className: "home-hero-inner", children: [_jsx("div", { className: "home-hero-badge", children: "\uD83C\uDF77 Wine Market" }), _jsx("h1", { className: "home-hero-title", children: t('home.welcome') }), _jsx("p", { className: "home-hero-sub", children: t('home.subtitle') }), user && (_jsx("p", { className: "home-hero-welcome", children: t('home.welcomeBack', { name: user.name.split(' ')[0] }) }))] }) }), _jsx("div", { className: "container", children: _jsxs("div", { className: "home-cards", children: [cards.map((card) => (_jsxs("div", { className: "home-card", children: [_jsx("div", { className: "home-card-icon", children: card.icon }), _jsxs("div", { className: "home-card-body", children: [_jsx("h3", { className: "home-card-title", children: t(card.titleKey) }), _jsx("p", { className: "home-card-desc", children: t(card.descKey) })] }), _jsxs(Link, { to: card.to, className: "btn btn--primary home-card-btn", children: [t(card.labelKey), " \u2192"] })] }, card.to))), user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (_jsxs("div", { className: "home-card home-card--dark", children: [_jsx("div", { className: "home-card-icon", children: "\u2699\uFE0F" }), _jsxs("div", { className: "home-card-body", children: [_jsx("h3", { className: "home-card-title", style: { color: 'var(--gold-300)' }, children: t('home.adminPanel') }), _jsx("p", { className: "home-card-desc", style: { color: 'rgba(255,255,255,0.55)' }, children: t('home.welcomeBackDesc') })] }), _jsxs(Link, { to: "/admin", className: "btn home-card-btn", style: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }, children: [t('home.adminPanel'), " \u2192"] })] }))] }) })] }));
}
//# sourceMappingURL=HomePage.js.map