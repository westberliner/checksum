---
name: prepare-release
description: Prepare a release PR after a bug or enhancement PR merges. Bumps the version (patch for bug, minor for enhancement), updates every file that carries the version, rewrites Changelog.md, and opens a "Release vX.Y.Z" PR. Triggered by the claude-release-prep workflow.
---

# Prepare Release

You are preparing a release PR. A `bug` or `enhancement` PR just merged into `master` and the workflow has handed you the merged PR's metadata (number, title, body, label, merge SHA).

The goal: open a **release PR** that bumps the version everywhere, updates the changelog, and is ready for human review. Do NOT tag or publish — a separate workflow handles that after this PR merges.

## Inputs (from the workflow prompt)

- Merged PR number
- Merged PR title
- Merged PR body (contains the "Done" / "Fix" sections you wrote earlier)
- Label: `bug` or `enhancement`

## Step 1 — Determine the new version

Read the current version from `package.json` (`.version` field). It's the canonical source; `appinfo/info.xml` should match.

Apply semver based on the label:

- `bug` → bump **patch** (`2.1.1` → `2.1.2`)
- `enhancement` → bump **minor**, reset patch (`2.1.1` → `2.2.0`)

If the merged PR is missing both labels, abort with a clear error in the PR comment and stop.

## Step 2 — Update version in every file

These files all carry the version. Update them all to the new version:

- `package.json` — `.version` field
- `package-lock.json` — top-level `.version` field (and the root package entry under `.packages[""]`). Do not regenerate the lockfile; just edit these two fields.
- `appinfo/info.xml` — `<version>X.Y.Z</version>` element

After editing, grep the repo for the **old** version string to make sure nothing else references it:

```bash
git grep -F "<OLD_VERSION>" -- ':!vendor' ':!node_modules' ':!js'
```

If anything turns up that looks like a version reference, update it too. Skip matches in `Changelog.md` (those are history) and any baseline/build files.

## Step 3 — Rewrite `Changelog.md`

The file uses `**X.Y.Z**` headers (not standard markdown headings).

1. Find the very top of the file — there may be an `[Unreleased]` section (per CLAUDE.md convention) holding entries from the merged PR.
2. Replace that section header with `**<NEW_VERSION>**`.
3. If there is no `[Unreleased]` section, derive a short bullet list from the merged PR's title and body and insert a new `**<NEW_VERSION>**` block at the top (after the `# Changelog` heading).
4. Keep entries terse and user-facing — one bullet per change. Imperative voice ("Add X", "Fix Y").
5. Leave the rest of the file untouched.

## Step 4 — Branch, commit, and open the release PR

- Branch: `release/v<NEW_VERSION>`
- Commit message: `chore(release): v<NEW_VERSION>`
- PR title: `Release v<NEW_VERSION>`
- PR body:

  ```
  Release v<NEW_VERSION>

  Triggered by #<MERGED_PR_NUMBER> (<label>).

  ## Changelog

  <copy the new `**<NEW_VERSION>**` block from Changelog.md, bullets only>

  ---
  When this PR merges, the publish workflow will tag `v<NEW_VERSION>`,
  build the tar.gz, and create the GitHub Release.
  ```

- Label the PR `release` so the publish workflow can pick it up.

Use `gh pr create --label release` and reference the merged PR for traceability.

## What NOT to do

- Do **not** create the git tag.
- Do **not** run `npm run deploy` or build the tar.gz.
- Do **not** create the GitHub Release.
- Do **not** push to `master` directly.

All of the above happen in the publish workflow after this PR merges.
