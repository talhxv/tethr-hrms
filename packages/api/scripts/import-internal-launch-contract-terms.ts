import 'reflect-metadata';
import 'dotenv/config';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { toId, type EmployeeId, type IsoDate, type UserId } from '@hrms/shared';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { AuditService } from '../src/core/audit/audit.service';
import { TenantContextService } from '../src/core/tenancy/tenant-context.service';
import { EmployeePersonalDetailsService } from '../src/modules/employee/employee-personal-details.service';
import { EmployeeProfileService } from '../src/modules/employee/employee-profile.service';
import { EmployeeService } from '../src/modules/employee/employee.service';

// Internal-launch import, pass 3: contract terms and current address from each
// employee's Google Drive Docs folder (contracts, post-probation letters,
// probation reviews) for the 19 staff imported in pass 1.
//
//   Dry run (default):  node -r ts-node/register scripts/import-internal-launch-contract-terms.ts
//   Apply:              ... --apply
//
// Rules, all taken from the documents (see the input file's "rules"):
//   probationEndDate           hire date + 90 days
//   scheduledConfirmationDate  same day (contract: confirmed automatically unless notified)
//   finalConfirmationDate      only where a dated, signed-off post-probation letter exists
//   noticePeriodDays           30 (post-confirmation notice in contract and letter)
//   nationalIdNumber           CNIC from the contract's party clause, as 12345-1234567-1
// A row marked "hold" (term or status unclear) gets its address and CNIC only.
// Only empty fields are filled; a different value already on file is reported
// and left alone, so re-running is safe.

type TermsRow = {
  readonly gid: number;
  readonly contract: string;
  readonly confirmation: string | null;
  readonly address: string;
  readonly cnic: string;
  readonly note?: string;
  readonly hold?: boolean;
};
type TermsInput = { readonly employees: readonly TermsRow[] };
type CurrentRow = {
  readonly id: string;
  readonly organizationId: string;
  readonly employeeNumber: string;
  readonly hireDate: string;
  readonly probationEndDate: string | null;
  readonly scheduledConfirmationDate: string | null;
  readonly finalConfirmationDate: string | null;
  readonly noticePeriodDays: number | null;
  readonly addressLine1: string | null;
  readonly nationalIdNumber: string | null;
};
type Change = { readonly field: string; readonly value: string | number };
type PlanRow = {
  readonly employeeNumber: string;
  readonly employeeId: string;
  readonly organizationId: string;
  readonly employeeChanges: readonly Change[];
  readonly address: string | null;
  readonly cnic: string | null;
  readonly note: string | null;
};

const ROOT = resolve(__dirname, '../../..');
const INPUT = resolve(ROOT, '.local-ops/import-pass3-contract-terms-2026-11-14.json');
const REPORT = resolve(ROOT, '.local-ops/import-pass3-dry-run-2026-11-14.json');
const APPLY = process.argv.includes('--apply');
const ADMIN_EMAIL = 'admin@tethrhq.com';
const PROBATION_DAYS = 90;
const NOTICE_DAYS = 30;

