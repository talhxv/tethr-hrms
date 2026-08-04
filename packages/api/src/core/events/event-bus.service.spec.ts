import { toId, type EmployeeId, type OrganizationId, type DomainEvent } from '@hrms/shared';

import { EventBus } from './event-bus.service';

const ORG = toId<OrganizationId>('org-1');

const makeEvent = (): DomainEvent<'employee.created'> => ({
  eventId: 'evt-1',
  name: 'employee.created',
  payload: { employeeId: toId<EmployeeId>('emp-1') },
  tenantId: ORG,
  occurredAt: '2026-06-18T00:00:00.000Z',
  version: 1,
});

describe('EventBus', () => {
  it('delivers an event to every registered handler', async () => {
    const bus = new EventBus();
    const first = jest.fn().mockResolvedValue(undefined);
    const second = jest.fn().mockResolvedValue(undefined);
    bus.register('employee.created', first);
    bus.register('employee.created', second);

    const event = makeEvent();
    await bus.dispatch(event);

    expect(first).toHaveBeenCalledWith(event);
    expect(second).toHaveBeenCalledWith(event);
  });

  it('resolves quietly when no handler is registered', async () => {
    const bus = new EventBus();
    await expect(bus.dispatch(makeEvent())).resolves.toBeUndefined();
  });

  it('rejects when a handler fails, so the relay can retry', async () => {
    const bus = new EventBus();
    bus.register('employee.created', jest.fn().mockRejectedValue(new Error('boom')));
    await expect(bus.dispatch(makeEvent())).rejects.toBeInstanceOf(AggregateError);
  });
});
