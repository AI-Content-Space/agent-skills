---
name: "brain-wiki-ingest"
description: "Use when processing or analyzing materials for the local brain knowledge base under brain/Raw Sources and converting them into Wiki summaries, concepts, entities, reviews, and tracking docs according to the Brain Wiki specification. Also use when updating raw-sources-processing-registry, directory processing trackers, or when the user asks to deepen, standardize, or systematize knowledge-base analysis in this brain vault."
---

# Brain Wiki Ingest

Use this skill for the knowledge base rooted at:

- `~/Library/Mobile Documents/iCloud~md~obsidian/Documents/inbox/brain`

This skill is not a generic note-taking workflow. It is specifically for maintaining the local Brain Wiki as an LLM Wiki system with:

- `Raw Sources/` as source-of-truth inputs
- `Wiki/` as compiled knowledge
- `Schema/Wiki Spec.md` as the operating contract

## Read First

Before doing any work, read these files in order:

1. `Schema/Wiki Spec.md`
2. `Wiki/reviews/raw-sources-processing-registry.md`
3. If the task targets a specific directory and a tracker already exists, read that directory tracker
4. If the task targets an existing topic cluster, read the most relevant summary/entity/concept pages before writing

## What This Skill Must Enforce

### 1. Respect the Brain path rules

- If a page in `Wiki/` or `Schema/` references a file inside `brain/`, use a path relative to `brain/`
- If it references a local file outside `brain/`, use an absolute path
- Use:
  - `source` for real files or directories
  - `source_ref` for logical/section/chapter/abstract provenance
  - `source_url` for web URLs

Never put wiki links, prose descriptions, or mixed provenance into `source`.

### 2. Classify before extracting

Do not process every source the same way. First classify the target as one of:

- long-form article / book / white paper
- short post / thread / clipping
- transcript / subtitle / meeting record
- image knowledge map / mind map / visual reference
- internal rule doc / schema / data dictionary
- course bundle / directory collection

The classification decides:

- how deep the summary should be
- whether the output should be a summary, review, concept update, entity update, or only tracker coverage
- whether to emphasize narrative, glossary, decisions, contradictions, structure, or navigation

### 3. Update tracking before claiming coverage

For batch or directory work, never stop at generating summary files. Always update:

- the directory processing tracker
- `Wiki/reviews/raw-sources-processing-registry.md`
- `Wiki/_index.md` if the new work should be discoverable globally

Coverage should be stated in terms of actual files under `Raw Sources`, not just newly created pages.

This is mandatory, not optional. If the content changed but the tracking files did not, the task is incomplete.

### 4. Prefer integration over isolated summaries

Every new summary should connect into the graph:

- link existing entities where possible
- link existing concepts where possible
- create new concepts/entities only when there is real structural value
- avoid orphan pages

If a new source mostly restates an existing topic, capture the delta instead of pretending it is a totally separate knowledge island.

### 5. Preserve LLM Wiki behavior

The goal is not just "summarize this file". The goal is to compile knowledge into a maintainable wiki.

That means:

- detect contradictions against existing pages
- note data gaps when important
- route reusable conclusions into concepts/entities/reviews when needed
- treat high-value query results as candidate wiki pages rather than ephemeral chat output

## Default Workflow

### A. Single file in `Raw Sources/`

1. Read `Schema/Wiki Spec.md`
2. Check whether the file already has:
   - a summary
   - adjacent concepts/entities
   - coverage in `raw-sources-processing-registry`
3. Classify the source type
4. Extract the minimum information needed to build a high-signal page
5. Create or update:
   - one summary page
   - any necessary concept/entity/review pages
   - relevant tracker/registry rows if coverage changed
6. Verify links and path fields

### B. Directory in `Raw Sources/`

1. Read spec + global registry
2. Inventory all files in the directory
3. Split into:
   - processable knowledge sources
   - duplicates / mirrors
   - low-value or system files
   - files to skip but track
4. Create or update a directory processing tracker
5. Process each source according to its type
6. Update global registry counts and directory coverage
7. Update `_index.md` if the directory now deserves top-level discoverability

### C. Existing topic refinement

Use this skill when the user asks to make the analysis "deeper", "more complete", or "more standard".