const employeeNumberFor = (gid: number): string => `TTR-${String(gid).padStart(3, '0')}`;
// A CNIC is 13 digits printed as 5-7-1. Anything else is rejected, not guessed.
const formatCnic = (raw: string): string | null => {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 13 ? `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}` : null;
};
const addDays = (isoDate: string, days: number): string => {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

async function main(): Promise<void> {
  const input = JSON.parse(readFileSync(INPUT, 'utf8')) as TermsInput;
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const dataSource = app.get(DataSource);
  const warnings: string[] = [];

  const current: CurrentRow[] = await dataSource.query(
    `SELECT e.id, e."organizationId", e."employeeNumber", to_char(e."hireDate", 'YYYY-MM-DD') AS "hireDate",
            to_char(e."probationEndDate", 'YYYY-MM-DD') AS "probationEndDate",
            to_char(e."scheduledConfirmationDate", 'YYYY-MM-DD') AS "scheduledConfirmationDate",
            to_char(e."finalConfirmationDate", 'YYYY-MM-DD') AS "finalConfirmationDate",
            e."noticePeriodDays", p."addressLine1", d."nationalIdNumber"
       FROM employees e
       LEFT JOIN employee_profiles p ON p."employeeId" = e.id
       LEFT JOIN employee_personal_details d ON d."employeeId" = e.id
      WHERE e."employeeNumber" LIKE 'TTR-%'`,
  );
  const byNumber = new Map(current.map((row) => [row.employeeNumber, row]));

  const plan: PlanRow[] = [];
  for (const row of input.employees) {
    const employeeNumber = employeeNumberFor(row.gid);
    const existing = byNumber.get(employeeNumber);
    if (!existing) {
      warnings.push(`${employeeNumber}: not found in the HRMS; skipped`);
      continue;
    }
    const wanted: Change[] = [];
    if (!row.hold) {
      const probationEnd = addDays(existing.hireDate, PROBATION_DAYS);
      wanted.push({ field: 'probationEndDate', value: probationEnd });
      wanted.push({ field: 'scheduledConfirmationDate', value: probationEnd });
      wanted.push({ field: 'noticePeriodDays', value: NOTICE_DAYS });
      if (row.confirmation) wanted.push({ field: 'finalConfirmationDate', value: row.confirmation });
    }
    const employeeChanges = wanted.filter((change) => {
      const onFile = existing[change.field as keyof CurrentRow];
      if (onFile === null || onFile === undefined) return true;
      if (String(onFile) !== String(change.value)) {
        warnings.push(`${employeeNumber}: ${change.field} already ${String(onFile)}; left alone (documents say ${String(change.value)})`);
      }
      return false;
    });
    const cnic = formatCnic(row.cnic);
    if (!cnic) warnings.push(`${employeeNumber}: CNIC in the contract is not 13 digits; skipped`);
    if (cnic && existing.nationalIdNumber && existing.nationalIdNumber !== cnic) {
      warnings.push(`${employeeNumber}: a different CNIC is already on file; left alone`);
    }
    plan.push({
      employeeNumber,
      employeeId: existing.id,
      organizationId: existing.organizationId,
      employeeChanges,
      address: existing.addressLine1 ? null : row.address.trim(),
      cnic: cnic && !existing.nationalIdNumber ? cnic : null,
      note: row.note ?? null,
    });
  }

  const summary = {
    mode: APPLY ? 'apply' : 'dry-run',
    employees: plan.length,
    probationEndDates: plan.filter((row) => row.employeeChanges.some((c) => c.field === 'probationEndDate')).length,
    confirmations: plan.filter((row) => row.employeeChanges.some((c) => c.field === 'finalConfirmationDate')).length,
    noticePeriods: plan.filter((row) => row.employeeChanges.some((c) => c.field === 'noticePeriodDays')).length,
    addresses: plan.filter((row) => row.address !== null).length,
    cnics: plan.filter((row) => row.cnic !== null).length,
    held: input.employees.filter((row) => row.hold).map((row) => employeeNumberFor(row.gid)),
    warnings,
  };
  writeFileSync(REPORT, JSON.stringify({ ...summary, plan }, null, 2) + '\n');
  if (!APPLY) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
    await app.close();
    return;
  }

  const tenant = app.get(TenantContextService);
  const employees = app.get(EmployeeService);
  const profiles = app.get(EmployeeProfileService);
  const personalDetails = app.get(EmployeePersonalDetailsService);
  const audit = app.get(AuditService);
  const actorByOrg = new Map<string, UserId>();
  let employeeUpdates = 0;
  let addressUpdates = 0;
  let cnicUpdates = 0;

  for (const row of plan) {
    if (row.employeeChanges.length === 0 && row.address === null && row.cnic === null) continue;
    let actor = actorByOrg.get(row.organizationId);
    if (!actor) {
      const found: { id: string }[] = await dataSource.query(
        `SELECT id FROM users WHERE "organizationId" = $1 AND email = $2`,
        [row.organizationId, ADMIN_EMAIL],
      );
      if (!found[0]) throw new Error(`No ${ADMIN_EMAIL} account in workspace ${row.organizationId}`);
      actor = toId<UserId>(found[0].id);
      actorByOrg.set(row.organizationId, actor);
    }
    const actorId = actor;
    await tenant.run({ organizationId: toId(row.organizationId), userId: actorId }, async () => {
      if (row.employeeChanges.length > 0) {
        const changes = Object.fromEntries(row.employeeChanges.map((c) => [c.field, c.value])) as {
          probationEndDate?: IsoDate;
          scheduledConfirmationDate?: IsoDate;
          finalConfirmationDate?: IsoDate;
          noticePeriodDays?: number;
        };
        await employees.update(row.employeeId, changes, actorId);
        employeeUpdates += 1;
      }
      if (row.address !== null) {
        await profiles.updateForEmployee(toId<EmployeeId>(row.employeeId), actorId, {
          addressLine1: row.address,
          countryCode: 'PK',
        });
        addressUpdates += 1;
      }
      if (row.cnic !== null) {
        await personalDetails.updateForEmployee(toId<EmployeeId>(row.employeeId), actorId, {
          nationalIdNumber: row.cnic,
        });
        cnicUpdates += 1;
      }
      await audit.record({
        action: 'import',
        resourceType: 'employee',
        resourceId: row.employeeId,
        metadata: {
          source: 'google-drive',
          pass: 'contract-terms',
          fields: [...row.employeeChanges.map((c) => c.field), ...(row.address ? ['addressLine1'] : []), ...(row.cnic ? ['nationalIdNumber'] : [])],
        },
      });
    });
  }
  process.stdout.write(`${JSON.stringify({ applied: true, employeeUpdates, addressUpdates, cnicUpdates, warnings }, null, 2)}\n`);
  await app.close();
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
