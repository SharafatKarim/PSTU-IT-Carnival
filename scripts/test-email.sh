#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# SMTP check for the registration confirmation mail.
#
#   ./scripts/test-email.sh                 # verify the login only
#   ./scripts/test-email.sh you@gmail.com   # verify, then send a real message
#
# Credentials are read from .env — never passed as arguments, so they stay out
# of shell history and process listings.
#
# It runs in the BUILDER image rather than the running web container: the
# runtime image is the standalone build, where Next has bundled nodemailer into
# a server chunk instead of leaving it in node_modules, so `import nodemailer`
# cannot resolve there. The builder stage has the real dependency tree and the
# same version from the lockfile. First run builds it; later runs are cached.
# ---------------------------------------------------------------------------
set -euo pipefail

cd "$(dirname "$0")/.."

IMAGE="${TOOLS_IMAGE:-pstu-carnival-tools}"

[[ -f .env ]] || { echo "error: no .env — copy .env.example and fill it in" >&2; exit 1; }

if ! grep -qE '^EMAIL_USER=.+' .env || ! grep -qE '^EMAIL_PASS=.+' .env; then
  echo "error: EMAIL_USER and EMAIL_PASS must both have values in .env" >&2
  echo "       Create a Google App Password (2-Step Verification must be on):" >&2
  echo "       https://myaccount.google.com/apppasswords" >&2
  exit 1
fi

echo "preparing the tools image (cached after the first run) …"
docker build --target builder -t "$IMAGE" . >/dev/null

docker run --rm \
  --env-file .env \
  -v "$PWD/scripts/test-email.mjs:/app/test-email.mjs:ro" \
  "$IMAGE" node /app/test-email.mjs "$@"
