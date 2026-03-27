#!/usr/bin/env bash

set -euo pipefail

PORT="${1:-${AB_CDP_PORT:-9222}}"
PROFILE_DIR="${2:-${AB_PROFILE_DIR:-$HOME/.chrome-agent-browser}}"
START_URL="${3:-${AB_START_URL:-about:blank}}"
CHROME_APP="${CHROME_APP:-/Applications/Google Chrome.app}"

if [[ ! -d "$CHROME_APP" ]]; then
  echo "Chrome app not found: $CHROME_APP" >&2
  exit 1
fi

mkdir -p "$PROFILE_DIR"

version_url="http://127.0.0.1:${PORT}/json/version"

if curl -fsS "$version_url" >/dev/null 2>&1; then
  echo "CDP already available on port $PORT"
  curl -fsS "$version_url"
  exit 0
fi

open -na "$CHROME_APP" --args \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check \
  "$START_URL" \
  >/tmp/agent-browser-cdp-chrome.log 2>&1

for _ in $(seq 1 50); do
  if curl -fsS "$version_url" >/dev/null 2>&1; then
    echo "CDP ready on port $PORT"
    curl -fsS "$version_url"
    exit 0
  fi
  sleep 0.2
done

echo "Chrome started, but CDP did not become ready on port $PORT" >&2
exit 1
