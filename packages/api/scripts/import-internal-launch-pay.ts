import 'reflect-metadata';
import 'dotenv/config';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  toId,
  type EmployeeId,
  type IsoDate,
  type OrganizationId,
  type SalaryStructureId,
  type UserId,
} from '@hrms/shared';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { AuditService } from '../src/core/audit/audit.service';
import { TenantContextService } from '../src/core/tenancy/tenant-context.service';
import { EmployeeRecordsService } from '../src/modules/employee-records/employee-records.service';
import { CompensationService } from '../src/modules/finance/compensation/compensation.service';

// Internal-launch import, pass 2: opening salary + bank details from Notion for
// the 19 staff imported in pass 1 (scripts/import-internal-launch.ts).
//
//   Dry run (default):  node -r ts-node/register scripts/import-internal-launch-pay.ts
//   Apply:              ... --apply
//
// Each workspace pays in its own currency (owner, 13 Nov 2026): Tethr PKR,
// PwrTech and SynAck USD. Notion amounts are monthly; the HRMS stores annual.
// Salary goes in as the first revision effective on the hire date through
// CompensationService.reviseSalary, so effective dating and audit are the
// normal ones. Idempotent: an employee who already has a revision is skipped.

type WorkspaceKey = 'Tethr' | 'PwrTech' | 'SynAck';
type PayRow = {
  readonly gid: number;
  readonly workspace: WorkspaceKey;
  readonly hireDate: string;
  readonly monthlyPkr: number | null;
  readonly monthlyUsd: number | null;
  readonly iban: string | null;
  readonly docsDrive: string | null;
};
type PayInput = {
  readonly currencyByWorkspace: Record<WorkspaceKey, 'PKR' | 'USD'>;
  readonly employees: readonly PayRow[];
};
type Finding = { readonly severity: 'blocker' | 'warning' | 'info'; readonly employeeNumber?: string; readonly message: string };

const ROOT = resolve(__dirname, '../../..');
const INPUT = resolve(ROOT, '.local-ops/import-pass2-input-2026-11-13.json');
const REPORT = resolve(ROOT, '.local-ops/import-pass2-dry-run-2026-11-13.json');
const APPLY = process.argv.includes('--apply');
const ADMIN_EMAIL = 'admin@tethrhq.com';
// Bank Al Habib's IBAN bank code; every Notion IBAN carries it.
const BANK_NAMES: Record<string, string> = { BAHL: 'Bank Al Habib' };
// The rate 17 of 19 Notion rows use between their PKR and USD columns. A row far
// off it means the two columns disagree and Finance should confirm the figure.
const NOTION_RATE = 277;

const employeeNumberFor = (gid: number): string => `TTR-${String(gid).padStart(3, '0')}`;
const isPkIban = (iban: string): boolean => /^PK\d{2}[A-Z]{4}\d{16}$/.test(iban);

