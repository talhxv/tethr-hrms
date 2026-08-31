import type { PortalKind } from '@hrms/shared';

// The widget Dashboard is the landing page for every portal — one consistent
// home across all workspaces. Each portal keeps its own navigation and its
// own detail pages (/client, /me); those are just no longer the entry point.
export const portalHome = (portal: PortalKind): string => {
  if (portal === 'none') return '/access';
  return '/dashboard';
};

export const portalLabel = (portal: PortalKind): string => {
  if (portal === 'tethr') return 'Tethr';
  if (portal === 'client') return 'Client';
  if (portal === 'employee') return 'Employee';
  return 'Access';
};
