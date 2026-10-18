import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '60vh' }}>
        <Loader2 className="spinner-icon" size={36} />
        <span>Verifying authentication...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="main-content">
        <div className="content-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h2 style={{ color: 'var(--danger)', marginBottom: '0.5rem' }}>Access Denied</h2>
          <p style={{ color: 'var(--gray-600)', marginBottom: '1.5rem' }}>
            You do not have the required permissions to view this page.
          </p>
          <a href="/login" className="btn btn-secondary">
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
