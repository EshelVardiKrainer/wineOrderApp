import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '../stores/auth.store';
import { Navbar } from '../components/Navbar';
import { LoginPage } from '../pages/LoginPage';
import { WineCatalogPage } from '../pages/WineCatalogPage';
import { CartPage } from '../pages/CartPage';
import { GroupOrdersPage } from '../pages/GroupOrdersPage';
import { GroupOrderDetailPage } from '../pages/GroupOrderDetailPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { AdminPage } from '../pages/AdminPage';
import { RoleRequestPage } from '../pages/RoleRequestPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/wines" element={<WineCatalogPage />} />

          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <CartPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/group-orders"
            element={
              <ProtectedRoute>
                <GroupOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/group-orders/:id"
            element={
              <ProtectedRoute>
                <GroupOrderDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/request-role"
            element={
              <ProtectedRoute>
                <RoleRequestPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/wines" replace />} />
        </Routes>
      </div>
    </GoogleOAuthProvider>
  );
}
