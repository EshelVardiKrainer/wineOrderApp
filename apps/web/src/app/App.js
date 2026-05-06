import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '../stores/auth.store';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { WineCatalogPage } from '../pages/WineCatalogPage';
import { WinePage } from '../pages/WinePage';
import { CartPage } from '../pages/CartPage';
import { GroupOrdersPage } from '../pages/GroupOrdersPage';
import { GroupOrderDetailPage } from '../pages/GroupOrderDetailPage';
import { GroupRequestPage } from '../pages/GroupRequestPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { AdminPage } from '../pages/AdminPage';
import { RoleRequestPage } from '../pages/RoleRequestPage';
import { PaymentSuccessPage } from '../pages/PaymentSuccessPage';
import { PaymentCancelPage } from '../pages/PaymentCancelPage';
import { ProtectedRoute } from '../components/ProtectedRoute';
import { GroupManagementPage } from '../pages/GroupManagementPage';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
export function App() {
    const hydrate = useAuthStore((s) => s.hydrate);
    const user = useAuthStore((s) => s.user);
    useEffect(() => {
        hydrate();
    }, [hydrate]);
    return (_jsxs(GoogleOAuthProvider, { clientId: GOOGLE_CLIENT_ID, children: [_jsx(Navbar, {}), _jsx("div", { className: "container", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/wines/:id", element: _jsx(WinePage, {}) }), _jsx(Route, { path: "/wines", element: _jsx(WineCatalogPage, {}) }), _jsx(Route, { path: "/payment/success", element: _jsx(PaymentSuccessPage, {}) }), _jsx(Route, { path: "/payment/cancel", element: _jsx(PaymentCancelPage, {}) }), _jsx(Route, { path: "/cart", element: _jsx(ProtectedRoute, { children: _jsx(CartPage, {}) }) }), _jsx(Route, { path: "/group-orders", element: _jsx(ProtectedRoute, { children: _jsx(GroupOrdersPage, {}) }) }), _jsx(Route, { path: "/groups/request", element: _jsx(ProtectedRoute, { children: _jsx(GroupRequestPage, {}) }) }), _jsx(Route, { path: "/groups/manage", element: _jsx(ProtectedRoute, { children: _jsx(GroupManagementPage, {}) }) }), _jsx(Route, { path: "/group-orders/:id", element: _jsx(ProtectedRoute, { children: _jsx(GroupOrderDetailPage, {}) }) }), _jsx(Route, { path: "/my-orders", element: _jsx(ProtectedRoute, { children: _jsx(MyOrdersPage, {}) }) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { requiredRole: "ADMIN", children: _jsx(AdminPage, {}) }) }), _jsx(Route, { path: "/request-role", element: _jsx(ProtectedRoute, { children: _jsx(RoleRequestPage, {}) }) }), _jsx(Route, { path: "/", element: _jsx(HomePage, {}) })] }) }), _jsx(Footer, {})] }));
}
//# sourceMappingURL=App.js.map