import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';

// Dynamic root redirect based on logged in user's role
const HomeRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'ROLE_ADMIN' || user?.role === 'ADMIN') return <Navigate to="/admin" replace />;
  if (user?.role === 'ROLE_VENDOR' || user?.role === 'VENDOR') return <Navigate to="/vendor" replace />;
  return <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Auth */}
            <Route path="/login" element={<Login />} />

            {/* Admin Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_ADMIN', 'ADMIN']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* Vendor Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_VENDOR', 'VENDOR']} />}>
              <Route path="/vendor" element={<VendorDashboard />} />
            </Route>

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute allowedRoles={['ROLE_USER', 'USER']} />}>
              <Route path="/dashboard" element={<UserDashboard />} />
            </Route>

            {/* Dynamic Root & Catch-all Redirect */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<HomeRedirect />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
