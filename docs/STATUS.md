# Foundation Status

> As of 2026-08-03. What exists, what's scaffolded, what's next, and the decisions behind it. Phases 0–2 are complete, Phase 3 Compensation is in progress, and the V1 client/employee/Tethr portal foundation is now in place.

## V1 Portal Foundation

- Tenant-scoped role assignments resolve effective permissions, expose backend-sourced assignable workspace roles, and select one of the `tethr`, `client`, or `employee` portals. Signup seeds the first user as a persisted `clientAdmin`; role checks now protect employee, leave, and compensation boundaries.
- Client users have a people overview with live-data-driven onboarding progress, read-only employee directory, hiring-request workflow with persisted update history, compensation workspace, shared leave-request monitoring, and role-aware workspace-user screen. Client admins can add teammates and update API-provided assignable access roles. The selected-employee panel now surfaces client-facing details: headshot/profile, DOB, joining/probation facts, role, current salary, inline effective-dated salary adjustments, assessment history/new assessment action, client-visible document versions/signature status, and bonus history/award action for permitted roles.
- Employees have a dedicated self-service workspace with explicit employment facts for joining date, days since joining, probation end/days left, annual/monthly salary, leave balances/requests with submitted/decision timestamps and Tethr decision notes, a compact month-grouped upcoming-holidays calendar, contact/address/profile-photo updates, news bulletin, and feedback submission. Own-record GraphQL operations derive the employee identity from the authenticated user rather than accepting it from the browser.
- Tethr HR/Admin role definitions and navigation are available. Tethr Admin can list/onboard client workspaces, seed the first client administrator, update workspace-user access levels from the backend policy matrix, and link existing users to employee records when assigning employee access. Tethr users can onboard employee records through a dedicated intake, manage hiring request statuses with client-visible update notes/history, publish announcements, triage employee feedback, triage/approve/reject leave requests with employee/client/Tethr request trail metadata, record assessments, revise effective-dated salary, prepare employee document upload/download access, attach employee documents, add document versions/signature metadata, request manual e-signature envelopes, manage employee onboarding checklists, award bonuses, and maintain Tethr-only private HR records through live GraphQL-backed slices.
- New V1 backend modules/surfaces: account-level client workspace onboarding, `modules/recruitment` for client hiring requests, `modules/engagement` for announcements and employee feedback, `modules/employee-records` for assessment/document links, Tethr-only HR records, and onboarding checklists, document version/signature metadata inside `core/documents`, and compensation bonus awards inside `modules/compensation`.
- Still incomplete for full V1: real object-storage binary transfer and provider-backed e-signature execution behind the document access descriptors, custom roles/data scopes beyond the system-role access levels, and payroll.

## Current Verification Note

- `npm run build:contracts`, `npm run typecheck -w @hrms/api`, `npm run typecheck -w @hrms/web`, API tests (18 suites / 63 tests), and `npm run build` pass after the V1 portal, live client onboarding progress, engagement, records, hiring update-history, backend-sourced access-role assignment, bonus, salary-adjustment, leave-handshake, employee self-service employment facts/holiday calendar, Tethr HR private-record, employee-linked access-level editing, document access/version/signature requests, and HR onboarding checklist slices. The web build currently emits Vite's large-chunk warning at ~554.29 kB minified JS.
- `npm install --include=optional` restored the missing WSL/Linux optional packages for Rollup and ESLint's resolver. `npm run lint` exits successfully with 30 pre-existing import-order warnings; there are no lint errors.

## Foundation Verification (pre-Phase 3 slice)

| Gate              | Command                                                  | Result                                                         |
| ----------------- | -------------------------------------------------------- | -------------------------------------------------------------- |
| Type-check        | `npm run typecheck`                                      | ✅ all 5 packages                                              |
| Build             | `npm run build`                                          | ✅ all 5 packages (api/worker via tsc+tsc-alias, web via Vite) |
| Lint              | `npm run lint`                                           | ✅ 0 problems (incl. `core/ ↛ modules/` boundary)              |
| Unit tests        | `npm test`                                               | ✅ 57 passing (shared 20, ui 5, api 32)                        |
| Live boot + smoke | `docker compose up -d` then `npm run start -w @hrms/api` | ✅ boots; 28 tables; Phase 1 + Phase 2 GraphQL flows verified  |

## Phase 3 Compensation Verification

| Gate       | Command                | Result                                                                 |
| ---------- | ---------------------- | ---------------------------------------------------------------------- |
| Type-check | `npm run typecheck`    | ✅ all 5 packages                                                      |
| Unit tests | `TMPDIR=/tmp npm test` | ✅ all workspace tests (`api` includes compensation + schema coverage) |
| Lint       | `npm run lint`         | ✅ exits cleanly; 49 existing import-order warnings remain             |
| Build      | `npm run build`        | ✅ all 5 packages (api/worker via tsc+tsc-alias, web via Vite)         |

