#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Seed / update the coordinator contacts the event pages read.
#
# The payment number is NOT in the database — it is a constant in
# src/data/gaming.js, so the registration pages make no query at all.
#
#   ./scripts/seed-db.sh            # show what is stored today
#   ./scripts/seed-db.sh --apply    # write CONTACTS from seed-db.mjs
#
# Edit the CONTACTS list in scripts/seed-db.mjs first.
#
# Runs in the BUILDER image for the same reason scripts/test-email.sh does: the
# runtime image is the standalone build, where mongoose has been bundled into a
# server chunk instead of left in node_modules. The builder stage has the real
# dependency tree and the same version from the lockfile.
#
# Works against either database:
#
#   LOCAL   no MONGO_URI in .env — one is assembled for the `mongo` container
#           from the same values docker-compose uses, and the run joins the
#           compose network so that hostname resolves.
#   HOSTED  MONGO_URI set in .env (MongoDB Atlas, or any external server) —
#           used as-is, on the default bridge, which is all an internet-reachable
#           cluster needs. Atlas also requires this machine's IP to be on the
#           project's Network Access allow-list.
#
# So the same command seeds production as seeds local; only .env differs.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${TOOLS_IMAGE:-pstu-carnival-tools}"
NETWORK="${MONGO_NETWORK:-pstu-it-carnival_default}"

[[ -f .env ]] || { echo "error: no .env — copy .env.example and fill it in" >&2; exit 1; }

# shellcheck disable=SC1091
set -a; source .env; set +a

if [[ -n "${MONGO_URI:-}" ]]; then
  TARGET="external"
else
  TARGET="local"
  : "${MONGO_ROOT_USER:?set MONGO_ROOT_USER in .env}"
  : "${MONGO_ROOT_PASSWORD:?set MONGO_ROOT_PASSWORD in .env}"
  : "${MONGO_DB:?set MONGO_DB in .env}"
  MONGO_URI="mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongo:27017/${MONGO_DB}?authSource=admin"
fi

# Only the local container needs the compose network. Joining it for an
# external cluster would fail outright on a machine that has never run
# `docker compose up`.
net_args=()
if [[ "$TARGET" == "local" ]]; then
  if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
    echo "error: docker network \"$NETWORK\" not found — start the stack first:" >&2
    echo "       docker compose up -d mongo" >&2
    echo "       (or set MONGO_URI in .env to seed a hosted database instead)" >&2
    exit 1
  fi
  net_args=(--network "$NETWORK")
fi

echo "target: $TARGET database"
echo "preparing the tools image (cached after the first run) …"
docker build --target builder -t "$IMAGE" . >/dev/null

docker run --rm \
  "${net_args[@]}" \
  -e "MONGO_URI=$MONGO_URI" \
  -v "$PWD/scripts/seed-db.mjs:/app/seed-db.mjs:ro" \
  "$IMAGE" node /app/seed-db.mjs "$@"
