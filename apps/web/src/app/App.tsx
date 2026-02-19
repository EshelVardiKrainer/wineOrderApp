import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import { Navbar } from '../components/Navbar';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { WineCatalogPage } from '../pages/WineCatalogPage';
import { CartPage } from '../pages/CartPage';
import { GroupOrdersPage } from '../pages/GroupOrdersPage';
import { GroupOrderDetailPage } from '../pages/GroupOrderDetailPage';
import { MyOrdersPage } from '../pages/MyOrdersPage';
import { AdminPage } from '../pages/AdminPage';
import { ProtectedRoute } from '../components/ProtectedRoute';

export function App() {
  const hydrate = useAuthStore((s) => s.hydrate);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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

          <Route path="/" element={<Navigate to="/wines" replace />} />
        </Routes>
      </div>
    </>
  );
}
