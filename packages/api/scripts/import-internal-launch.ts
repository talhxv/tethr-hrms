import 'reflect-metadata';
import 'dotenv/config';

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  toId,
  type EmployeeId,
  type IsoDate,
  type OrganizationId,
  type UserId,
  type WorkerType,
} from '@hrms/shared';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from '../src/app.module';
import { AuditService } from '../src/core/audit/audit.service';
import { AuthService } from '../src/core/auth/auth.service';
import { AuthorizationService } from '../src/core/authz/authz.service';
import { TenantContextService } from '../src/core/tenancy/tenant-context.service';
import { ClientService } from '../src/modules/clients/client.service';
import { EmployeeProfileService } from '../src/modules/employee/employee-profile.service';
import { EmployeeService } from '../src/modules/employee/employee.service';
import { LeaveBalance } from '../src/modules/leave/entities/leave-balance.entity';
import { LeaveTypeService } from '../src/modules/leave/leave-type.service';
import { OrganizationService } from '../src/modules/organization/organization.service';

// Internal-launch import: Notion "Employees" (Active) + the HR leave sheet into
// the Tethr workspace and one client workspace per client (owner decision,
// 13 Nov 2026). Goes through the real services so tenancy, audit and
// employee.created events behave exactly as they do in the app.
//
//   Dry run (default, read-only):  node -r ts-node/register scripts/import-internal-launch.ts
//   Apply:                          ... scripts/import-internal-launch.ts --apply
//
// Input and the dry-run report live in .local-ops/ (git-ignored) because they
// hold personal data. Idempotent: rows that already exist are skipped, so a
// re-run after a partial failure only fills the gaps.

type WorkspaceKey = 'Tethr' | 'PwrTech' | 'SynAck';

type InputEmployee = {
  readonly gid: number;
  readonly notionUrl: string;
  readonly workspace: WorkspaceKey;
  readonly fullName: string;
  readonly title: string | null;
  readonly department: string | null;
  readonly employmentType: string | null;
  readonly location: string | null;
  readonly startDate: string | null;
  readonly workEmail: string | null;
  readonly personalEmail: string | null;
  readonly phone: string | null;
  readonly leave: { readonly allotted: number; readonly used: number; readonly pending: number } | null;
};

type InputFile = {
  readonly workspaces: {
    readonly Tethr: { readonly existingOrganizationId: string };
    readonly PwrTech: ClientWorkspaceInput;
    readonly SynAck: ClientWorkspaceInput;
  };
  readonly leaveType: {
    readonly name: string;
    readonly code: string;
    readonly unit: 'day';
    readonly paid: boolean;
    readonly requiresApproval: boolean;
    readonly defaultAnnualEntitlement: number;
    readonly periodYear: number;
  };
  readonly employees: readonly InputEmployee[];
};

type ClientWorkspaceInput = {
  readonly legalName: string;
  readonly clientName: string;
  readonly expectedWorkDomain: string | null;
};

type Finding = { readonly severity: 'blocker' | 'warning' | 'info'; readonly employeeNumber?: string; readonly message: string };

const ROOT = resolve(__dirname, '../../..');
const INPUT = resolve(ROOT, '.local-ops/import-input-2026-11-13.json');
const REPORT = resolve(ROOT, '.local-ops/import-dry-run-2026-11-13.json');
const CREDENTIALS = resolve(ROOT, '.local-ops/tethr-admin-credentials.txt');
const ADMIN_EMAIL = 'admin@tethrhq.com';
const APPLY = process.argv.includes('--apply');

const employeeNumberFor = (gid: number): string => `TTR-${String(gid).padStart(3, '0')}`;

// Notion holds one "Full Name"; the HRMS needs first + last. First token is the
// first name, the rest is the last name ("Muid Bin Aslam" -> "Muid" / "Bin Aslam").
const splitName = (fullName: string): { firstName: string; lastName: string } => {
  const parts = fullName.trim().split(/\s+/);
  return parts.length === 1
    ? { firstName: parts[0], lastName: parts[0] }
    : { firstName: parts[0], lastName: parts.slice(1).join(' ') };
};

// The HRMS has no part-time flag yet; hours are not an engagement type, so
// part-timers stay 'permanent' and the gap is reported, not hidden.
const workerTypeFor = (employmentType: string | null): WorkerType => {
  if (employmentType === 'Contractor') return 'contractor';
  if (employmentType === 'Intern') return 'intern';
  return 'permanent';
};

const slugify = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const readAdminPassword = (): string => {
  const line = readFileSync(CREDENTIALS, 'utf8').split(/\r?\n/).find((entry) => /^password:/i.test(entry));
  if (!line) throw new Error('Admin password not found in the private credentials file');
  return line.replace(/^password:\s*/i, '').trim();
};

