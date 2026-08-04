# Modular HRMS

A Human Resource Management System built as a **modular monolith** — one deployable system, strictly partitioned into modules that can each be extracted into a service later without a rewrite. The design goal above all others: **stay coherent as it scales.**

New here? Read [CLAUDE.md](CLAUDE.md) and the four docs it links ([context](context.md), [architecture](architecture.md), [plan](plan.md), [design](design.md)).

## Prerequisites

- Node.js ≥ 20
- Docker (for local Postgres + Redis) — or native Postgres 16 / Redis 7

## Quick start

```bash
git clone <repo> && cd hrms
bash scripts/setup-dev.sh            # installs deps, starts Postgres+Redis, seeds .env, runs migrations
npm run start:dev -w @hrms/api       # GraphQL API at http://localhost:3000/graphql
```

Without Docker, start Postgres/Redis yourself, copy each `packages/*/.env.example` to `.env`, then `npm install`.

## Monorepo layout

| Package | Name | Responsibility |
|---|---|---|
| `packages/shared` | `@hrms/shared` | Zero-dependency contracts: branded IDs, string-literal unions, domain-event payloads, pure utilities. The root of the dependency graph. |
| `packages/ui` | `@hrms/ui` | Design tokens (light + dark) and CSS-variable generation. Zero product knowledge. |
| `packages/api` | `@hrms/api` | The modular-monolith backend (NestJS + TypeORM + code-first GraphQL). `core/` platform + `modules/` HR domain. |
| `packages/worker` | `@hrms/worker` | Background job processor (queue abstraction). |
| `packages/web` | `@hrms/web` | React + Vite + Jotai-style SPA. |

Dependencies flow one direction: `shared` → (`ui`, `api`, `worker`) → `web`. No cycles. `frontend` and `backend` never import each other — only the API contract via `@hrms/shared`.

## Scripts (run from repo root)

| Command | Does |
|---|---|
| `npm run build` | Build every package in dependency order |
| `npm run typecheck` | Type-check every package (builds `shared`/`ui` first so their types resolve) |
| `npm run lint` | ESLint, including the `core/ ↛ modules/` boundary rule |
| `npm test` | Unit tests across packages |
| `npm run format` | Prettier write |

## The guarantees that keep it from crumbling

These are enforced in code, not just documented:

- **Tenant isolation at the data layer.** `TenantScopedRepository` injects the current tenant into every query; a query *cannot forget* to scope.
- **Effective-dating built in.** `TemporalEntity` gives backbone facts `validFrom`/`validTo`; `asOf(date)` queries are reproducible.
- **Events, not call chains.** State changes publish domain events through a transactional **outbox**; consumers are **idempotent**. A missed event never leaves an inconsistent system.
- **No cross-module FKs.** Modules reference each other by ID; the `core/ ↛ modules/` rule and ID-only references keep any module extractable.
- **Append-only audit.** Every mutation to sensitive data writes an immutable audit event.
- **Fail-fast config.** Environment is schema-validated at startup; a missing/malformed var stops boot rather than failing at runtime.

## Status

See [docs/STATUS.md](docs/STATUS.md) for what is implemented vs. scaffolded vs. pending.
