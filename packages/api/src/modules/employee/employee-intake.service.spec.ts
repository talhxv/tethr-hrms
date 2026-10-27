import { toId, type FormId, type FormSubmissionId, type OrganizationId } from '@hrms/shared';
import type { DataSource, EntityManager } from 'typeorm';

import type { TenantContextService } from '../../core/tenancy/tenant-context.service';
import type { FormsService } from '../forms/forms.service';

import { EmployeeIntakeService } from './employee-intake.service';
import type { EmployeeService } from './employee.service';
import type { Employee } from './entities/employee.entity';

const ORGANIZATION = toId<OrganizationId>('org-tethr');
const FORM = toId<FormId>('form-1');
const SUBMISSION = toId<FormSubmissionId>('submission-1');

const intakeFields = () => [
  { fieldKey: 'firstName', mapsTo: 'employee.firstName' },
  { fieldKey: 'lastName', mapsTo: 'employee.lastName' },
  { fieldKey: 'dateOfBirth', mapsTo: 'employee.dateOfBirth' },
  { fieldKey: 'personalEmail', mapsTo: 'employee.workEmail' },
  { fieldKey: 'expectedStartDate', mapsTo: 'employee.hireDate' },
  { fieldKey: 'nationalId', mapsTo: null },
];

const intakeAnswers = () => ({
  firstName: 'Ada',
  lastName: 'Lovelace',
  dateOfBirth: '1990-08-09',
  personalEmail: 'Ada@Example.com',
  phoneNumber: '+92 300 1234567',
  nationalId: '42201-1234567-1',
  expectedStartDate: '2026-11-02',
});

const intakeSubmission = () => ({
  id: SUBMISSION,
  organizationId: ORGANIZATION,
  formId: FORM,
  answers: intakeAnswers(),
  files: [],
  status: 'pending' as const,
  statusReason: null,
  submittedAt: new Date(),
  metadata: {},
  targetRefType: null,
  targetRefId: null,
});

const buildService = (
  options: {
    answers?: Record<string, string>;
    fields?: { fieldKey: string; mapsTo: string | null }[];
    status?: 'pending' | 'projected' | 'rejected';
    activeEmployee?: Employee | null;
    projectedEmployee?: Employee | null;
    createFailures?: unknown[];
  } = {},
) => {
  const forms = {
    getSubmissionForProjection: jest.fn().mockResolvedValue({
      submission: {
        ...intakeSubmission(),
        ...(options.status ? { status: options.status } : {}),
        ...(options.status === 'projected' ? { targetRefType: 'employee', targetRefId: 'employee-9' } : {}),
        answers: options.answers ?? intakeAnswers(),
      },
      fields: options.fields ?? intakeFields(),
    }),
    markSubmissionProjected: jest.fn().mockResolvedValue(undefined),
    markSubmissionRejected: jest.fn().mockResolvedValue(undefined),
  } as unknown as FormsService;

  const createFailures = [...(options.createFailures ?? [])];
  const employeeService = {
    create: jest.fn().mockImplementation(async (input: Record<string, unknown>, _manager: unknown) => {
      const failure = createFailures.shift();
      if (failure) throw failure;
      return { id: 'employee-1', employmentStatus: 'active', ...input };
    }),
  } as unknown as EmployeeService;

  // The manager routes its entity reads by the where-clause shape: the
  // duplicate check asks for an active employee by email, the redelivery guard
  // asks for the projected employee by id.
  const manager = {
    findOne: jest.fn(
      async (_entity: unknown, criteria: { where: Record<string, unknown> }) => {
        if ('workEmail' in criteria.where) {
          const candidate = options.activeEmployee ?? null;
          return candidate && candidate.employmentStatus === criteria.where.employmentStatus
            ? candidate
            : null;
        }
        return options.projectedEmployee ?? null;
      },
    ),
    transaction: jest.fn((callback: (inner: unknown) => Promise<unknown>) => callback(manager)),
  } as unknown as EntityManager;

  const dataSource = {
    transaction: jest.fn((callback: (inner: EntityManager) => Promise<unknown>) => callback(manager)),
  } as unknown as DataSource;

  const tenantContext = {
    getOrganizationId: jest.fn().mockReturnValue(ORGANIZATION),
  } as unknown as TenantContextService;

  const service = new EmployeeIntakeService(
    dataSource,
    forms,
    employeeService,
    tenantContext,
  );

  return { service, forms, employeeService, manager, dataSource };
};

const uniqueViolation = (): Error =>
  Object.assign(new Error('duplicate key value violates unique constraint'), {
    driverError: { code: '23505' },
  });

