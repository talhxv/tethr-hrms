import { isIsoDate, type FormSubmissionId, type IsoDate } from '@hrms/shared';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, type EntityManager, type FindOptionsWhere } from 'typeorm';

import { ConflictError } from '../../common/errors';
import { TenantContextService } from '../../core/tenancy/tenant-context.service';
import { FormsService } from '../forms/forms.service';

import { EmployeeService } from './employee.service';
import { Employee } from './entities/employee.entity';

// Public submissions are untrusted: values are trimmed and clipped to the
// destination column width so a malformed answer cannot fail the projection
// after the outbox has already retried it (same clipping AtsService applies).
const bounded = (value: string | undefined, maxLength: number): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed.slice(0, maxLength) : null;
};

const EMAIL_PATTERN = /^[^\s@]+@(?=[^\s@][^\s@]*\.[^\s@])[^\s@]+$/;

// Postgres unique-violation, as surfaced by the pg driver (same check the
// other projection services use).
const isUniqueViolation = (cause: unknown): boolean => {
  const driverError = (cause as { readonly driverError?: { readonly code?: string } }).driverError;
  return driverError?.code === '23505';
};

const todayIso = (): IsoDate => new Date().toISOString().slice(0, 10);

const EMPLOYEE_NUMBER_ATTEMPTS = 5;

// Projects an employee-intake form submission into an Employee record, the
// same way AtsService.applyFormSubmission projects an application submission
// into a candidate + application. Reads the submission through the forms
// module's published interface only; the personal details the Employee spine
// does not carry (residence, emergency contact, bank, national ID) stay in the
// submission's answers for staff to read back.
@Injectable()
export class EmployeeIntakeService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly forms: FormsService,
    private readonly employeeService: EmployeeService,
    private readonly tenantContext: TenantContextService,
  ) {}

  // Consumes `form.submitted` (target 'employeeIntake'). The submission's
  // `mapsTo` fields are projected onto the EmployeeService.create input; a
  // refused submission is recorded as rejected with a reason instead of
  // sitting pending forever. The consumer passes its transaction manager so
  // the employee write and the projection marker share the idempotency
  // ledger's transaction.
  async applyIntakeSubmission(
    submissionId: FormSubmissionId,
    manager?: EntityManager,
  ): Promise<Employee | null> {
    const run = async (target: EntityManager): Promise<Employee | null> => {
      const organizationId = this.tenantContext.getOrganizationId();
      const { submission, fields } = await this.forms.getSubmissionForProjection(submissionId);

      // The relay retries a projection that failed part-way; a submission that
      // already produced an employee must not produce a second one. The
      // projected back-link on the submission is the marker (the Application
      // projection uses its own formSubmissionId column for the same guard).
      if (submission.status === 'projected' && submission.targetRefType === 'employee') {
        const alreadyProjected = await target.findOne(Employee, {
          where: {
            id: submission.targetRefId,
            organizationId,
          } as FindOptionsWhere<Employee>,
        });
        if (alreadyProjected) {
          return alreadyProjected;
        }
      }

      const byMap = new Map<string, string>();
      for (const field of fields) {
        if (!field.mapsTo) continue;
        const answer = submission.answers[field.fieldKey];
        if (answer !== undefined && answer.trim() !== '') {
          byMap.set(field.mapsTo, answer.trim());
        }
      }

      const firstName = bounded(byMap.get('employee.firstName'), 128);
      const lastName = bounded(byMap.get('employee.lastName'), 128);
      if (!firstName || !lastName) {
        await this.forms.markSubmissionRejected(
          submissionId,
          'First and last name are required to create an employee record',
          target,
        );
        return null;
      }
      // The personal email lands on the employee's workEmail column (the only
      // email EmployeeService.create takes — the same convention offer
      // acceptance uses when it hires a candidate), and it is the duplicate
      // intake key.
      const email = bounded(byMap.get('employee.workEmail')?.toLowerCase(), 320);
      if (!email || !EMAIL_PATTERN.test(email)) {
        await this.forms.markSubmissionRejected(
          submissionId,
          'A valid personal email address is required',
          target,
        );
        return null;
      }
      const dateOfBirthAnswer = byMap.get('employee.dateOfBirth');
      if (dateOfBirthAnswer !== undefined && !isIsoDate(dateOfBirthAnswer)) {
        await this.forms.markSubmissionRejected(
          submissionId,
          'Date of birth must be a date in YYYY-MM-DD form',
          target,
        );
        return null;
      }
      const expectedStartDate = byMap.get('employee.hireDate');
      if (expectedStartDate !== undefined && !isIsoDate(expectedStartDate)) {
        await this.forms.markSubmissionRejected(
          submissionId,
          'Expected start date must be a date in YYYY-MM-DD form',
          target,
        );
        return null;
      }

      // One active intake per personal email: a submission whose email already
      // belongs to an active employee is refused with a reason, while a
      // terminated employee (a re-hire) or a previously rejected intake does
      // not block a fresh submission. Enforced by a read-check on this
      // module's own table — the forms tables are not ours to index, and the
      // employees table deliberately allows the same email again after a
      // separation, so no unique backstop exists; a concurrent duplicate that
      // passes both checks is an accepted narrow race (the intake form is
      // emailed to one hire at a time).
      const activeEmployee = await target.findOne(Employee, {
        where: {
          organizationId,
          workEmail: email,
          employmentStatus: 'active',
        } as FindOptionsWhere<Employee>,
      });
      if (activeEmployee) {
        await this.forms.markSubmissionRejected(
          submissionId,
          `An active employee record already exists for ${email}, so this intake was not projected`,
          target,
        );
        return null;
      }

      const hireDate = expectedStartDate ?? todayIso();
      for (let attempt = 0; attempt < EMPLOYEE_NUMBER_ATTEMPTS; attempt += 1) {
        const suffix = `${Date.now().toString().slice(-6)}${attempt === 0 ? '' : attempt}`;
        try {
          // Savepoint: a lost employee-number race must not poison the ledger
          // transaction around it (the same retry offer acceptance uses).
          const employee = await target.transaction((inner) =>
            this.employeeService.create(
              {
                employeeNumber: `EMP-${suffix}`,
                firstName,
                lastName,
                workEmail: email,
                dateOfBirth: dateOfBirthAnswer ?? null,
                hireDate,
              },
              inner,
            ),
          );
          await this.forms.markSubmissionProjected(submissionId, 'employee', employee.id, target);
          return employee;
        } catch (cause) {
          if (!isUniqueViolation(cause) || attempt === EMPLOYEE_NUMBER_ATTEMPTS - 1) {
            throw cause;
          }
        }
      }
      throw new ConflictError('Could not allocate a unique employee number');
    };
    return manager ? run(manager) : this.dataSource.transaction(run);
  }
}
