# Tibyan — Documentation

Index of all human-readable documentation for the Tibyan project. Source-of-truth for *intent* lives here; source-of-truth for *behavior* lives in the code under `../backend/` and `../frontend/`.

## Top-level

- [`architecture.md`](architecture.md) — what lives where in the codebase: layers, models, services, API surface, frontend routing.
- [`api.md`](api.md) — API reference summary with pointers to FastAPI's auto-generated Swagger UI.
- [`data-entry-guide.md`](data-entry-guide.md) — operator-facing guide for daily data entry (water quality, feeding, mortality, sampling).

## Specs (`specs/`)

Canonical product and feature specifications. Treat these as the source of truth for *intended* behavior.

- [`specs/requirements.md`](specs/requirements.md) — fish-lifecycle-management feature requirements (mirrored from `.kiro/`).
- [`specs/design.md`](specs/design.md) — design notes for the lifecycle feature.
- [`specs/tasks.md`](specs/tasks.md) — phase-by-phase task list with current completion status.
- [`specs/tibyan-requirements-analysis.md`](specs/tibyan-requirements-analysis.md) — top-level product requirements analysis.
- [`specs/tibyan-requirements-vibecode.json`](specs/tibyan-requirements-vibecode.json) — bilingual machine-readable requirements blob.
- [`specs/tibyan-product-requirements.xlsx`](specs/tibyan-product-requirements.xlsx) — original product-requirements template.
- [`specs/update-summary-ar.md`](specs/update-summary-ar.md) — Arabic-language update summary (originally `ملخص_التحديثات.md`).

## Status (`status/`)

Curated current-state documents. These are the docs to read for "where is this project right now?"

- [`status/reality-check.md`](status/reality-check.md) — honest current state.
- [`status/completion-analysis.md`](status/completion-analysis.md) — requirement-by-requirement completion breakdown.
- [`status/roadmap.md`](status/roadmap.md) — work remaining to reach 100 % of the spec.
- [`status/verification-report.md`](status/verification-report.md) — verification checklist results.
- [`status/features.md`](status/features.md) — features inventory.

## Archive (`archive/`)

Historical progress notes accumulated during development. Many overlap or contradict each other; do not treat them as authoritative. Kept for traceability and grep-ability — start with `status/` instead.