In that case:

1. Read the existing cluster first
2. Identify what is missing:
   - source coverage
   - contradictions
   - concept structure
   - tracking
   - path normalization
3. Fix structure before expanding prose

## Output Standards

### Summary pages

Default shape:

- frontmatter
- core summary
- key points
- cross-links

Optional when valuable:

- contradictions
- data gaps
- era-context note
- format-specific note such as "transcript source" or "visual resource"

### Tracker pages

Trackers should answer:

- what files exist
- what was processed
- what was skipped
- what needs review
- why

Updating trackers after the work is part of the work itself. Do not defer it.

### Global registry

The global registry should answer:

- how much of `Raw Sources` is covered
- which directories are complete, partial, or untouched
- where deeper trackers live

## Decision Rules

- Do not create a new concept/entity page if a link to an existing page is enough
- Do create a new page if repeated future reuse is likely
- Treat duplicate or near-duplicate sources as separate Raw Sources for tracking, but do not duplicate knowledge needlessly
- Use `needs-review` when the source is ambiguous, duplicated, internal, low-fidelity, or clearly requires later validation
- Use `skipped` for system files and non-knowledge artifacts that still need accounting

## Verification Checklist

Before finishing, verify:

- all new `source` fields obey the path rules
- no wiki page was left orphaned by the change
- tracker coverage matches actual files
- `_index.md` and registry counts are not stale if scope changed
- new links resolve

## Required Progress File Updates

When a Brain Wiki task changes coverage, at minimum update all applicable progress files before finishing:

1. the directory processing tracker for the target scope
2. `Wiki/reviews/raw-sources-processing-registry.md`
3. `Wiki/_index.md` if the change should be globally discoverable or if review counts / batch history changed

If no tracker exists yet for the directory you are processing, create it as part of the same task.

Do not leave progress state only in chat. If the filesystem state and the tracker state disagree, assume the work is not finished.

## Required Post-Run Lint

After any meaningful Brain Wiki change, run a standards check before claiming completion.

Default command:

```bash
python3 ~/.codex/skills/brain-wiki-ingest/scripts/brain_wiki_lint.py \
  --brain-root ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/inbox/brain
```

If you only changed a subset and want a narrower pass, you may add one or more `--check-path` arguments:

```bash
python3 ~/.codex/skills/brain-wiki-ingest/scripts/brain_wiki_lint.py \
  --brain-root ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/inbox/brain \
  --check-path Wiki/reviews/raw-sources-processing-registry.md \
  --check-path Wiki/summaries
```

This lint is the minimum required verification layer. It does not replace scope-specific coverage checks for trackers and registries; it complements them.

If the task changed content pages, also pass the changed files so the lint can verify that progress files were updated in the same task:

```bash
python3 ~/.codex/skills/brain-wiki-ingest/scripts/brain_wiki_lint.py \
  --brain-root ~/Library/Mobile\ Documents/iCloud~md~obsidian/Documents/inbox/brain \
  --check-path Wiki \
  --changed-path Wiki/summaries/example.md \
  --changed-path Wiki/reviews/example-processing-tracker.md \
  --changed-path Wiki/reviews/raw-sources-processing-registry.md
```

### What the lint must catch

- `source` is neither brain-internal relative path nor absolute path
- `source` points to a file path that does not exist
- `source_ref` contains absolute file paths or list-format residue
- `source_url` is not an HTTP(S) URL
- broken `[[wiki-links]]`
- obvious frontmatter formatting mismatches in the checked files
- content pages changed without the corresponding tracker + registry updates being included in the same task

The lint is necessary but not sufficient. After lint, also confirm that the relevant progress files were updated.

Do not report work complete until lint passes or you have explicitly called out why a remaining lint failure is intentionally unresolved.

## Anti-Patterns

Avoid these:

- creating a summary without updating trackers
- finishing a task while leaving tracker or registry counts stale
- counting only files you touched instead of all files in the target directory
- writing generic summaries that ignore the existing wiki graph
- using absolute paths for files inside `brain/`
- hiding duplicated/dirty sources instead of recording them
- adding concept/entity pages that are too narrow to be reused
- skipping lint after edits and assuming the pages are compliant
