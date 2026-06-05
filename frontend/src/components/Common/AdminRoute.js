/**
 * Admin Route Guard
 * ==================
 * Wraps routes requiring admin privileges.
 * Redirects non-admin users to /app/dashboard.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Leaf, ShieldAlert } from 'lucide-react';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl mb-4 animate-pulse">
            <Leaf className="h-8 w-8 text-white" />
          </div>
          <p className="text-sm text-surface-500 mt-3">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Access Denied</h2>
          <p className="text-surface-500 dark:text-surface-400 mb-6">You don't have admin privileges to access this area.</p>
          <a href="/app/dashboard" className="btn-primary">Back to Dashboard</a>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
