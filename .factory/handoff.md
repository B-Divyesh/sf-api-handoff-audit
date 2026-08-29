# API Handoff Audit — independent QA handoff

**Verdict:** **FAIL — do not release**

**Candidate:** `ef1c59b4e5f7b2e7187fa5c952d9e1645fefa4ff`

**URL:** <https://api-handoff-audit.sociobot.in>

**Verified:** 2026-08-29 UTC

**Artifact:** Rust CLI plus static Vite documentation/demo site

The core CLI, packaged consumer, generated HTML report, and live demo work.
All six commands currently listed in `.factory/claims.json` pass. Release is
blocked because the claim inventory and claim proof are incomplete, and the
live 404 behavior does not meet the route contract. Full evidence is in
`.factory/verification-3.md`.

## Release blockers

### High — claims are not fully registered or proven

The `repo-gaps` claim promises undocumented-variable and setup-gap detection,
but its tagged test asserts only the undocumented `WAREHOUSE_ID`. The sample
has two setup steps, so the test cannot detect a setup-gap regression. README
promises such as absent-fixture detection and exact exit codes also have no
entry in `.factory/claims.json`. The supplied claims policy makes this a failed
review even though related untagged tests and manual checks pass.

### Medium — 404 routes are inconsistent

An unknown URL returns HTTP 200 with the client 404 view. Direct `/404` also
returns 200 but serves a separate minimal HTML file without the standard
header, footer, skip link, canonical, route description, or build ID. In-app
and direct navigation therefore render different route shells.

## Passing evidence

- First-read gate passes with the audience, job, and one-click sample action in
  the cold first viewport.
- `npm ci`, `npm test`, `npm run build`, `cargo fmt --all -- --check`, strict
  Clippy, and `cargo package --allow-dirty` pass.
- `npm test` covers 8 Rust, 1 Vitest, and 21 Playwright tests.
- A separately extracted and installed crate runs `--help`, `--version`, and a
  parseable `demo --json`.
- Independent loopback POST returns a passing 201 report; secret and response
  body sentinels remain absent. Invalid input returns actionable exit-2 errors.
- Live HTML, JS, CSS, art, robots, sitemap, and 404 files match the candidate
  build byte-for-byte.
- Desktop and 390 px routes have no serious/critical axe findings, console or
  page errors, overflow, missing alt text, or sub-44px controls.
- Demo reset/reload/storage/privacy, keyboard, focus, reduced motion, CSP,
  security headers, and immutable hashed-asset caching pass.
- Mobile Lighthouse: 99 performance, 100 accessibility, 100 best practices,
  100 SEO; LCP 1.4 s, TBT 150 ms, CLS 0.

## Scope and next steps

This static product has no backend, product-unlock endpoint, sign-in, service
worker, or offline claim, so rate-limit, persistence/concurrency, Entra, and
PWA checks are not applicable. No checkout is advertised.

Before re-verification:

1. Audit every landing and README claim into `.factory/claims.json`; make each
   exact tagged test prove the complete observable promise from a clean demo.
2. Return a real HTTP 404 for unknown URLs and make direct `/404` use the same
   accessible site shell as client navigation.
3. Re-run all claim commands, full tests/build, clean package install, live
   deployment hashes, browser privacy/accessibility checks, and Lighthouse.
