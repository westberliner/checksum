---
name: implement-enhancement
description: Draft a first-pass implementation of an enhancement issue and open a PR. Triggered by the claude-enhancement workflow when an issue is labeled `enhancement`. Reads CLAUDE.md, picks one approach, writes tests where reasonable, validates with the project's test runners, and opens a PR for human takeover.
---

# Implement Enhancement

You are implementing an enhancement issue in this repo. The goal is a **first-pass PR a human can take over** — not a finished, polished feature.

## How to work

1. **Orient.** Read `CLAUDE.md` and skim the relevant area of the codebase before editing.
2. **Commit to one approach.** Make a single best-guess decision about the design and stick with it. Do not explore alternatives.
3. **Minimum surface area.** Touch the fewest files needed to express the idea.
   - Backend changes go in `lib/` (Controller/Service pattern).
   - Frontend changes go in `src/` (composable in `src/composables/` for new logic).
4. **Write tests where reasonable.** If the change has clear inputs/outputs, add a test:
   - Backend: PHPUnit test in `tests/`
   - Frontend: Vitest spec next to the source (`*.spec.ts`)
   - Skip tests only if the change is purely structural (e.g. a template tweak) — note this in the PR body.
5. **Update `Changelog.md`** under `[Unreleased]`.

## Validation (deps are pre-installed by the workflow)

Run these directly — do **not** run `npm run deploy` (it packages a release tarball, which CI does not need):

- `composer test:unit` — PHP unit tests
- `composer psalm` — PHP static analysis
- `npm run type-check` — TypeScript
- `npm run test` — Vitest
- `composer cs:check` (use `composer cs:fix` to auto-fix)
- `npm run lint` (use `npm run lint:fix` to auto-fix)

Fix issues you introduced. If a check was already failing on `master` before your changes, leave it and note it in the PR.

## Finishing

Open the PR even if some checks still fail — the human will take over. The PR **must carry the `enhancement` label** (the release-prep workflow uses it to decide a minor-version bump). When using `gh pr create`, pass `--label enhancement`.

In the PR body, include:

- **Assumption:** the one design decision you committed to
- **Done:** what's working
- **Skipped / open questions:** anything the human should verify or decide
- `Closes #<issue-number>`
