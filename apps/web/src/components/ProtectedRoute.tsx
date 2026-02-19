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

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/wines" replace />;
  }

  return <>{children}</>;
}