describe('EmployeeIntakeService.applyIntakeSubmission', () => {
  it('projects the mapped fields onto EmployeeService.create and marks the submission projected', async () => {
    const { service, forms, employeeService, manager } = buildService();

    const employee = await service.applyIntakeSubmission(SUBMISSION, manager);

    expect(employee?.id).toBe('employee-1');
    // Exactly the fields the employee create input takes; the personal email
    // is normalized onto the workEmail column, everything answers-only (phone,
    // national ID, residence, emergency, bank) never reaches the employee.
    expect(employeeService.create).toHaveBeenCalledWith(
      {
        employeeNumber: expect.stringMatching(/^EMP-\d{6}$/),
        firstName: 'Ada',
        lastName: 'Lovelace',
        workEmail: 'ada@example.com',
        dateOfBirth: '1990-08-09',
        hireDate: '2026-11-02',
      },
      manager,
    );
    expect(forms.markSubmissionProjected).toHaveBeenCalledWith(
      SUBMISSION,
      'employee',
      'employee-1',
      manager,
    );
    expect(forms.markSubmissionRejected).not.toHaveBeenCalled();
  });

  it('defaults the hire date to today when the hire gave no expected start date', async () => {
    const { service, employeeService } = buildService({
      answers: { ...intakeAnswers(), expectedStartDate: '' },
    });
    const today = new Date().toISOString().slice(0, 10);

    await service.applyIntakeSubmission(SUBMISSION);

    expect(employeeService.create).toHaveBeenCalledWith(
      expect.objectContaining({ hireDate: today }),
      expect.anything(),
    );
  });

  it('rejects a submission whose names are missing, without creating an employee', async () => {
    const { service, forms, employeeService } = buildService({
      answers: { ...intakeAnswers(), firstName: ' ' },
    });

    await expect(service.applyIntakeSubmission(SUBMISSION)).resolves.toBeNull();

    expect(forms.markSubmissionRejected).toHaveBeenCalledWith(
      SUBMISSION,
      'First and last name are required to create an employee record',
      expect.anything(),
    );
    expect(employeeService.create).not.toHaveBeenCalled();
    expect(forms.markSubmissionProjected).not.toHaveBeenCalled();
  });

  it('rejects a submission without a usable personal email', async () => {
    const { service, forms, employeeService } = buildService({
      answers: { ...intakeAnswers(), personalEmail: 'not-an-email' },
    });

    await expect(service.applyIntakeSubmission(SUBMISSION)).resolves.toBeNull();

    expect(forms.markSubmissionRejected).toHaveBeenCalledWith(
      SUBMISSION,
      'A valid personal email address is required',
      expect.anything(),
    );
    expect(employeeService.create).not.toHaveBeenCalled();
  });

  it('rejects a malformed date instead of letting it fail the employee write', async () => {
    const { service, forms, employeeService } = buildService({
      answers: { ...intakeAnswers(), dateOfBirth: '09/08/1990' },
    });

    await expect(service.applyIntakeSubmission(SUBMISSION)).resolves.toBeNull();

    expect(forms.markSubmissionRejected).toHaveBeenCalledWith(
      SUBMISSION,
      'Date of birth must be a date in YYYY-MM-DD form',
      expect.anything(),
    );
    expect(employeeService.create).not.toHaveBeenCalled();
  });

  it('rejects an impossible calendar date instead of projecting a normalized date', async () => {
    const { service, forms, employeeService, manager } = buildService({
      answers: { ...intakeAnswers(), dateOfBirth: '2026-02-31' },
    });

    await expect(service.applyIntakeSubmission(SUBMISSION, manager)).resolves.toBeNull();
    expect(forms.markSubmissionRejected).toHaveBeenCalledWith(
      SUBMISSION,
      'Date of birth must be a date in YYYY-MM-DD form',
      expect.anything(),
    );
    expect(employeeService.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate intake whose email already belongs to an active employee', async () => {
    const { service, forms, employeeService } = buildService({
      activeEmployee: {
        id: 'employee-existing',
        workEmail: 'ada@example.com',
        employmentStatus: 'active',
      } as Employee,
    });

    await expect(service.applyIntakeSubmission(SUBMISSION)).resolves.toBeNull();

    expect(forms.markSubmissionRejected).toHaveBeenCalledWith(
      SUBMISSION,
      'An active employee record already exists for ada@example.com, so this intake was not projected',
      expect.anything(),
    );
    expect(employeeService.create).not.toHaveBeenCalled();
  });

  it('lets a separated employee with the same email be re-hired by a new intake', async () => {
    const { service, employeeService } = buildService({
      // Terminated, so it cannot match the active-employee query.
      activeEmployee: {
        id: 'employee-past',
        workEmail: 'ada@example.com',
        employmentStatus: 'terminated',
      } as Employee,
    });

    const employee = await service.applyIntakeSubmission(SUBMISSION);

    expect(employee?.id).toBe('employee-1');
    expect(employeeService.create).toHaveBeenCalled();
  });

  it('returns the projected employee on redelivery instead of creating a second one', async () => {
    const { service, forms, employeeService } = buildService({
      status: 'projected',
      projectedEmployee: { id: 'employee-9', employmentStatus: 'active' } as Employee,
    });

    const employee = await service.applyIntakeSubmission(SUBMISSION);

    expect(employee?.id).toBe('employee-9');
    expect(employeeService.create).not.toHaveBeenCalled();
    expect(forms.markSubmissionProjected).not.toHaveBeenCalled();
    expect(forms.markSubmissionRejected).not.toHaveBeenCalled();
  });

  it('retries with a distinct employee number when the allocation collides', async () => {
    const { service, forms, employeeService } = buildService({
      createFailures: [uniqueViolation()],
    });

    const employee = await service.applyIntakeSubmission(SUBMISSION);

    expect(employee?.id).toBe('employee-1');
    expect(employeeService.create).toHaveBeenCalledTimes(2);
    expect(forms.markSubmissionProjected).toHaveBeenCalledTimes(1);
  });

  it('opens its own transaction when no manager is supplied', async () => {
    const { service, dataSource, employeeService } = buildService();

    await service.applyIntakeSubmission(SUBMISSION);

    expect(dataSource.transaction).toHaveBeenCalled();
    expect(employeeService.create).toHaveBeenCalledWith(expect.anything(), expect.anything());
  });
});
