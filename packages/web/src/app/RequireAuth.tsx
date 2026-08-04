import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../modules/auth/hooks/useAuth';

// Gate for the authenticated app. Unauthenticated visitors are sent to /login,
// remembering where they were headed.
export const RequireAuth = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
};
