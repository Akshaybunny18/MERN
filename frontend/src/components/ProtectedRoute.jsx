import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * ProtectedRoute — Redirects to /login if not authenticated.
 * Optionally restricts to specific roles.
 *
 * @param {string[]} roles - Allowed roles. If empty/undefined, any authenticated user is allowed.
 * @param {string} redirectTo - Where to redirect if role check fails (defaults to /unauthorized).
 */
const ProtectedRoute = ({ children, roles = [], redirectTo = '/unauthorized' }) => {
  const location = useLocation();

  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo'));
  } catch (_) {}

  // Not logged in → send to login
  if (!userInfo || !userInfo.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check (if roles array is provided and non-empty)
  if (roles.length > 0 && !roles.includes(userInfo.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
};

/**
 * PublicOnlyRoute — Redirects authenticated users away from login/register.
 */
export const PublicOnlyRoute = ({ children }) => {
  let userInfo = null;
  try {
    userInfo = JSON.parse(localStorage.getItem('userInfo'));
  } catch (_) {}

  if (userInfo && userInfo.token) {
    // Send each role to their dashboard
    const dashMap = {
      Admin: '/admin/dashboard',
      Organizer: '/organizer/dashboard',
      Participant: '/dashboard',
    };
    return <Navigate to={dashMap[userInfo.role] || '/dashboard'} replace />;
  }

  return children;
};

export default ProtectedRoute;
