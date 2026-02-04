import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// ProtectedRoute: enforces authentication and optional role-based access.
// - `requiredRole` may be a string (single role) or an array of roles.
// - When unauthenticated -> redirect to `/login`.
// - When authenticated but role not allowed -> redirect to the user's own dashboard.
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    // Keep simple loading placeholder while auth state hydrates
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Normalize requiredRole to array for easier checks
  const allowed = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : null);

  if (allowed && !allowed.includes(user?.role)) {
    // If the user is authenticated but not permitted for the route,
    // send them to their role-specific dashboard to avoid leaking UI for other roles.
    const roleToDashboard = {
      student: '/dashboard/student',
      owner: '/dashboard/owner',
      admin: '/dashboard/admin',
    };

    const redirectTo = roleToDashboard[user?.role] || '/';
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};
