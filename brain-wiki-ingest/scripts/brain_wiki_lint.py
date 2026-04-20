#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path


WIKI_LINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
SOURCE_RE = re.compile(r'^source:\s*"?(.*?)"?\s*$', re.M)
SOURCE_REF_RE = re.compile(r'^source_ref:\s*"?(.*?)"?\s*$', re.M)
SOURCE_URL_RE = re.compile(r'^source_url:\s*"?(.*?)"?\s*$', re.M)


def iter_md_files(paths: list[Path]) -> list[Path]:
    files: list[Path] = []
    for path in paths:
        if path.is_file() and path.suffix == ".md":
            files.append(path)
        elif path.is_dir():
            files.extend(sorted(p for p in path.rglob("*.md") if p.is_file()))
    return sorted(set(files))


def normalize_wiki_target(target: str) -> str:
    target = target.split("|", 1)[0]
    target = target.split("#", 1)[0]
    return target.strip()


def build_stem_index(wiki_root: Path) -> dict[str, list[Path]]:
    index: dict[str, list[Path]] = {}
    for path in wiki_root.rglob("*.md"):
        index.setdefault(path.stem, []).append(path)
    return index


def wiki_target_exists(base: Path, stem_index: dict[str, list[Path]], target: str) -> bool:
    target = normalize_wiki_target(target)
    if not target:
        return True
    if "/" in target:
        return (base / f"{target}.md").exists()
    return target in stem_index


def strip_fenced_code_blocks(text: str) -> str:
    return re.sub(r"```.*?```", "", text, flags=re.S)


def check_file(
    path: Path,
    brain_root: Path,
    wiki_root: Path,
    stem_index: dict[str, list[Path]],
) -> list[str]:
    rel = path.relative_to(brain_root)
    issues: list[str] = []
    text = path.read_text(encoding="utf-8", errors="ignore")
    scan_text = strip_fenced_code_blocks(text)

    source = SOURCE_RE.search(scan_text)
    if source:
        value = source.group(1)
        if not (
            value.startswith("Raw Sources/")
            or value.startswith("Wiki/")
            or value.startswith("Schema/")
            or value.startswith("/")
        ):
            issues.append(f"{rel}: invalid source '{value}'")
        else:
            source_path = (brain_root / value) if not value.startswith("/") else Path(value)
            if not source_path.exists():
                issues.append(f"{rel}: source path does not exist '{value}'")

    source_ref = SOURCE_REF_RE.search(scan_text)
    if source_ref:
        value = source_ref.group(1)
        if value.startswith("/"):
            issues.append(f"{rel}: source_ref must not be an absolute path '{value}'")
        if value.startswith("- "):
            issues.append(f"{rel}: source_ref contains list residue '{value}'")

    source_url = SOURCE_URL_RE.search(scan_text)
    if source_url:
        value = source_url.group(1)
        if not (value.startswith("http://") or value.startswith("https://")):
            issues.append(f"{rel}: invalid source_url '{value}'")

    for match in WIKI_LINK_RE.finditer(scan_text):
        target = match.group(1)
        if not wiki_target_exists(wiki_root, stem_index, target):
            issues.append(f"{rel}: broken wiki link '[[{target}]]'")

    frontmatter_markers = text.count("---")
    if text.startswith("---") and frontmatter_markers < 2:
        issues.append(f"{rel}: frontmatter is not closed")

    return issues


def normalize_changed_paths(brain_root: Path, changed_paths: list[str]) -> list[str]:
    normalized: list[str] = []
    for raw in changed_paths:
        candidate = Path(raw).expanduser()
        if candidate.is_absolute():
            try:
                normalized.append(str(candidate.resolve().relative_to(brain_root)).replace("\\", "/"))
            except Exception:
                normalized.append(str(candidate))
        else:
            normalized.append(raw.replace("\\", "/"))
    return normalized


def progress_update_issues(changed_paths: list[str]) -> list[str]:
    issues: list[str] = []
    if not changed_paths:
        return issues

    content_prefixes = (
        "Wiki/summaries/",
        "Wiki/entities/",
        "Wiki/concepts/",
        "Wiki/comparisons/",
    )
    content_changed = any(path.startswith(content_prefixes) for path in changed_paths)
    if not content_changed:
        return issues

    registry_changed = "Wiki/reviews/raw-sources-processing-registry.md" in changed_paths
    tracker_changed = any(
        path.startswith("Wiki/reviews/") and path.endswith("processing-tracker.md")
        for path in changed_paths
    )

    if not registry_changed:
        issues.append(
            "changed content pages but did not include Wiki/reviews/raw-sources-processing-registry.md in changed paths"
        )
    if not tracker_changed:
        issues.append(
            "changed content pages but did not include any directory processing tracker in changed paths"
        )
    return issues


def main() -> int:
    parser = argparse.ArgumentParser(description="Lint Brain Wiki files against Brain Wiki Spec.")
    parser.add_argument("--brain-root", required=True, help="Path to brain root directory")
    parser.add_argument(
        "--check-path",
        action="append",
        default=[],
        help="Optional path relative to brain root to narrow lint scope; may be repeated",
    )
    parser.add_argument(
        "--changed-path",
        action="append",
        default=[],
        help="Optional path relative to brain root (or absolute path) representing files changed in this task; may be repeated",
    )
    args = parser.parse_args()

    brain_root = Path(args.brain_root).expanduser().resolve()
    wiki_root = brain_root / "Wiki"

    if not brain_root.exists():
        print(f"brain root does not exist: {brain_root}", file=sys.stderr)
        return 2

    check_paths = args.check_path or ["Wiki", "Schema"]
    resolved = [(brain_root / p).resolve() for p in check_paths]
    files = iter_md_files(resolved)
    stem_index = build_stem_index(wiki_root)

    issues: list[str] = []
    for path in files:
        issues.extend(check_file(path, brain_root, wiki_root, stem_index))
    issues.extend(progress_update_issues(normalize_changed_paths(brain_root, args.changed_path)))

    if issues:
        print("Brain Wiki lint failed:")
        for issue in issues:
            print(f"- {issue}")
        return 1

    print(f"Brain Wiki lint passed: checked {len(files)} markdown files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
