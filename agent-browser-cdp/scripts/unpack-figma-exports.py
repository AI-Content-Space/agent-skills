#!/usr/bin/env python3

import sys
import zipfile
from pathlib import Path


def main() -> int:
    if len(sys.argv) < 3:
        print(
            "Usage: unpack-figma-exports.py <raw-exports-dir> <icons-dir> [zip-stem ...]",
            file=sys.stderr,
        )
        return 1

    raw_dir = Path(sys.argv[1])
    icons_dir = Path(sys.argv[2])
    requested = sys.argv[3:]

    icons_dir.mkdir(parents=True, exist_ok=True)

    zip_paths = (
        [raw_dir / f"{stem}.zip" for stem in requested]
        if requested
        else sorted(raw_dir.glob("*.zip"))
    )

    for zip_path in zip_paths:
        if not zip_path.exists():
          print(f"Missing zip: {zip_path}", file=sys.stderr)
          return 1
        with zipfile.ZipFile(zip_path) as archive:
            info = archive.infolist()[0]
            data = archive.read(info)
        target = icons_dir / f"{zip_path.stem}.svg"
        target.write_bytes(data)
        print(f"{zip_path.name} -> {target.name} ({len(data)} bytes) from {info.filename}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
