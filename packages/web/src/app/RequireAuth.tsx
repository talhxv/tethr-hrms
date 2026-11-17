import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../modules/auth/hooks/useAuth';

// Gate for the authenticated app. Unauthenticated visitors are sent to /login,
// remembering where they were headed. Someone signed in with an
// administrator-issued password must choose their own before anything else.
export const RequireAuth = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};
