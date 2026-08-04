# Migrations

Schema migrations live here, one file per change (architecture.md §3.2). They are
generated from entity diffs against a running database — never hand-authored for
routine changes, and a committed migration's `up` is never rewritten.

## Generate the initial migration

With Postgres running (`bash scripts/setup-dev.sh`):

```bash
npm run migration:generate -w @hrms/api -- src/core/database/migrations/Init
npm run migration:run -w @hrms/api
```

## Local shortcut

For throwaway local databases, `DATABASE_SYNCHRONIZE=true` (the dev `.env`
default) auto-creates tables from the entities so you can run without a migration.
Never enable synchronize in shared/staging/production — generate and run
migrations there.
