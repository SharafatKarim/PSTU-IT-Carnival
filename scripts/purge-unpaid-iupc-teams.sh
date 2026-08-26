#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${TOOLS_IMAGE:-pstu-carnival-tools}"
NETWORK="${MONGO_NETWORK:-pstu-it-carnival_default}"

if [[ -f .env ]]; then
  set -a; source .env; set +a
fi

if [[ -z "${MONGO_URI:-}" ]]; then
  if [[ -n "${MONGO_ROOT_USER:-}" && -n "${MONGO_ROOT_PASSWORD:-}" ]]; then
    MONGO_URI="mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@mongo:27017/${MONGO_DB:-pstu_it_carnival}?authSource=admin"
  fi
fi

if [[ -z "${MONGO_URI:-}" ]]; then
  echo "error: MONGO_URI is not configured in .env" >&2
  exit 1
fi

net_args=()
if docker network inspect "$NETWORK" >/dev/null 2>&1; then
  net_args=(--network "$NETWORK")
fi

docker build --target builder -t "$IMAGE" . >/dev/null

docker run --rm \
  "${net_args[@]}" \
  -e "MONGO_URI=$MONGO_URI" \
  -v "$PWD/scripts/purge-unpaid-iupc-teams.mjs:/app/purge-unpaid-iupc-teams.mjs:ro" \
  "$IMAGE" node /app/purge-unpaid-iupc-teams.mjs "$@"
