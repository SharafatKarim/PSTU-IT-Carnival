#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Seed / update the coordinator contacts the event pages read.
#
#   ./scripts/seed-coordinators.sh            # show what is stored today
#   ./scripts/seed-coordinators.sh --apply    # write scripts/seed-coordinators.mjs
#
# Edit the CONTACTS list in scripts/seed-coordinators.mjs first, then --apply.
#
# Runs in the BUILDER image for the same reason scripts/test-email.sh does: the
# runtime image is the standalone build, where mongoose has been bundled into a
# server chunk instead of left in node_modules. The builder stage has the real
# dependency tree and the same version from the lockfile.
#
# MONGO_URI is assembled by docker-compose from the values in .env, so it is
# not in .env itself — it is rebuilt here from the same variables.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${TOOLS_IMAGE:-pstu-carnival-tools}"
NETWORK="${MONGO_NETWORK:-pstu-it-carnival_default}"

[[ -f .env ]] || { echo "error: no .env — copy .env.example and fill it in" >&2; exit 1; }

# shellcheck disable=SC1091
set -a; source .env; set +a

if [[ -z "${MONGO_URI:-}" ]]; then
  : "${MONGO_ROOT_USER:?set MONGO_ROOT_USER in .env}"
  : "${MONGO_ROOT_PASSWORD:?set MONGO_ROOT_PASSWORD in .env}"
  : "${MONGO_DB:?set MONGO_DB in .env}"
  MONGO_URI="mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongo:27017/${MONGO_DB}?authSource=admin"
fi

echo "preparing the tools image (cached after the first run) …"
docker build --target builder -t "$IMAGE" . >/dev/null

docker run --rm \
  --network "$NETWORK" \
  -e "MONGO_URI=$MONGO_URI" \
  -v "$PWD/scripts/seed-coordinators.mjs:/app/seed-coordinators.mjs:ro" \
  "$IMAGE" node /app/seed-coordinators.mjs "$@"
