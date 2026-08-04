#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Clear the "payment announcement sent" stamp from IUPC teams.
#
#   ./scripts/clear-iupc-notified.sh            # list what is stamped
#   ./scripts/clear-iupc-notified.sh --apply    # unset it
#
# Same runner as scripts/seed-db.sh, for the same reasons: the BUILDER image has
# the real dependency tree (the runtime image bundles mongoose into a server
# chunk), and .env decides which database is meant — a local compose volume or a
# hosted cluster. So the command that inspects local is the command that fixes
# production; only .env differs.
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

net_args=()
if [[ "$TARGET" == "local" ]]; then
  if ! docker network inspect "$NETWORK" >/dev/null 2>&1; then
    echo "error: docker network \"$NETWORK\" not found — start the stack first:" >&2
    echo "       docker compose up -d mongo" >&2
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
  -v "$PWD/scripts/clear-iupc-notified.mjs:/app/clear-iupc-notified.mjs:ro" \
  "$IMAGE" node /app/clear-iupc-notified.mjs "$@"
