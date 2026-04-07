---
name: requirement-analyzer
description: Use when the user wants an existing requirement, PRD, spec, or feature brief reviewed for ambiguity, missing business closure, impact, feasibility, or development readiness before design or implementation.
---

# Requirement Analyzer

Review an existing written requirement and produce a structured analysis. This skill is agent-agnostic: it defines workflow, constraints, and output expectations without assuming a specific model, command, API, or runtime.

Use this skill for existing requirement documents, PRDs, specs, feature briefs, workflow descriptions, and requirement-review requests. Use it when the user wants to know whether a requirement is clear enough to start design or development, or wants ambiguities, missing assumptions, impact scope, and feasibility risks identified.

Do not use this skill for generating a full product design, writing an implementation plan, editing code, or inventing business decisions on behalf of the business owner. Do not treat every missing API or schema detail as a PRD defect when it clearly belongs to detailed design.

## Inputs

Provide exactly one primary input:

- `document_path`: path to the requirement document
- `document_content`: raw requirement text

Optional inputs:

- `project_root`: repository or docs root used for narrow context lookup
- `analysis_depth`: `quick`, `standard`, or `deep`
- `focus_areas`: subset of `business_closure`, `ambiguity_detection`, `impact_analysis`, `feasibility`, `consistency_check`, `quality_gates`
- `output_mode`: `gap_checklist` or `analysis_report`
- `output_path`: optional markdown output path

If both `document_path` and `document_content` are missing, stop and ask for the document.

## Core Constraints

1. Do not invent missing business facts. Record them as unknowns or follow-up questions.
2. Distinguish `fact`, `inference`, and `assumption` whenever the conclusion is not directly stated.
3. Every `P0` or `P1` issue must include evidence.
4. Keep repository scanning narrow. Read only directly related docs, interfaces, schemas, or code paths.
5. If evidence is insufficient, say so instead of forcing certainty.
6. Prefer concrete follow-up questions over broad requests for “more detail”.

## Priority Rules

- `P0`: blocks design or implementation; key behavior, ownership, timing, failure handling, contract, or acceptance rule is missing or contradictory.
- `P1`: does not block kickoff, but creates major design uncertainty, integration risk, or likely rework.
- `P2`: clarity, operability, UX, or maintenance issue that should be improved but does not block work.

## Workflow

1. Read the target document and identify its goal, actors, trigger, output, and success event.
2. Choose scope:
   - `quick`: analyze only the target document
   - `standard`: add a few directly related docs or code references
   - `deep`: run the full analysis with nearby evidence from docs and code
3. Load only the relevant resources:
   - `checklist/business_closure.json`
   - `checklist/ambiguity.json`
   - `checklist/impact.json`
   - `checklist/quality_gates.json`
4. Analyze the requirement across the dimensions below.
5. Extract ranked issues, unknowns, assumptions, and follow-up questions.
6. Produce a markdown document, not just a chat response.
7. Choose output mode:
   - `gap_checklist`: default when the main result is missing information, unclear contracts, or business questions that need confirmation
   - `analysis_report`: use when the user asks for a broader assessment, architecture impact, or a narrative review
8. Use the matching template:
   - `templates/gap_checklist.md`
   - `templates/analysis_report.md`
9. If the environment supports writing files and the user did not provide `output_path`, default to a sibling markdown file next to the source document:
   - `需求缺口清单.md` for `gap_checklist`
   - `需求分析报告.md` for `analysis_report`
10. If file creation is not possible, return the complete markdown document content so it can be saved without reconstruction.

## Analysis Dimensions

### 1. Business Closure

Check whether the requirement forms a complete loop:

`input -> process -> output -> feedback`

Key questions:

- Where does the input come from?
- What exactly triggers the flow?
- What business rules, exception branches, and boundary cases apply?
- What output is produced and who consumes it?
- How are success, failure, reconciliation, and traceability confirmed?

Use `checklist/business_closure.json` to drive this pass.

### 2. Ambiguity Detection

Look for vague wording around:

- time
- quantity
- status
- subject or owner
- condition
- quality or non-functional targets

Use `checklist/ambiguity.json` for patterns and wording guidance. Do not stop at naming vague words; explain why the ambiguity matters and what decision it blocks.

### 3. Impact Analysis

Check likely impact on:

- data
- interfaces
- process
- users
- operations

Use `checklist/impact.json` to structure the analysis.

### 4. Feasibility

Check whether the requirement appears implementable within the available constraints:

- technical feasibility
- data availability
- dependency reliability
- timing, latency, and scheduling constraints

When feasibility is uncertain, explain the missing information instead of guessing.

### 5. Quality Gates

Always check whether the requirement defines enough around:

- performance or SLA
- auth, permissions, or role boundaries
- idempotency, retries, compensation, or recovery
- observability, audit, and alerting
- compatibility, migration, rollout, and rollback
- measurable acceptance criteria

Use `checklist/quality_gates.json` for prompts.

### 6. Consistency Check

If `project_root` or nearby history exists, verify whether the requirement appears consistent with:

- related historical docs
- existing interfaces and schemas
- nearby implementation constraints

Only inspect directly relevant context. Do not perform broad repository exploration.

## Evidence Rule

For each `P0` or `P1` issue, include at least:

- the document location or quoted requirement fragment
- any related code or doc reference if used
- whether the conclusion is a `fact`, `inference`, or `assumption`

When no supporting evidence exists, classify the item as an unknown instead of a hard conclusion.

## Output Contract

Every analysis must end as a markdown document artifact. Prefer creating a `.md` file when the environment allows it.

### Output Modes

#### 1. Gap Checklist

Use this mode when the main value is clarifying missing information before design or development. The document should be question-driven, easy to hand to product or business owners, and grouped by topic and priority.

Required structure:

1. Title and metadata
2. Missing-information sections grouped by topic
3. Tables with at least:
   - `编号`
   - `问题`
   - `业务方答复`
4. Priority appendix
5. Action checklist

#### 2. Analysis Report

Use this mode when the user needs a broader review with narrative explanation and impact analysis.

Every analysis report should include these sections or their logical equivalents:

1. Overview
2. Business Closure Analysis
3. Ambiguities
4. Impact Analysis
5. Feasibility
6. Consistency Check
7. Issue List by Priority
8. Follow-up Questions
9. Assumptions and Unknowns
10. Evidence Summary

At minimum, any output document must contain:

- `summary`
- `blocking_issues`
- `ambiguities`
- `impact_analysis`
- `feasibility`
- `follow_up_questions`
- `assumptions`
- `evidence`

## Judgment Notes

- A requirement can be acceptable even if low-level implementation details are missing.
- A requirement is not ready when core ownership, timing, failure handling, or acceptance logic is undefined.
- Raise contradictions and missing closure early; do not bury them under optional suggestions.
- If the highest-value result is a list of questions to unblock delivery, prefer `gap_checklist` over a long narrative report.
