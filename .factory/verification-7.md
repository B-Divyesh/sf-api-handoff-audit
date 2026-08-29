# Independent verification 7 — API Handoff Audit

**Result: PASS**

**Candidate commit:** `f9e54a7715ca5af208da2e4828b1a69d72b485d4`  
**Live URL:** <https://api-handoff-audit.sociobot.in/>  
**Verified:** 2026-08-29 (fresh `npm ci` in this checkout)

## First-read and demo gate

Cold-loading the live landing page answered the three required questions in
plain words:

- **What:** “Check an API repository before handoff.”
- **For whom:** “For teams giving a shared API workflow to a new contributor.”
- **First action:** “Try it with sample data,” with the adjacent explanation
  “See the sample report and its one finding.”

The action is available on the first screen. It leads to the bundled Parcel
Lane report, including its `WAREHOUSE_ID` handoff finding. Direct
`/demo?demo=1` works and its correction/reset flow is explicitly labelled as
recorded output rather than a real repository edit.

## Mandatory claim tests

All 14 literal test commands from `.factory/claims.json` were run separately
from this clean checkout via `npm run test:e2e -- --grep @claim:<id>`. Every
one passed:

| Claim id | Result |
| --- | --- |
| `repo-gaps` | PASS |
| `absent-fixtures` | PASS |
| `workspace-formats` | PASS |
| `local-free-audit` | PASS |
| `env-file` | PASS |
| `redacted-reports` | PASS |
| `explicit-smoke` | PASS |
| `target-policy` | PASS |
| `exit-codes` | PASS |
| `cli-demo-isolation` | PASS |
| `package-install` | PASS |
| `build-artifacts` | PASS |
| `sample-report-content` | PASS |
| `demo-sandbox` | PASS |

The longest clean-consumer checks also passed: `package-install` in 2.8m and
`build-artifacts` in 2.7m. Their logs are retained in
`/tmp/api-handoff-audit-claim-logs/` for this verification container.

## Local build, package, and CLI verification

- `npm ci`: PASS, 0 vulnerabilities reported.
- `npm test`: PASS — TypeScript check, 8 Rust tests, 1 Vitest test, and 31
  Playwright tests; Playwright records `{"status":"passed","failedTests":[]}`.
- `npm run build`: PASS — release binary and `dist/site/` generated.
- `cargo clippy --all-targets -- -D warnings`: PASS.
- `cargo package --allow-dirty`: PASS.
- The clean packaged-consumer claim installed the crate into an isolated Cargo
  root and exercised `--help`, `--version`, and `demo --json`.

Independent release-binary smoke checks found `api-handoff-audit 0.1.0` with
useful help text. `demo --json` exited 0 and produced the Parcel Lane
`VAR001` report in a new temp directory; `audit examples/parcel-lane --json`
exited 1 for findings; a nonexistent repository exited 2 with a concrete
configuration-recovery message. This covers normal, finding, and invalid
input paths without modifying a repository.

## Live deployment, privacy, accessibility, and performance

The freshly built candidate and deployment match byte-for-byte:

| Artifact | SHA-256 |
| --- | --- |
| `index.html` | `02f609737bd59104c3ebabf8ecf0b3fde497928406942291a1e7834986b5d837` |
| `demo.html` | `a8ce9a59cc368935768303d199d8fb515b69bec43fd25d5f7d9b292d5fd144e7` |
| `main-CGrZMT8N.js` | `9366b1ec758bfdf51c6311c4c1bbfee80b9ffc975618024062379fde8aacad43` |
| `main-CGF-YAlt.css` | `7a722ef6cf437f6c06f748fdef59869f08c11b6b69a9631e122802619947d38d` |

`verify-url.sh` passed cold live checks for `/`, `/demo?demo=1`, `/privacy`,
and `/terms`: HTTP 200, route-specific titles, `lang=en`, one `h1`, `main`,
and no console errors. `/missing-stall` returns a genuine HTTP 404.

Fresh Playwright/Axe scans of all four routes at 1440px and 390px found zero
serious or critical violations and zero console/page errors. At 390px each
route had `scrollWidth === clientWidth === 390`; the sticky demo banner stayed
visible at the bottom. Keyboard tab traversal reached the skip link, navigation,
primary demo action, replay control, and footer links, with a visible 3px cyan
focus outline. A `prefers-reduced-motion: reduce` context was active and the
page started no animations.

During the complete live demo correction/reset flow, the outgoing-request log
contained only `https://api-handoff-audit.sociobot.in` document/assets. It had
no localStorage, sessionStorage, IndexedDB, or Cache Storage entries; OPFS was
available but no product data was written. The static product contains no
server-side product endpoint, account flow, unlock call, service worker, or
backend persistence boundary, so a server request allowance / 429 test does
not apply.

Response headers include HSTS, `X-Content-Type-Options: nosniff`, strict-origin
referrer policy, permissions policy, and a self-only CSP with
`frame-ancestors 'none'`. The hashed JavaScript asset returns
`Cache-Control: public, max-age=31536000, immutable`; the document uses a
short 30-second revalidation cache. Initial JS is 11,954 bytes raw (4,420
bytes gzip) and CSS is 15,514 bytes raw (4,160 bytes gzip), well below budget.

Mobile Lighthouse scored 100 Performance and 100 Accessibility with LCP
1,355.5ms, CLS 0, and TBT 12ms. Lighthouse emitted a post-audit Chrome-target
crash warning while collecting its full-page screenshot, but wrote the complete
result; it is not reproduced by the live Playwright load/error checks.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Scope notes

The product is a local-first CLI with a static explanatory/demo site. It meets
the brief’s core job: scan supported API-workspace files for handoff gaps, run
only named smoke requests against configured local/staging targets, and emit
redacted terminal/JSON/HTML reports. No product code was changed during this
verification.
