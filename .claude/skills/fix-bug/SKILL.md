---
name: fix-bug
description: Draft a first-pass fix for a bug issue and open a PR. Triggered by the claude-bug workflow when an issue is labeled `bug`. Reads CLAUDE.md, forms one hypothesis, writes a regression test, validates with the project's test runners, and opens a PR for human takeover.
---

# Fix Bug

You are drafting a fix for a bug in this repo. The goal is a **first-pass PR a human can take over** — not a verified, shipped fix.

## How to work

1. **Orient.** Read `CLAUDE.md` and locate the area of the codebase the bug touches.
2. **One hypothesis.** Form the single most likely root-cause hypothesis and commit to it. Do not explore alternatives. Do not paper over symptoms.
3. **Write a regression test first.** Pin down the bug with a failing test before you fix anything:
   - Backend: PHPUnit test in `tests/`
   - Frontend: Vitest spec next to the source (`*.spec.ts`)
   - If you cannot write a meaningful test (e.g. the bug is in build config or templating), say so explicitly in the PR body.
4. **Minimal fix.** Apply the smallest change that makes the regression test pass under your hypothesis.
   - Backend changes go in `lib/`.
   - Frontend changes go in `src/`.
5. **Update `Changelog.md`** under `[Unreleased]`.

## Validation (deps are pre-installed by the workflow)

Run these directly — do **not** run `npm run deploy`:

- `composer test:unit` — confirm the new regression test passes and nothing else regressed
- `composer psalm`
- `npm run type-check`
- `npm run test`
- `composer cs:check` (use `composer cs:fix` to auto-fix)
- `npm run lint` (use `npm run lint:fix` to auto-fix)

If a check was already failing on `master` before your changes, leave it and note it in the PR.

## Finishing

Open the PR even if unverified or some checks still fail. The PR **must carry the `bug` label** (the release-prep workflow uses it to decide a patch-version bump). When using `gh pr create`, pass `--label bug`.

In the PR body, include:

- **Hypothesis:** the root cause you committed to
- **Test:** how the regression test pins down the bug (or why you couldn't write one)
- **Fix:** what the minimal change does
- **What I should double-check:** anything the human should verify
- `Closes #<issue-number>`
