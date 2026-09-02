# Fix plan — Employee module review findings

> Handoff doc for the agent that built the Frappe-parity Employee work (uncommitted, `git diff HEAD`). 10 confirmed findings from an 8-angle review, ordered most severe first. Fix in this order — items 1-4 are correctness bugs that block shipping, 5-8 are real but lower-severity correctness/perf issues, 9-10 are cleanup.

## 1. Education/work-history create is broken on every call

**Files:** `packages/api/src/modules/employee/employee-education.service.ts:58`, `packages/api/src/modules/employee/employee-work-history.service.ts:58`

`create()` builds the entity via the raw transaction `manager.create(Entity, { organizationId: undefined as never, ... })` instead of going through the injected `TenantScopedRepository` (`this.educations`/`this.histories`), which is the only thing that stamps `organizationId` from `TenantContextService`. `TenantScopedEntity.organizationId` is a non-nullable `uuid` column — every insert throws a Postgres NOT NULL violation.

**Fix:** Build the entity through `this.educations.create({...})` / `this.histories.create({...})` (the `TenantScopedRepository.create()` method), not `manager.create()`, exactly like the correct sibling `employee-exit-interview.service.ts` does. Keep the surrounding `dataSource.transaction` for the save + event publish + audit call.

**Verify:** Call `createEmployeeEducation`/`createEmployeeWorkHistory` against a running dev DB and confirm the row persists with the right `organizationId` — this was previously impossible to test manually because it always threw.

## 2. IDOR — any employee can edit/delete another employee's education or work-history records

**File:** `packages/api/src/modules/employee/employee.resolver.ts:521` onward (`createEmployeeEducation`, `updateEmployeeEducation`, `deleteEmployeeEducation`, `createEmployeeWorkHistory`, `updateEmployeeWorkHistory`, `deleteEmployeeWorkHistory`)

These mutations are gated by `PERMISSIONS.employeeSelfWrite` but take a client-supplied `employeeId` (create) or record `id` (update/delete) with no check against the caller's own `user.employeeId`.