async function main(): Promise<void> {
  const input = JSON.parse(readFileSync(INPUT, 'utf8')) as InputFile;
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });
  const dataSource = app.get(DataSource);
  const findings: Finding[] = [];

  // ---- Read-only planning ------------------------------------------------
  const tethrId = input.workspaces.Tethr.existingOrganizationId;
  const tethr = await dataSource.query(`SELECT id, kind FROM organizations WHERE id = $1`, [tethrId]);
  if (tethr.length !== 1 || tethr[0].kind !== 'tethr') {
    findings.push({ severity: 'blocker', message: `Tethr workspace ${tethrId} missing or not kind=tethr` });
  }
  const tethrAdmin = await dataSource.query(
    `SELECT id FROM users WHERE "organizationId" = $1 AND email = $2 AND status = 'active'`,
    [tethrId, ADMIN_EMAIL],
  );
  if (tethrAdmin.length !== 1) findings.push({ severity: 'blocker', message: `${ADMIN_EMAIL} not active in the Tethr workspace` });

  const workspacePlan: Record<WorkspaceKey, { organizationId: string | null; action: string; clientAction?: string; adminAction?: string }> = {
    Tethr: { organizationId: tethrId, action: 'use existing' },
    PwrTech: { organizationId: null, action: '' },
    SynAck: { organizationId: null, action: '' },
  };
  for (const key of ['PwrTech', 'SynAck'] as const) {
    const spec = input.workspaces[key];
    const org = await dataSource.query(`SELECT id, kind, "clientId" FROM organizations WHERE slug = $1`, [slugify(spec.legalName)]);
    const client = await dataSource.query(`SELECT id FROM clients WHERE lower(name) = lower($1)`, [spec.clientName]);
    if (org.length === 1) {
      workspacePlan[key] = { organizationId: org[0].id, action: 'use existing' };
      if (org[0].kind !== 'client') findings.push({ severity: 'blocker', message: `Workspace "${spec.legalName}" exists but is kind=${org[0].kind}` });
      const admin = await dataSource.query(`SELECT id FROM users WHERE "organizationId" = $1 AND email = $2`, [org[0].id, ADMIN_EMAIL]);
      workspacePlan[key].adminAction = admin.length ? 'admin login exists' : `create ${ADMIN_EMAIL} (tethrAdmin)`;
    } else {
      workspacePlan[key] = {
        organizationId: null,
        action: `create client workspace "${spec.legalName}"`,
        clientAction: client.length ? 'link existing client record' : `create client record "${spec.clientName}"`,
        adminAction: `create ${ADMIN_EMAIL} (tethrAdmin, same password as the Tethr login so the workspace picker works)`,
      };
    }
  }

  const employeePlan = [];
  const numbers = new Set<string>();
  for (const person of input.employees) {
    const employeeNumber = employeeNumberFor(person.gid);
    if (numbers.has(employeeNumber)) findings.push({ severity: 'blocker', employeeNumber, message: 'Duplicate Notion Global-ID in input' });
    numbers.add(employeeNumber);
    const orgId = workspacePlan[person.workspace].organizationId;
    let exists = false;
    if (orgId) {
      const byNumber = await dataSource.query(`SELECT id FROM employees WHERE "organizationId" = $1 AND "employeeNumber" = $2`, [orgId, employeeNumber]);
      exists = byNumber.length > 0;
      const { firstName, lastName } = splitName(person.fullName);
      const byName = await dataSource.query(
        `SELECT "employeeNumber" FROM employees WHERE "organizationId" = $1 AND lower("firstName") = lower($2) AND lower("lastName") = lower($3)`,
        [orgId, firstName, lastName],
      );
      if (!exists && byName.length) findings.push({ severity: 'blocker', employeeNumber, message: `Same name already exists as ${byName[0].employeeNumber}` });
    }
    if (!person.startDate) findings.push({ severity: 'blocker', employeeNumber, message: 'No start date (hireDate is required)' });
    if (!person.title) findings.push({ severity: 'warning', employeeNumber, message: 'No role/title' });
    if (person.employmentType === 'Part-Time') findings.push({ severity: 'warning', employeeNumber, message: 'Part-time: HRMS has no part-time flag; imported as permanent, noted in audit metadata' });
    if (!person.workEmail) findings.push({ severity: 'info', employeeNumber, message: 'No work email (login emails deferred by owner)' });
    const expected = person.workspace === 'Tethr' ? 'tethrhq.com' : input.workspaces[person.workspace].expectedWorkDomain;
    if (person.workEmail && expected && !person.workEmail.toLowerCase().endsWith(`@${expected}`)) {
      findings.push({ severity: 'warning', employeeNumber, message: `Work email domain does not match ${expected}` });
    }
    if (!person.leave) findings.push({ severity: 'warning', employeeNumber, message: 'Not found in leave sheet; no opening balance' });
    if (person.leave && person.leave.used > person.leave.allotted) findings.push({ severity: 'blocker', employeeNumber, message: 'Used leave exceeds allotment' });
    employeePlan.push({
      employeeNumber,
      workspace: person.workspace,
      action: exists ? 'skip (already imported)' : 'create',
      workerType: workerTypeFor(person.employmentType),
      hireDate: person.startDate,
      hasWorkEmail: Boolean(person.workEmail),
      hasPersonalEmail: Boolean(person.personalEmail),
      hasPhone: Boolean(person.phone),
      leave2026: person.leave ? { entitled: person.leave.allotted, used: person.leave.used, pending: person.leave.pending, remaining: person.leave.allotted - person.leave.used - person.leave.pending } : null,
    });
  }

  const leaveTypePlan: Record<string, string> = {};
  for (const key of ['Tethr', 'PwrTech', 'SynAck'] as const) {
    const orgId = workspacePlan[key].organizationId;
    const existing = orgId ? await dataSource.query(`SELECT id FROM leave_types WHERE "organizationId" = $1 AND code = $2`, [orgId, input.leaveType.code]) : [];
    leaveTypePlan[key] = existing.length ? 'use existing' : `create "${input.leaveType.name}" (${input.leaveType.code}, ${input.leaveType.defaultAnnualEntitlement} days)`;
  }

  const blockers = findings.filter((finding) => finding.severity === 'blocker');
  const summary = {
    mode: APPLY ? 'apply' : 'dry-run',
    generatedAt: new Date().toISOString(),
    workspaces: workspacePlan,
    leaveTypes: leaveTypePlan,
    counts: {
      employeesInInput: input.employees.length,
      byWorkspace: Object.fromEntries((['Tethr', 'PwrTech', 'SynAck'] as const).map((key) => [key, input.employees.filter((p) => p.workspace === key).length])),
      toCreate: employeePlan.filter((p) => p.action === 'create').length,
      toSkip: employeePlan.filter((p) => p.action !== 'create').length,
      leaveBalances: employeePlan.filter((p) => p.leave2026).length,
      totalUsedDays: employeePlan.reduce((sum, p) => sum + (p.leave2026?.used ?? 0), 0),
      blockers: blockers.length,
      warnings: findings.filter((f) => f.severity === 'warning').length,
    },
    findings,
    employees: employeePlan,
    notImported: ['salary', 'bank IBAN', 'staff logins', 'department (no org units yet)', 'Notion offboarded/pre-hire records', 'documents'],
  };
  writeFileSync(REPORT, JSON.stringify(summary, null, 2) + '\n');
  console.log(JSON.stringify({ mode: summary.mode, workspaces: workspacePlan, leaveTypes: leaveTypePlan, counts: summary.counts }, null, 2));
  console.log(`Report: ${REPORT}`);

  if (!APPLY) {
    await app.close();
    return;
  }
  if (blockers.length) {
    console.error('Refusing to apply: resolve blockers first.');
    await app.close();
    process.exitCode = 1;
    return;
  }

  // ---- Apply --------------------------------------------------------------
  const tenant = app.get(TenantContextService);
  const organizations = app.get(OrganizationService);
  const clients = app.get(ClientService);
  const auth = app.get(AuthService);
  const authz = app.get(AuthorizationService);
  const employees = app.get(EmployeeService);
  const profiles = app.get(EmployeeProfileService);
  const leaveTypes = app.get(LeaveTypeService);
  const audit = app.get(AuditService);
  const adminPassword = readAdminPassword();

  const actorByOrg: Record<string, string> = { [tethrId]: tethrAdmin[0].id };
  for (const key of ['PwrTech', 'SynAck'] as const) {
    const spec = input.workspaces[key];
    if (!workspacePlan[key].organizationId) {
      const existingClient = await dataSource.query(`SELECT id FROM clients WHERE lower(name) = lower($1)`, [spec.clientName]);
      const clientId: string = existingClient.length ? existingClient[0].id : (await clients.create({ name: spec.clientName })).id;
      const organization = await organizations.create({ kind: 'client', clientId, legalName: spec.legalName });
      workspacePlan[key].organizationId = organization.id;
    }
    const orgId = toId<OrganizationId>(workspacePlan[key].organizationId as string);
    actorByOrg[orgId] = await tenant.run({ organizationId: orgId, userId: null }, async () => {
      const found = await dataSource.query(`SELECT id FROM users WHERE "organizationId" = $1 AND email = $2`, [orgId, ADMIN_EMAIL]);
      if (found.length) return found[0].id as string;
      const user = await auth.createUser({ email: ADMIN_EMAIL, password: adminPassword });
      await authz.assignSystemRole(toId<UserId>(user.id), 'tethrAdmin');
      return user.id;
    });
  }

  const leaveTypeIdByOrg: Record<string, string> = {};
  for (const key of ['Tethr', 'PwrTech', 'SynAck'] as const) {
    const orgId = toId<OrganizationId>(workspacePlan[key].organizationId as string);
    await tenant.run({ organizationId: orgId, userId: toId<UserId>(actorByOrg[orgId]) }, async () => {
      const existing = (await leaveTypes.list()).find((type) => type.code === input.leaveType.code);
      leaveTypeIdByOrg[orgId] = existing
        ? existing.id
        : (await leaveTypes.create({
            name: input.leaveType.name,
            code: input.leaveType.code,
            unit: input.leaveType.unit,
            paid: input.leaveType.paid,
            requiresApproval: input.leaveType.requiresApproval,
            defaultAnnualEntitlement: input.leaveType.defaultAnnualEntitlement,
          })).id;
    });
  }

  let created = 0;
  let balances = 0;
  for (const person of input.employees) {
    const employeeNumber = employeeNumberFor(person.gid);
    const orgId = toId<OrganizationId>(workspacePlan[person.workspace].organizationId as string);
    const actor = toId<UserId>(actorByOrg[orgId]);
    await tenant.run({ organizationId: orgId, userId: actor }, async () => {
      const existing = await dataSource.query(`SELECT id FROM employees WHERE "organizationId" = $1 AND "employeeNumber" = $2`, [orgId, employeeNumber]);
      let employeeId: string;
      if (existing.length) {
        employeeId = existing[0].id;
      } else {
        const { firstName, lastName } = splitName(person.fullName);
        const employee = await employees.create({
          employeeNumber,
          firstName,
          lastName,
          workEmail: person.workEmail ? person.workEmail.toLowerCase() : null,
          roleTitle: person.title,
          hireDate: person.startDate as IsoDate,
          workerType: workerTypeFor(person.employmentType),
        });
        employeeId = employee.id;
        await profiles.updateForEmployee(toId<EmployeeId>(employeeId), actor, {
          personalEmail: person.personalEmail,
          phone: person.phone,
        });
        await audit.record({
          action: 'import',
          resourceType: 'employee',
          resourceId: employeeId,
          metadata: {
            source: 'notion',
            sourceNotionUrl: person.notionUrl,
            sourceGlobalId: person.gid,
            employmentType: person.employmentType,
            department: person.department,
            location: person.location,
          },
        });
        created += 1;
      }
      if (person.leave) {
        const leaveTypeId = leaveTypeIdByOrg[orgId];
        await dataSource.transaction(async (manager) => {
          const found = await manager.findOne(LeaveBalance, {
            where: { organizationId: orgId, employeeId: toId<EmployeeId>(employeeId), leaveTypeId: leaveTypeId as LeaveBalance['leaveTypeId'], periodYear: input.leaveType.periodYear },
          });
          if (found) return;
          const balance = manager.create(LeaveBalance, {
            organizationId: orgId,
            employeeId: toId<EmployeeId>(employeeId),
            leaveTypeId: leaveTypeId as LeaveBalance['leaveTypeId'],
            periodYear: input.leaveType.periodYear,
            entitledDays: person.leave!.allotted.toFixed(2),
            usedDays: person.leave!.used.toFixed(2),
            pendingDays: person.leave!.pending.toFixed(2),
          });
          const saved = await manager.save(balance);
          // Opening balance carried from the HR sheet — no historical requests are
          // simulated, so used days are not double counted (handoff rule).
          await audit.record(
            {
              action: 'import',
              resourceType: 'leaveBalance',
              resourceId: saved.id,
              after: { periodYear: saved.periodYear, entitledDays: saved.entitledDays, usedDays: saved.usedDays, pendingDays: saved.pendingDays },
              metadata: { source: 'google-sheet:Leave Tracker Calendar', openingBalance: true },
            },
            manager,
          );
          balances += 1;
        });
      }
    });
  }
  console.log(JSON.stringify({ applied: true, employeesCreated: created, leaveBalancesCreated: balances, workspaces: workspacePlan }, null, 2));
  await app.close();
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
