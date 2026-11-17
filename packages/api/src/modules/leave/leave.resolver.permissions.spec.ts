import { PERMISSIONS } from '../../core/authz/permissions';
import { PERMISSIONS_METADATA_KEY } from '../../core/authz/require-permissions.decorator';

import { LeaveResolver } from './leave.resolver';

const requiredFor = (method: keyof LeaveResolver): unknown =>
  Reflect.getMetadata(PERMISSIONS_METADATA_KEY, LeaveResolver.prototype[method]);

describe('LeaveResolver permissions', () => {
  // Access test 17 Nov 2026: this was guarded by leave:team:read, so a client
  // member could create leave requests for staff.
  it('requires leave approval rights to file leave on someone else’s behalf', () => {
    expect(requiredFor('submitLeaveRequest')).toEqual([PERMISSIONS.leaveApprove]);
  });

  it('lets employees file their own leave with the own-write permission', () => {
    expect(requiredFor('submitMyLeaveRequest')).toEqual([PERMISSIONS.leaveOwnWrite]);
  });
});
