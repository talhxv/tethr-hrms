import type { PortalKind, SystemRoleKey } from '@hrms/shared';
import { Navigate, Outlet } from 'react-router-dom';

import { portalHome } from './portal';
import { useAuth } from '../modules/auth/hooks/useAuth';

type RequirePortalProps = {
  readonly portals: readonly Exclude<PortalKind, 'none'>[];
  readonly roleKeys?: readonly SystemRoleKey[];
  // Self-service surfaces: outside the employee portal (Tethr HR/Finance/admin
  // staff using their own records) the login must be linked to an employee.
  readonly requireEmployeeLink?: boolean;
};

export const RequirePortal = ({ portals, roleKeys, requireEmployeeLink }: RequirePortalProps) => {
  const { user } = useAuth();
  if (!user || user.portal === 'none') {
    return <Navigate to="/access" replace />;
  }
  if (!portals.includes(user.portal)) {
    return <Navigate to={portalHome(user.portal)} replace />;
  }
  if (roleKeys && !roleKeys.some((roleKey) => user.roleKeys?.includes(roleKey))) {
    return <Navigate to={portalHome(user.portal)} replace />;
  }
  if (requireEmployeeLink && user.portal !== 'employee' && !user.employeeId) {
    return <Navigate to={portalHome(user.portal)} replace />;
  }
  return <Outlet />;
};