async function main(): Promise<void> {
  const input = JSON.parse(readFileSync(INPUT, 'utf8')) as PayInput;
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const dataSource = app.get(DataSource);
  const findings: Finding[] = [];

  const orgRows: { id: string; displayName: string }[] = await dataSource.query(
    `SELECT id, "displayName" FROM organizations WHERE "displayName" IN ('Tethr', 'PwrTech', 'SynAck Solutions')`,
  );
  const orgByWorkspace: Record<WorkspaceKey, string | undefined> = {
    Tethr: orgRows.find((row) => row.displayName === 'Tethr')?.id,
    PwrTech: orgRows.find((row) => row.displayName === 'PwrTech')?.id,
    SynAck: orgRows.find((row) => row.displayName === 'SynAck Solutions')?.id,
  };

  const structurePlan: Record<string, string> = {};
  for (const key of ['Tethr', 'PwrTech', 'SynAck'] as const) {
    const orgId = orgByWorkspace[key];
    if (!orgId) {
      findings.push({ severity: 'blocker', message: `Workspace ${key} not found` });
      continue;
    }
    const currency = input.currencyByWorkspace[key];
    const orgCurrency = (await dataSource.query(`SELECT "defaultCurrency" FROM organizations WHERE id = $1`, [orgId]))[0].defaultCurrency;
    if (orgCurrency !== currency) findings.push({ severity: 'blocker', message: `${key} workspace currency is ${orgCurrency}, expected ${currency}` });
    const existing = await dataSource.query(
      `SELECT code FROM salary_structures WHERE "organizationId" = $1 AND currency = $2 AND "isActive" = true`,
      [orgId, currency],
    );
    structurePlan[key] = existing.length ? `use existing ${existing[0].code}` : `create "Base salary (${currency})" BASE-${currency}, monthly`;
  }

  type PlanRow = {
    readonly employeeNumber: string;
    readonly workspace: WorkspaceKey;
    readonly salary: string;
    readonly bank: string;
    readonly employeeId: string;
    readonly orgId: string;
    readonly currency: 'PKR' | 'USD';
    readonly monthly: number;
    readonly hireDate: string;
    readonly iban: string | null;
    readonly bankName: string | null;
    readonly hasRevision: boolean;
    readonly sameIban: boolean;
    readonly docsDrive: string | null;
  };
  const plan: PlanRow[] = [];
  for (const row of input.employees) {
    const employeeNumber = employeeNumberFor(row.gid);
    const orgId = orgByWorkspace[row.workspace];
    const currency = input.currencyByWorkspace[row.workspace];
    const monthly = currency === 'PKR' ? row.monthlyPkr : row.monthlyUsd;
    const employee = orgId
      ? (await dataSource.query(`SELECT id, to_char("hireDate", 'YYYY-MM-DD') AS "hireDate" FROM employees WHERE "organizationId" = $1 AND "employeeNumber" = $2`, [orgId, employeeNumber]))[0]
      : undefined;
    if (!employee) {
      findings.push({ severity: 'blocker', employeeNumber, message: 'Employee from pass 1 not found' });
      continue;
    }
    const revisions = await dataSource.query(`SELECT count(*)::int AS n FROM salary_revisions WHERE "organizationId" = $1 AND "employeeId" = $2`, [orgId, employee.id]);
    const hrRecord = (await dataSource.query(`SELECT "bankIban" FROM employee_hr_records WHERE "organizationId" = $1 AND "employeeId" = $2`, [orgId, employee.id]))[0];
    if (!monthly || monthly <= 0) findings.push({ severity: 'blocker', employeeNumber, message: `No ${currency} salary in Notion` });
    if (row.monthlyPkr && row.monthlyUsd) {
      const rate = row.monthlyPkr / row.monthlyUsd;
      if (Math.abs(rate - NOTION_RATE) > 5) {
        findings.push({
          severity: 'warning',
          employeeNumber,
          message: `Notion PKR and USD salaries disagree (implied rate ${rate.toFixed(1)} vs ${NOTION_RATE}); importing the ${currency} figure — Finance to confirm`,
        });
      }
    }
    const iban = row.iban?.replace(/\s+/g, '').toUpperCase() ?? null;
    if (!iban || !isPkIban(iban)) findings.push({ severity: 'blocker', employeeNumber, message: 'Missing or malformed IBAN' });
    const bankName = iban ? BANK_NAMES[iban.slice(4, 8)] ?? null : null;
    if (iban && !bankName) findings.push({ severity: 'warning', employeeNumber, message: `Unknown bank code ${iban.slice(4, 8)}; bank name left blank` });
    if (hrRecord?.bankIban && hrRecord.bankIban !== iban) {
      findings.push({ severity: 'blocker', employeeNumber, message: 'A different IBAN is already on file; not overwriting' });
    }
    plan.push({
      employeeNumber,
      workspace: row.workspace,
      salary: revisions[0].n > 0 ? 'skip (revision exists)' : `create revision ${currency} ${monthly}/month (${(monthly ?? 0) * 12}/year) from ${employee.hireDate}`,
      bank: hrRecord?.bankIban === iban ? 'skip (same IBAN on file)' : `set IBAN (${bankName ?? 'bank unknown'}), payment mode bank`,
      employeeId: employee.id as string,
      orgId: orgId as string,
      currency,
      monthly: monthly ?? 0,
      hireDate: employee.hireDate as string,
      iban,
      bankName,
      hasRevision: revisions[0].n > 0,
      sameIban: hrRecord?.bankIban === iban,
      docsDrive: row.docsDrive,
    });
  }

  const blockers = findings.filter((finding) => finding.severity === 'blocker');
  const totals = (['PKR', 'USD'] as const).map((currency) => ({
    currency,
    employees: plan.filter((p) => p.currency === currency).length,
    monthlyTotal: plan.filter((p) => p.currency === currency).reduce((sum, p) => sum + p.monthly, 0),
  }));
  const summary = {
    mode: APPLY ? 'apply' : 'dry-run',
    generatedAt: new Date().toISOString(),
    structures: structurePlan,
    counts: {
      employees: plan.length,
      salaryRevisionsToCreate: plan.filter((p) => !p.hasRevision).length,
      bankDetailsToSet: plan.filter((p) => !p.sameIban).length,
      payrollTotalsByCurrency: totals,
      blockers: blockers.length,
      warnings: findings.filter((f) => f.severity === 'warning').length,
    },
    findings,
    rows: plan.map(({ employeeNumber, workspace, salary, bank }) => ({ employeeNumber, workspace, salary, bank })),
  };
  writeFileSync(REPORT, JSON.stringify(summary, null, 2) + '\n');
  process.stdout.write(`${JSON.stringify({ mode: summary.mode, structures: structurePlan, counts: summary.counts, findings }, null, 2)}\nReport: ${REPORT}\n`);

  if (!APPLY || blockers.length) {
    if (APPLY) {
      process.stderr.write('Refusing to apply: resolve blockers first.\n');
      process.exitCode = 1;
    }
    await app.close();
    return;
  }

  const tenant = app.get(TenantContextService);
  const compensation = app.get(CompensationService);
  const records = app.get(EmployeeRecordsService);
  const audit = app.get(AuditService);

  const structureByOrg: Record<string, string> = {};
  const actorByOrg: Record<string, string> = {};
  for (const key of ['Tethr', 'PwrTech', 'SynAck'] as const) {
    const orgId = toId<OrganizationId>(orgByWorkspace[key] as string);
    const actor = (await dataSource.query(`SELECT id FROM users WHERE "organizationId" = $1 AND email = $2`, [orgId, ADMIN_EMAIL]))[0].id as string;
    actorByOrg[orgId] = actor;
    const currency = input.currencyByWorkspace[key];
    structureByOrg[orgId] = await tenant.run({ organizationId: orgId, userId: toId<UserId>(actor) }, async () => {
      const existing = (await compensation.listSalaryStructures()).find((structure) => structure.isActive && structure.currency === currency);
      return existing
        ? existing.id
        : (await compensation.createSalaryStructure({ name: `Base salary (${currency})`, code: `BASE-${currency}`, currency, payFrequency: 'monthly' })).id;
    });
  }

  let revisions = 0;
  let banks = 0;
  for (const row of plan) {
    const orgId = toId<OrganizationId>(row.orgId);
    const actor = toId<UserId>(actorByOrg[orgId]);
    await tenant.run({ organizationId: orgId, userId: actor }, async () => {
      if (!row.hasRevision) {
        await compensation.reviseSalary({
          employeeId: toId<EmployeeId>(row.employeeId),
          salaryStructureId: toId<SalaryStructureId>(structureByOrg[orgId]),
          effectiveDate: row.hireDate as IsoDate,
          annualAmount: row.monthly * 12,
          reason: 'hire',
          approvedByUserId: actor,
          note: `Opening salary imported from Notion: ${row.currency} ${row.monthly} per month`,
        });
        revisions += 1;
      }
      if (!row.sameIban) {
        await records.updateHrRecord({
          employeeId: toId<EmployeeId>(row.employeeId),
          paymentMode: 'bank',
          bankName: row.bankName,
          bankIban: row.iban,
          updatedByUserId: actor,
        });
        banks += 1;
      }
      await audit.record({
        action: 'import',
        resourceType: 'employee',
        resourceId: row.employeeId,
        metadata: { source: 'notion', pass: 'pay-and-bank', docsDriveFolder: row.docsDrive },
      });
    });
  }
  process.stdout.write(`${JSON.stringify({ applied: true, salaryRevisionsCreated: revisions, bankDetailsSet: banks }, null, 2)}\n`);
  await app.close();
}

main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
