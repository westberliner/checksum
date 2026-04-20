# Checksum — Nextcloud App

PHP 8.1 backend (`lib/`) + Vue 3 TypeScript frontend (`src/`).

## Stack

- Backend: PHP, Nextcloud OCP framework
- Frontend: Vue 3, TypeScript, Vite
- Tests: PHPUnit (`tests/`), Vitest (`src/**/*.spec.ts`)

## Validation

Run `npm run deploy` — it lints, type-checks, runs all tests, and builds.
This must pass before any PR is opened.

## Conventions

- New backend features: add Controller/Service in `lib/`, add PHPUnit test in `tests/`
- New frontend features: add composable in `src/composables/`, add Vitest test
- Update `Changelog.md` under `[Unreleased]` for every change
- Branch names: `enhancement/<issue-number>-<slug>`
- Commit format: `feat(#<issue-number>): <short description>`
