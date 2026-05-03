import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import type { UserRole } from '@wine-order-app/shared-types';

interface Props {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export function ProtectedRoute({ children, requiredRole }: Props) {
  const user = useAuthStore((s) => s.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole) {
    // SUPER_ADMIN can access any role-restricted route
    const hasAccess =
      user.role === 'SUPER_ADMIN' || user.role === requiredRole;
    if (!hasAccess) {
      return <Navigate to="/wines" replace />;
    }
  }

  return <>{children}</>;
}
