# Backup, restore and rollback

How to take a backup of the HRMS database, prove that it restores, and undo a bad deploy or migration. Covers launch tracker items 7 and 8.

**Status (17 Nov 2026):**

| Step | Status |
|---|---|
| Database backup | Done |
| Restore test | Done |
| Database rollback (migration revert) | Documented, not rehearsed |
| App deploy rollback on Render | Documented, not rehearsed: needs someone with access to the Render dashboard |

## What is and isn't in a backup

| Data | Where it lives | Covered by the database backup? |
|---|---|---|
| All HR records: employees, leave, time, pay, roles, users, audit | Supabase Postgres, `public` schema (99 tables) | Yes |
| The `uuid-ossp` extension that generates IDs | Supabase `extensions` schema | No. You must recreate it before restoring (step 2 below) |
| Uploaded documents and files | Supabase Storage | **No.** Download them separately from Supabase Storage |
| Secrets (JWT secret, database password, API keys) | Render environment and `packages/api/.env` | No. Keep them in a password manager |

The Supabase free plan has no downloadable backups and no point-in-time restore. Until the plan is upgraded, these manual dumps are the only backup.

## 1. Take a backup

Requirements: Docker, plus the database connection values from `packages/api/.env`. Never type the password into a command line or a shared document. Pass it in through the environment.

```bash
# Run from the repository root. Loads the DATABASE_* values without printing them.
set -a; . packages/api/.env; set +a
MSYS_NO_PATHCONV=1 docker run --rm \
  -e PGPASSWORD="$DATABASE_PASSWORD" \
  -v "$(pwd -W)/.local-ops:/out" postgres:17 \
  pg_dump -h "$DATABASE_HOST" -p "$DATABASE_PORT" -U "$DATABASE_USER" -d "$DATABASE_NAME" \
  -Fc -n public --no-owner --no-privileges -f /out/hrms-backup-$(date +%F).dump
```

- Use the `postgres:17` image. Its client tools must be at least as new as the server (PG 17.6).
- Keep dumps only in `.local-ops/`. That folder is gitignored, and the dumps contain personal data (CNIC, bank details, salaries), so never upload them to a shared drive or chat.
- Take a backup before every migration, before every bulk import, and at least weekly.

## 2. Restore and check a backup

Restore into a **separate, throwaway** database, never into live Supabase. The commands below use a local container.

```bash
PW=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
MSYS_NO_PATHCONV=1 docker run -d --name hrms-restore-test -e POSTGRES_PASSWORD="$PW" -e POSTGRES_DB=restore_check \
  -v "$(pwd -W)/.local-ops/hrms-backup-YYYY-MM-DD.dump:/backup/hrms.dump:ro" postgres:17

# The dump creates its own public schema and needs uuid-ossp in an "extensions" schema (as on Supabase).
docker exec hrms-restore-test psql -U postgres -d restore_check -c \
  'DROP SCHEMA public CASCADE; CREATE SCHEMA extensions; CREATE EXTENSION "uuid-ossp" SCHEMA extensions;'
MSYS_NO_PATHCONV=1 docker exec hrms-restore-test pg_restore -U postgres -d restore_check \
  --no-owner --no-privileges --exit-on-error /backup/hrms.dump
```

Then check the copy:

1. Compare the exact row count of every table in the copy against live Supabase. Use the same query on both sides: `count(*)` per table in `information_schema.tables` where `table_schema='public'`.
2. Check that the latest rows in the `migrations` table match live.
3. Delete the container: `docker rm -f hrms-restore-test`.

To restore into a real recovery environment (a new Supabase project), run the same `extensions` and `pg_restore` steps against that project. Then point the API's `DATABASE_*` settings at it.

## 3. Roll back a database migration

Migrations are applied **one at a time** and recorded in the `migrations` table.

- Do **not** run a full `migration:run`. Two older migrations, FormLinks (1792900000000) and HardwareRequests (1793670590665), are deliberately unapplied.
- Do **not** turn on `DATABASE_SYNCHRONIZE`.

To undo a migration:

1. Take a backup (step 1).
2. Revert only the latest migration: `npm run migration:revert --workspace=packages/api`. This runs that migration's `down()`.
3. Check the `migrations` table and the app.
4. If `down()` loses data, or you are unsure, restore the backup taken just before the migration into a new database instead. Switch over to it only after its row counts are checked.

## 4. Roll back an app deploy (Render)

The API is deployed from `render.yaml` (service `tethr-api`).

1. Open Render → `tethr-api` → **Events**, choose the last good deploy, and select **Rollback**. Or redeploy a known commit through **Manual deploy → Deploy a specific commit**.
2. If the bad deploy ran a migration, also roll back the database (section 3). Old code against a new schema may still work, but check it.
3. Confirm the API is healthy: you can sign in, and the dashboard and the employees list load.
4. Write the deploy ID, time and reason in the launch tracker.

Not yet rehearsed: this needs someone with access to the Render dashboard.

## Evidence log

| Date | What | Result |
|---|---|---|
| 17 Nov 2026 | `pg_dump` of the `public` schema (322,882 bytes) | OK |
| 17 Nov 2026 | Restore into a throwaway Postgres 17 container | OK, with no errors once the `extensions` schema existed |
| 17 Nov 2026 | Row counts compared with live Supabase | 99 of 99 tables identical (1,136 rows). 321 indexes and 100 constraints restored. Latest migration `RoleAccessAdjustments1793720000000` present |
| 17 Nov 2026 | Container deleted | OK |

Details are in [launch-evidence/restore-test-2026-11-17.json](launch-evidence/restore-test-2026-11-17.json) (counts only, no personal data).
