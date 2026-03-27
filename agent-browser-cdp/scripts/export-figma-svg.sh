#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 3 ]]; then
  echo "Usage: export-figma-svg.sh <port> <icons-dir> <layer-name> [layer-name ...]" >&2
  exit 1
fi

PORT="$1"
ICONS_DIR="$2"
shift 2

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RAW_DIR="${FIGMA_RAW_EXPORT_DIR:-$(dirname "$ICONS_DIR")/raw-exports}"

mkdir -p "$RAW_DIR" "$ICONS_DIR"

node "$SCRIPT_DIR/export-figma-layers.js" "$PORT" "$RAW_DIR" "$@"
python3 "$SCRIPT_DIR/unpack-figma-exports.py" "$RAW_DIR" "$ICONS_DIR" "$@"

for name in "$@"; do
  echo "$ICONS_DIR/$name.svg"
done
