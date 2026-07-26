#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Dump the registrations database to ./backups/.
#
# Losing pre-registrations days before the contest is the worst realistic
# outcome for this project, and the data lives in a single Docker volume with
# no copy anywhere else. This is the cheapest insurance available.
#
#   ./scripts/backup-db.sh            # write a new dump
#   ./scripts/backup-db.sh --restore backups/2026-07-26T14-30-00.archive.gz
#
# Cron it hourly while registration is open:
#   0 * * * * cd /path/to/repo && ./scripts/backup-db.sh >> backups/cron.log 2>&1
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

CONTAINER="${MONGO_CONTAINER:-pstu-mongo}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
KEEP="${BACKUP_KEEP:-48}"   # how many dumps to retain

# Credentials come from .env, the same place compose reads them from.
if [[ -f .env ]]; then
  # shellcheck disable=SC1091
  set -a; source .env; set +a
fi

DB="${MONGO_DB:-IT_Carnival}"
USER="${MONGO_ROOT_USER:-carnival}"
PASS="${MONGO_ROOT_PASSWORD:-}"

auth_args=()
if [[ -n "$PASS" ]]; then
  auth_args=(-u "$USER" -p "$PASS" --authenticationDatabase admin)
fi

if ! docker ps --format '{{.Names}}' | grep -qx "$CONTAINER"; then
  echo "error: container '$CONTAINER' is not running" >&2
  exit 1
fi

# ---- restore --------------------------------------------------------------
if [[ "${1:-}" == "--restore" ]]; then
  ARCHIVE="${2:-}"
  [[ -f "$ARCHIVE" ]] || { echo "error: no such archive: $ARCHIVE" >&2; exit 1; }

  echo "About to REPLACE database '$DB' with $ARCHIVE."
  read -r -p "Type the database name to confirm: " confirm
  [[ "$confirm" == "$DB" ]] || { echo "aborted"; exit 1; }

  docker exec -i "$CONTAINER" mongorestore \
    "${auth_args[@]}" --archive --gzip --drop --nsInclude="$DB.*" < "$ARCHIVE"
  echo "restored $ARCHIVE"
  exit 0
fi

# ---- backup ---------------------------------------------------------------
mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%S)"
OUT="$BACKUP_DIR/$STAMP.archive.gz"

docker exec "$CONTAINER" mongodump \
  "${auth_args[@]}" --db "$DB" --archive --gzip > "$OUT"

SIZE="$(du -h "$OUT" | cut -f1)"
echo "$(date -u +%FT%TZ)  wrote $OUT ($SIZE)"

# A dump of an empty or failed database is a few hundred bytes. Say so loudly
# rather than letting a broken backup look successful.
if [[ "$(stat -c%s "$OUT")" -lt 300 ]]; then
  echo "WARNING: dump is suspiciously small — verify the database is reachable" >&2
fi

# ---- prune ----------------------------------------------------------------
ls -1t "$BACKUP_DIR"/*.archive.gz 2>/dev/null | tail -n +$((KEEP + 1)) | while read -r old; do
  rm -f "$old"
  echo "pruned $old"
done
