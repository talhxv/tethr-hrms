import type { PortalKind } from '@hrms/shared';

export const portalHome = (portal: PortalKind): string => {
  if (portal === 'tethr') return '/dashboard';
  if (portal === 'client') return '/client';
  if (portal === 'employee') return '/me';
  return '/access';
};

export const portalLabel = (portal: PortalKind): string => {
  if (portal === 'tethr') return 'Tethr';
  if (portal === 'client') return 'Client';
  if (portal === 'employee') return 'Employee';
  return 'Access';
};
