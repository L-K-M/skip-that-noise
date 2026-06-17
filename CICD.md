# CI/CD

Skip that Noise is a Manifest V2 Firefox extension (Gecko, via `browser_specific_settings`) that automatically skips songs by specific artists on YouTube Music. This repository uses GitHub Actions to validate the extension on every change and to package a downloadable build whenever a version tag is pushed.

## Workflows

| Workflow | Trigger | Purpose |
| --- | --- | --- |
| `.github/workflows/ci.yml` | PRs + pushes to `main` | Lint/validate the extension |
| `.github/workflows/release.yml` | Pushing a `v*` tag | Package the extension and attach it to a GitHub Release |

## Continuous integration (`ci.yml`)

On every pull request and every push to `main`, the workflow:

1. Checks out the repository.
2. Sets up Node.js 20.
3. Runs `npx --yes web-ext lint --source-dir .` — Mozilla's [`web-ext`](https://extensionworkshop.com/documentation/develop/web-ext-command-reference/) linter validates `manifest.json` and the extension sources, flagging manifest errors and common add-on problems.

`manifest.json` lives at the repository root, so the source directory is `.`. `web-ext` is fetched on demand via `npx` (it is also listed in `package.json`, but no install step is required for linting). A `concurrency` group cancels superseded runs when a branch is pushed again.

> Note: this extension is Manifest V2. `web-ext lint` is Firefox-oriented and will surface MV2-related deprecation warnings; these are expected and do not fail the build unless they are reported as errors.

### Running locally

```bash
npx web-ext lint --source-dir .
```

## Releases (`release.yml`)

Releases are cut by pushing a version tag:

```bash
git tag v1.2.3
git push origin v1.2.3
```

The workflow runs:

```bash
npx --yes web-ext build --source-dir . --artifacts-dir web-ext-artifacts --overwrite-dest
```

This produces an **unsigned** `.zip` in `web-ext-artifacts/` (named from the extension's name and version, e.g. `skip_that_noise-1.0.1.zip`). That `.zip` is attached to a new GitHub Release created via [`softprops/action-gh-release`](https://github.com/softprops/action-gh-release), with auto-generated release notes.

The artifact is suitable for self-distribution or temporary installation. To load it in Firefox, open `about:debugging` → **This Firefox** → **Load Temporary Add-on…** and select the `.zip` (or the unzipped `manifest.json`).

## Secrets

No secrets are required. Both workflows run entirely with the default `GITHUB_TOKEN`; `release.yml` requests `contents: write` so it can create releases.

Store publishing is out of scope. As a future option, a signed Firefox `.xpi` (for permanent installation / AMO listing) would require [Mozilla Add-ons (AMO) API credentials](https://addons.mozilla.org/developers/addon/api/key/) used with `web-ext sign --api-key … --api-secret …`, supplied as repository secrets.
