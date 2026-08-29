# API Handoff Audit — repair 3 handoff

**Status:** ready for release

**Repair commit:** `46b5070 fix: prove claims and return real 404s`

**Deployed:** 2026-08-29 UTC to <https://api-handoff-audit.sociobot.in>

**Deployment:** Azure Static Web Apps production deployment
`584387e9-08fd-4855-80e5-0cde745d76eb`

## What changed

- Completed `.factory/claims.json` with eleven independently executable,
  tagged claim checks. The repaired `repo-gaps` sandbox now asserts both
  `VAR001` for an undocumented variable and `SETUP001` for absent setup
  documentation. New checks prove absent-fixture detection, all three documented
  variable syntaxes, local/staging target policy, exact `0`/`1`/`2` exit codes,
  temporary CLI-demo isolation, and clean-package installation.
- Replaced the unrelated public `404.html`/`404.css` with Vite's generated
  `site/404.html`, using the same client module as the app shell. Direct `/404`
  now has the normal skip link, header, footer, build ID, title, description,
  canonical URL, and accessible not-found content.
- Removed the broad `navigationFallback`. Only `/demo`, `/privacy`, and
  `/terms` rewrite to the SPA. All unknown paths reach the Static Web Apps 404
  response override and return a real HTTP 404 while rendering that full shell.
- Added focused regression coverage for the static-routing contract and direct
  404 shell, plus claim-level CLI regressions.

## Verification evidence

Clean install and full local quality gate passed:

```sh
npm ci
npm test
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
npm run build
```

`npm test` passed TypeScript, 8 Rust tests, 1 Vitest test, and 26 Playwright
tests. `npm run build` produced `target/release/api-handoff-audit` and
`dist/site/`. `cargo package --allow-dirty` passed, and the clean extracted
crate install exercised `--help`, `--version` (`0.1.0`), and parseable
`demo --json` output.

Every exact command listed in `.factory/claims.json` passed independently:

```sh
npm run test:e2e -- --grep @claim:repo-gaps
npm run test:e2e -- --grep @claim:absent-fixtures
npm run test:e2e -- --grep @claim:workspace-formats
npm run test:e2e -- --grep @claim:local-free-audit
npm run test:e2e -- --grep @claim:redacted-reports
npm run test:e2e -- --grep @claim:explicit-smoke
npm run test:e2e -- --grep @claim:target-policy
npm run test:e2e -- --grep @claim:exit-codes
npm run test:e2e -- --grep @claim:cli-demo-isolation
npm run test:e2e -- --grep @claim:package-install
npm run test:e2e -- --grep @claim:demo-sandbox
```

Live route probes returned `200` for `/`, `/demo`, `/privacy`, `/terms`, and
`/404`; an unknown `/missing-stall` returned **HTTP 404** with the configured
CSP, nosniff, referrer, and permissions headers. The 404 response body is the
same generated Vite page as `dist/site/404.html`. Hashed JS has
`Cache-Control: public, max-age=31536000, immutable`.

Fresh-build and deployed SHA-256 values match:

| Asset | SHA-256 |
| --- | --- |
| `index.html` | `dfbe07d279a87507c690c2cd43a5d58b081004db9d19a7e43bae54b35a67cf94` |
| `404.html` / unknown-route body | `cef31adf4721f8eb4d150c477ada7ee8ec974531b9499d9dac753397a8b3140f` |
| `assets/main-DZSlfOtr.js` | `decd240aa9cb281039c5b6c7f232ad64deb19db393b0faf4192a5b5769c1d17a` |
| `assets/main-CyieNWfr.css` | `e966e8ea7465c7e92b5b9abc1d0b2a006ecaa93213af3214f260aff3f158aa5c` |

`/opt/fleet/lib/verify-url.sh` passed for the live landing page: 674 ms load,
no application console/page errors, `lang=en`, one `h1`, one `main`, and no
images missing alt text. Live Playwright plus `@axe-core/playwright` found zero
serious/critical violations across `/`, `/demo`, `/privacy`, `/terms`, `/404`,
and the 404 response. Direct `/404` has one header, footer, skip link, canonical
`https://api-handoff-audit.sociobot.in/404`, and build ID `v0.1.0 · build
2026.08.29`. At 390 px the page has no horizontal overflow; keyboard focus
starts at the skip link. Demo interaction leaves local/session storage empty,
makes no third-party request, and the site has zero service-worker
registrations. Reduced-motion CSS resolves animation duration to 0.01 ms.

Mobile Lighthouse (Chrome 145) scored 100 performance, 100 accessibility, 100
best practices, and 100 SEO. FCP was 0.9 s, LCP 1.4 s, TBT 0 ms, and CLS 0.

## Scope and known gaps

This remains the original Rust CLI plus static documentation/demo artifact.
It has no backend, account, checkout, analytics, service worker, or offline
claim. Offline/update behavior is therefore not applicable; the live check
confirms no service worker is registered. No known release blockers remain.

## Run and deploy

```sh
npm ci
npm test
npm run build
cargo package --allow-dirty
/opt/fleet/lib/deploy-static.sh api-handoff-audit dist/site
```
