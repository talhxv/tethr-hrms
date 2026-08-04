#!/usr/bin/env bash
# Bootstraps the local development environment. Idempotent — safe to re-run.
#
#   bash scripts/setup-dev.sh            # start services, seed .env, install, migrate
#   bash scripts/setup-dev.sh --down     # stop services
#   bash scripts/setup-dev.sh --reset    # wipe data volumes and re-create
#
# CI does NOT run this script; it provides its own service containers.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

compose() {
  if docker compose version >/dev/null 2>&1; then
    docker compose "$@"
  elif command -v docker-compose >/dev/null 2>&1; then
    docker-compose "$@"
  else
    echo "ERROR: Docker Compose not found. Install Docker Desktop, or run Postgres/Redis natively." >&2
    exit 1
  fi
}

case "${1:-up}" in
  --down)
    echo "Stopping services..."
    compose down
    exit 0
    ;;
  --reset)
    echo "Wiping data volumes..."
    compose down -v
    ;;
esac

# 1. Seed .env files from .env.example where missing (never overwrite an existing .env).
for example in packages/*/.env.example; do
  [ -e "$example" ] || continue
  env_file="$(dirname "$example")/.env"
  if [ ! -f "$env_file" ]; then
    cp "$example" "$env_file"
    echo "Created $env_file"
  fi
done

# 2. Install dependencies (workspace-aware).
echo "Installing dependencies..."
npm install

# 3. Start infrastructure and wait for health.
echo "Starting Postgres + Redis..."
compose up -d
echo "Waiting for Postgres to be healthy..."
for _ in $(seq 1 30); do
  if compose ps postgres | grep -q "healthy"; then break; fi
  sleep 2
done

# 4. Run schema migrations (idempotent — TypeORM tracks applied migrations).
echo "Running migrations..."
npm run migration:run -w @hrms/api || echo "No migrations to run yet."

echo "Done. Start the API with:  npm run start:dev -w @hrms/api"
