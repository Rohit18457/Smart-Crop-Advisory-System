/**
 * Protected Route
 * ================
 * Wraps routes that require authentication.
 * Redirects to /login if no active session.
 * Shows a loading spinner while checking auth state.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 animate-pulse">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <div className="dot-pulse justify-center">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p className="text-sm text-surface-500 mt-3">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