Node/npm now work from WSL, and dependencies have been refreshed with Linux
optional native packages required by ESLint's resolver and Rollup. The current
tool environment can run the Node dev servers, but it cannot access the Docker
socket at `/var/run/docker.sock`; Docker lifecycle checks may still need a normal
WSL terminal.

### Verified running locally (Docker) — 2026-06-20

`docker compose up -d` (Postgres + Redis) → `npm run start -w @hrms/api`. The app
boots, TypeORM `synchronize` creates all **28 tables**, and GraphQL serves at
http://localhost:3000/graphql. Exercised end to end:

- **Core HR:** `createEmployee` then `employees` (tenant-scoped) round-trip.
- **Leave:** create leave type → submit request (costed at 5 working days, Mon–Fri)
  → approve (balance reserved, then spent).
- **Attendance:** clock in/out → time entry → timesheet open → submit → approve → lock.
- Tenant guard fires on Phase 2 queries too: no `x-organization-id` header →
  `TENANT_CONTEXT_MISSING`.
- Every state change wrote its event to the transactional **outbox** in the same
  transaction (`employee.created`, `leave.requested`, `leave.approved`,
  `timesheet.submitted`, `timesheet.locked` — the last two feed Payroll), confirmed
  in Postgres.

The web app at http://localhost:5173 was driven end to end in the browser: **sign
up → dashboard** (live metrics) → **Employees** (live; created an employee through
the form and it appeared) → **sign out** redirects to /login, and hitting a
protected route while signed out redirects to /login. The tenant comes from the
JWT (no dev header). See README "Quick start".

## Implemented (working, tested)

- **`@hrms/shared`** — branded IDs, domain unions, the typed domain-event contract
  (discriminated on `name`), half-open effective-dating math, pure utils.
- **`@hrms/ui`** — design tokens (light + dark) with compile-time parity, exposed
  as the full CSS-variable contract (color, spacing scale, layout, motion, type),
  from design.md. A test locks the contract so the generator can't drop a token
  the component CSS relies on.
- **`@hrms/api` — `core/` platform:** fail-fast config (zod), database + base
  entities (`BaseEntity` / `TenantScopedEntity` / `TemporalEntity`), tenancy
  (AsyncLocalStorage context + auto-scoping repository + provider factory +
  middleware), events (transactional **outbox** + in-process bus + **idempotent
  consumer** + relay), append-only **audit**, auth (User≠Employee, scrypt password
  hashing, `employee.terminated` consumer), authz (permissions + Role + guard),
  and light workflow/notifications/documents service interfaces. The entrypoint
  loads `.env` (dotenv) and enables dev CORS so the SPA can call the API.
- **`@hrms/api` — `modules/` domain spine:** organization (Organization tenant
  root + legal entity/location/department/cost-center), position (job/grade/pay
  band/job-family/position), employee (full GraphQL vertical: entity, published
  `EmployeeDirectory`, service emitting events in-transaction + audit, resolver),
  assignment (effective-dated, non-overlap guard).
- **`@hrms/api` — Phase 2 modules (`modules/`):** **leave** (config-as-data leave
  types, per-period balances with reserve→spend, holiday calendars, working-day
  costing via shared helpers, requests routed through the workflow engine, GraphQL
  vertical; emits `leave.requested`/`approved`/`rejected`/`cancelled`);
  **attendance** (clock-in/out → time entries, timesheet lifecycle
  open→submit→approve→lock, GraphQL vertical; emits `timesheet.submitted`/`locked`).
  `leave.approved` and `timesheet.locked` are the inputs Payroll will consume.
- **`@hrms/api` — auth (core/auth + modules/account):** `@nestjs/jwt` login + `me`
  (core), tenant signup that creates org + admin user (modules/account, composing
  Organization + Auth published interfaces). The TenantContextMiddleware verifies
  the bearer token and sets tenant + principal from it (x-organization-id stays as
  a dev fallback). Stateless JWT — no per-request auth DB hit. Workspace-user
  provisioning and role updates reuse persisted system roles and enforce which
  roles the current admin may assign.
- **`@hrms/api` — Phase 3 compensation started (`modules/compensation`):** pay
  component config, salary structures, effective-dated salary revisions, and
  one-off bonus awards.
  Salary revisions validate employees through the published `EmployeeDirectory`
  interface, close the prior open-ended revision, emit `compensation.revised`,
  and avoid cross-module database foreign keys. This slice has focused service
  tests and schema coverage; type-check, tests, lint, and build now pass.
- **`@hrms/api` — `core/documents`:** document metadata now carries an initial
  `document_versions` history. New versions update the latest storage pointer
  while preserving prior storage keys, size/content facts, signature status,
  signed date, provider, and envelope ID. The document boundary now returns
  provider-shaped upload/download access descriptors and can open a manual
  e-signature request against the latest version; real object-storage byte
  transfer and provider-backed e-signature execution remain follow-up
  infrastructure.
