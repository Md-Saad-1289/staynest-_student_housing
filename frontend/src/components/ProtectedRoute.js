import React, { useContext, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';

// ProtectedRoute: enforces authentication and optional role-based access.
// - `requiredRole` may be a string (single role) or an array of roles.
// - When unauthenticated -> redirect to `/login`.
// - When authenticated but role not allowed -> redirect to the user's own dashboard.
export const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  // Normalize requiredRole to array for easier checks
  const allowed = Array.isArray(requiredRole) ? requiredRole : (requiredRole ? [requiredRole] : null);

  const [checking, setChecking] = useState(false);
  const [allowedAfterCheck, setAllowedAfterCheck] = useState(null);

  useEffect(() => {
    let mounted = true;
    const check = async () => {
      if (!allowed) return;
      // If user exists but role not allowed, try to refresh user from server once
      if (isAuthenticated && user && !allowed.includes(user.role)) {
        setChecking(true);
        try {
          const res = await authService.getCurrentUser();
          const fresh = res.data.user || res.data;
          if (!mounted) return;
          if (fresh && allowed.includes(fresh.role)) {
            setAllowedAfterCheck(true);
            return;
          }
          setAllowedAfterCheck(false);
        } catch (err) {
          setAllowedAfterCheck(false);
        } finally {
          if (mounted) setChecking(false);
        }
      }
    };
    check();
    return () => { mounted = false; };
  }, [isAuthenticated, user, allowed]);

  if (loading) {
    // Keep simple loading placeholder while auth state hydrates
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (checking) {
    return <div className="flex items-center justify-center min-h-screen">Checking permissions...</div>;
  }

  if (allowed && user && !allowed.includes(user.role) && allowedAfterCheck === false) {
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
