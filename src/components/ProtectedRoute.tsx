import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { decodeJwt, StoreRole } from '../hooks/useJwtClaims';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** If provided, user's store_role must be in this list or they are redirected to /inventory */
  allowedRoles?: StoreRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, session, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check JWT claims for store_id
  const claims = session?.access_token ? decodeJwt(session.access_token) : null;
  if (!claims?.store_id) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional role guard
  if (allowedRoles && !allowedRoles.includes(claims.store_role)) {
    return <Navigate to="/inventory" replace />;
  }

  return <>{children}</>;
}
