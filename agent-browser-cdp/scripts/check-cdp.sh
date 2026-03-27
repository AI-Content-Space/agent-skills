#!/usr/bin/env bash

set -euo pipefail

PORT="${1:-${AB_CDP_PORT:-9222}}"
VERSION_URL="http://127.0.0.1:${PORT}/json/version"

if ! curl -fsS "$VERSION_URL" >/dev/null 2>&1; then
  echo "CDP is not reachable on port $PORT" >&2
  exit 1
fi

curl -fsS "$VERSION_URL"