**Fix:** Follow the pattern already used correctly by `updateMyPersonalDetails`/`updateMyEmployeeProfile` in the same file — resolve `user.employeeId` via `authService.getCurrentUser()` and either (a) force it as the `employeeId` on create (ignore/reject any client-supplied value), or (b) on update/delete, load the target record first and throw `ForbiddenError` (or the codebase's equivalent) if its `employeeId` doesn't match the caller's. Apply this to all six mutations. Decide explicitly whether these are meant to be self-service-only (drop `employeeWrite` HR access entirely, matching the profile pattern) or dual-purpose (self AND HR-write) — if dual-purpose, gate on `employeeSelfWrite OR employeeWrite` and only enforce the ownership check when the caller holds `employeeSelfWrite` without `employeeWrite`.

**Verify:** Add a service/resolver test: an `employee`-role user calling any of the six mutations with a different employee's id/record must be rejected.

## 3. Leave-entitlement updates destroy history

**File:** `packages/api/src/modules/leave/entities/employee-leave-entitlement.entity.ts:1`, `packages/api/src/modules/leave/employee-leave-entitlement.service.ts` (`upsert`)

`EmployeeLeaveEntitlement` extends `TenantScopedEntity` and hand-rolls `validFrom`/`validTo` instead of extending `TemporalEntity`. Its unique index is `(organizationId, employeeId, leaveTypeId)` with no `validFrom` in the key, so `upsert()` finds the one existing row and mutates `annualEntitlement`/`validFrom`/`validTo` in place — a leave-entitlement change destroys the prior period's history instead of recording a new dated row, violating the "effective-dated from day one" rule.

**Fix:** Extend `TemporalEntity` instead of hand-rolling the date columns. Change the unique index to not force a single row per employee/leave-type (match the non-unique `(organizationId, employeeId)`-style index `Assignment` uses, or `(organizationId, employeeId, validFrom)` like `SalaryRevision`). Change `upsert()` to close the currently-open row (`validTo = newValidFrom`) and insert a new row for a genuine entitlement change, rather than mutating in place — mirror `SalaryRevision`'s "close prior open-ended revision, create next" logic exactly.

**Verify:** Write a service test: award an entitlement, then revise it effective a later date; confirm two rows exist and an "as of" query for a date before the revision returns the original value.

## 4. Offboarding-task partial update wipes `dueDate`/`notes`

**File:** `packages/api/src/modules/employee/employee-offboarding.service.ts:36`

`updateTask` does `existing.dueDate = input.dueDate ?? null; existing.notes = input.notes ?? null;` unconditionally, instead of guarding with `if (input.dueDate !== undefined)` like the sibling `employee-education.service.ts`/`employee-work-history.service.ts` update methods do. Omitting these fields from a request (e.g., a client only changing `status`) silently nulls them out.

**Fix:** Guard both assignments with `!== undefined` checks, matching the sibling services.

**Verify:** Set a task's `dueDate`/`notes`, then call `updateOffboardingTask` with only `status` changed; confirm `dueDate`/`notes` are unchanged afterward.

## 5. N+1 queries on the Employee list (`currentAssignment`/`assignmentHistory`)

**File:** `packages/api/src/modules/employee/employee.resolver.ts:326` (`currentAssignment`), `:337` (`assignmentHistory`), `:370` (`toAssignmentView`)

Each field resolver calls `AssignmentService.listForEmployee` per parent row; `toAssignmentView` then does 4 sequential (non-`Promise.all`'d) awaits per assignment (`PositionService`, `DepartmentService`, `LocationService`, `EmployeeDirectoryService.getDisplayName`) with no batching anywhere (no DataLoader exists in this codebase at all). A list of N employees with an `assignmentHistory` field in the query costs O(N × assignment-count × 4) sequential round trips.

**Fix:** At minimum, parallelize the 4 lookups inside `toAssignmentView` with `Promise.all`, and parallelize the per-assignment loop in `assignmentHistory` with `Promise.all` instead of a serial `for` loop. For the cross-row N+1 itself, either introduce a request-scoped DataLoader/batching layer for `PositionService`/`DepartmentService`/`LocationService`/`EmployeeDirectoryService` lookups, or (simpler, matches this codebase's current lack of DataLoader infrastructure) have the web client stop requesting `assignmentHistory` on the list view and only fetch it on the single-employee detail query — check `packages/web/src/modules/employees/graphql/employee.operations.ts`'s `EMPLOYEES_QUERY` and trim it to just `currentAssignment` (or nothing) for the list, moving `assignmentHistory` to the detail query only.

**Verify:** With `preview_logs`/query logging on, load the Employees list page with 10+ seeded employees and confirm the query count no longer scales linearly with historical assignment count.

## 6. Holiday-calendar "auto-populate" comment is fiction

**File:** `packages/api/src/modules/leave/leave.resolver.ts:272`

The comment claims `holidayCalendarId` is "auto-populated from the employee record" for self-service leave requests; the code only reads `input.holidayCalendarId`. `leave.module.ts` doesn't even import `EmployeeModule`. Today's web self-service form happens to send the field itself (client-side), so this isn't visibly broken yet — but it's misleading and leaves any other caller (future mobile client, direct API use) with silent empty holiday-exclusion.

**Fix:** Either (a) delete the misleading comment and leave the client-side responsibility as-is (document it as a client contract instead), or (b) actually wire the fallback: import `EmployeeDirectoryService` into `LeaveModule`, and in `submitMyLeaveRequest`, when `input.holidayCalendarId` is omitted, look up the calling employee's own `holidayCalendarId` (from Phase 4 work) and use that. Option (b) matches what the plan originally asked for and is preferred.

**Verify:** Submit a self-service leave request without `holidayCalendarId` for an employee that has one assigned on their record; confirm holidays in range are excluded from the day count.

## 7. `updateEmployee` accepts invalid email format

**File:** `packages/api/src/modules/employee/dto/update-employee.input.ts:33`

`workEmail` has `@IsString()`/`@MaxLength(320)` but not `@IsEmail()`, unlike `create-employee.input.ts`'s identical field.

**Fix:** Add `@IsEmail()` to `UpdateEmployeeInput.workEmail`, matching create.

**Verify:** Call `updateEmployee` with `workEmail: "not-an-email"` and confirm it's now rejected by validation.

## 8. `updateEmployee` mutation is wired to nothing in the web UI

**File:** `packages/web/src/modules/employees/pages/EmployeesListPage.tsx:525`

The `updateEmployee` mutation hook and its loading flag are declared, then immediately `void`-ed. No button/form in the file calls it. The identity/lifecycle-date fields this phase was meant to expose for editing (middleName, salutation, confirmation dates, contract end date, notice period, retirement date) have no way to actually be edited.

**Fix:** Add the edit form/controls to the Tethr employee detail panel and wire them to this mutation (remove the `void` lines once it's actually used).

**Verify:** In the browser, edit an existing employee's lifecycle-date fields from the detail panel and confirm the change persists after reload.

## 9. Six near-duplicate CRUD services with three different (inconsistent) merge styles

**Files:** `employee-education.service.ts`, `employee-work-history.service.ts`, `employee-personal-details.service.ts`, `employee-exit-interview.service.ts`, `employee-separation.service.ts`, `employee-offboarding.service.ts`

All reimplement the same create/transaction/publish-event/audit skeleton, but with three different partial-update merge styles: whole-object `Object.assign` (personal-details, separation), per-field `if (x !== undefined)` (education, work-history, exit-interview), and unconditional assignment (offboarding — the actual cause of finding #4).

**Fix:** Standardize on the per-field `!== undefined` guard style everywhere (it's the only one that doesn't silently null out omitted fields). Consider factoring the shared create/transaction/publish/audit skeleton into one reusable helper (a small generic function or base class) that all six call into, so a future fix to this pattern only needs to happen once. Not urgent to do before shipping, but do it in the same pass as fixing #4 since you'll already be touching every one of these files.

**Verify:** `npm run typecheck` / `npm test` after the refactor; no behavior change expected other than #4's fix.

## 10. Dead repository injections in `EmployeeService`

**File:** `packages/api/src/modules/employee/employee.service.ts:88`

`EMPLOYEE_SEPARATION_REPOSITORY` and `EMPLOYEE_OFFBOARDING_TASK_REPOSITORY` are injected then immediately `void`-ed; `separate()` writes both entities through the raw transaction manager instead.

**Fix:** Either remove the two dead injections entirely (simplest — the raw-manager pattern is already correct and consistent with how `Employee` itself is written in this method), or actually route the writes through `this.separations`/`this.offboardingTasks` if there's a reason to prefer the repository abstraction. Pick one; don't leave both.

**Verify:** `npm run typecheck`/`npm run lint` — no unused-injection warnings, `separate()` still creates both rows correctly.

---

## Full regression pass (after all 10 are addressed)

- `npm run typecheck`, `npm run build`, `npm run lint` (module-boundary rule must stay green).
- `npm test` — add/extend specs per fix above (especially #2's ownership-check test and #3's history-preservation test).
- `docker compose up -d` + `npm run start -w @hrms/api`, then in `npm run dev -w @hrms/web`: create an employee, add education/work-history entries (self-service and Tethr-side), attempt cross-employee access as a plain employee user and confirm it's rejected, run a separation end-to-end including offboarding tasks, edit an offboarding task's status only and confirm dueDate/notes survive, submit self-service leave and confirm holiday exclusion works, and edit lifecycle-date fields from the Tethr detail panel.
- Generate a real TypeORM migration before any non-dev deploy — still `synchronize`-only today (pre-existing known follow-up, applies to every new table/column in this feature set).