- **`@hrms/api` — V1 portal extensions (`modules/recruitment`,
  `modules/engagement`, `modules/employee-records`):** client hiring requests
  with persisted client-visible update history and Tethr status updates; announcements/news bulletin; employee feedback
  submission and Tethr triage; team leave inbox/approve/reject handoff with
  submitted/decided timestamps and decision notes shared across employee,
  client, and Tethr views;
  assessment history; employee document links with portal visibility plus
  upload/download access descriptors, version/signature metadata reads,
  version-add actions, and manual e-signature requests; Tethr-only HR
  records for role, salary breakdown, bank credentials, hardware information,
  and employee record form data; and Tethr-only onboarding checklists for
  profile, contract, NDA, resume, bank details, hardware, and employee record
  form capture. Each module is
  tenant-scoped, references employees/documents by ID, emits typed domain events,
  and has focused service tests plus schema coverage.
- **`@hrms/api` — Account/client onboarding (`modules/account` +
  `modules/organization`):** Tethr Admin can list client workspaces and onboard a
  new client tenant with its first `clientAdmin` user. Client user creation runs
  inside the newly created tenant context and assigns persisted RBAC data.
- **`@hrms/web`** — React + Vite + Jotai app with **authentication**: login &
  signup pages, token persisted to localStorage (read on init), Apollo auth link
  (bearer), protected routes, sign-out. A live **dashboard** (real metrics), a live
  **Employees** directory (table + master-detail + working create/onboarding form,
  role/salary/profile/probation/inline salary adjustments/document upload and
  download access, document versions/signature status/e-sign
  requests/assessments/bonus detail surface plus Tethr-only private HR record
  and onboarding checklist editors),
  a live-data-driven client onboarding walkthrough, a workspace-user access editor with employee
  record linking for employee access, a live
  **Compensation** workspace (pay components, salary structures, salary
  revision history, and create/revise forms), **Client portfolio**, **Hiring
  requests** with client-visible update history, employee self-service holiday calendar, **Leave triage** with
  shared request-trail metadata, **Announcements**, **Employee feedback**, and
  role-aware portal home screens wired to the GraphQL API, a shell
  showing the signed-in user, theme provider (light/dark) — all on design tokens.
- **`@hrms/worker`** — queue abstraction (BullMQ) + example processor + runner.

## Scaffolded (shape in place, to be fleshed out)

- Auth: refresh tokens, MFA, password policy, signup email verification, and
  populating the JWT with the user's permissions (login/signup/me + the JWT
  middleware guard are done).
- Authz: populating the request principal and registering `PermissionsGuard`
  (globally or per-resolver); data-scope enforcement in services.
- Workflow: approval chains/steps/escalation behind `WorkflowService`.
- Notifications: real per-channel delivery + templating behind `NotificationService`.
- Documents: real object-storage byte transfer and provider-backed e-signature execution behind `DocumentService`.
- Web: pages for the other live modules (Time off, Attendance, Organization,
  Positions) — currently disabled nav placeholders; and GraphQL codegen → typed
  hooks (queries are hand-written `gql` for now). The Employees detail panel will
  show department/manager/location once those fields are exposed over GraphQL.
- DB: generate the initial migration (see `packages/api/src/core/database/migrations/README.md`).

## Not yet started / next (roadmap)

Phase 3 Payroll remains next after the Compensation slice is hardened in browser
smoke testing. Payroll will consume `leave.approved`, `timesheet.locked`, and
`compensation.revised`, then lifecycle/talent and services/insight follow
(plan.md §4, §8). The spine, platform, and time-off/attendance inputs are in
place for them.

## Key decisions & deviations

- **npm workspaces over Nx** (architecture.md §15 deviation) — zero-install,
  fully verifiable. TS project-reference-free; packages build in explicit order.
- **Within-package imports are relative; `@/`,`~/` aliases** are wired via
  tsc-alias (build) + jest mapper. Cross-package uses real package names.
- **`@typescript-eslint/consistent-type-imports` is OFF** — it conflicts with
  NestJS constructor injection (its autofix turns DI class imports into
  `import type`, erasing the `emitDecoratorMetadata` reference and breaking DI).
- **Half-open date ranges** `[validFrom, validTo)` so adjacent records neither
  overlap nor gap.
- **GraphQL schema generated in memory** at boot (no filesystem dependency).
- **Vite consumes internal packages from source** (avoids CJS named-export interop).

## Known follow-ups / risks

- ⚠️ **Apollo Server v4 reached end-of-life 2026-01-26.** It works, but plan an
  upgrade to Apollo Server v5 + `@nestjs/apollo`/`@nestjs/graphql` v13 + NestJS v11.
- Generate the initial DB migration before any non-dev deploy.
- Wire the authenticated principal into `TenantContext` (the middleware currently
  reads an `x-organization-id` header as a dev shim).
