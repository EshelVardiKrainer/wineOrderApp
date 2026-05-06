import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
export function ProtectedRoute({ children, requiredRole }) {
    const user = useAuthStore((s) => s.user);
    if (!user) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    if (requiredRole) {
        // SUPER_ADMIN can access any role-restricted route
        const hasAccess = user.role === 'SUPER_ADMIN' || user.role === requiredRole;
        if (!hasAccess) {
            return _jsx(Navigate, { to: "/wines", replace: true });
        }
    }
    return _jsx(_Fragment, { children: children });
}
//# sourceMappingURL=ProtectedRoute.js.map