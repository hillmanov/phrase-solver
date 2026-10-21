#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")"

compose=(docker compose -p local-phrase-solver -f compose.local.yaml)
state() { git rev-parse HEAD; cat client/package.json client/bun.lock | sha256sum; }
db_image() { docker image inspect --format "{{.Id}}" $("${compose[@]}" config --images) | sort; }
before=$(state)
db_before=$(db_image)
git rev-parse --abbrev-ref @{u} >/dev/null 2>&1 && git pull --ff-only
(cd client && bun update)
"${compose[@]}" pull db
if [ "$(state)" = "$before" ] && [ "$(db_image)" = "$db_before" ]; then
  echo "phrase-solver: already current"
  exit 0
fi
make build
if [ "$(db_image)" != "$db_before" ]; then
  pm2 restart "Phrase Solver - DB" >/dev/null && echo "Phrase Solver - DB: restarted"
fi
pm2 restart "Phrase Solver" >/dev/null && echo "Phrase Solver: restarted"
