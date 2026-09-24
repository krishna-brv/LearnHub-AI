import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);
  const storedToken = localStorage.getItem('accessToken');

  // Strict Auth Check: Redux auth state OR localStorage token MUST be present
  const isAuthed = (isAuthenticated || !!token) && !!storedToken;

  if (!isAuthed) {
    // Redirect unauthenticated user to /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role Check
  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
