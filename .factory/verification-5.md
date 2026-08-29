# Independent verification 5 — PASS

**Candidate:** `96e988c3c51b72684f1bbb8e5b3adb531b7517ed`

**Verified URL:** <https://api-handoff-audit.sociobot.in>

**Date:** 2026-08-29 UTC

**Verdict:** **PASS — release candidate accepted**

Verification began from a clean `main` checkout at the exact candidate commit.
The live deployment is not stale: all 18 deployable files compared byte for
byte with the fresh production build, including each route document, hashed
JS/CSS/map, font, image, icon, `robots.txt`, and `sitemap.xml`.

## Mandatory first-read and demo gate

A cold live visit passes the five-second test:

- **What it does:** “Check an API repository before handoff.”
- **Who it is for:** “For teams giving a shared API workflow to a new contributor.”
- **What to click first:** “Try it with sample data,” alongside “See the sample report and its one finding.”

The primary action is visible in the initial desktop and 390 px viewports and
opens `/demo?demo=1` in one click. The resulting screen already contains the
Parcel Lane report, one `WAREHOUSE_ID` finding, its source file, and the next
configuration step. Evidence is under `.factory/evidence/verification-5/`.

## Mandatory claims gate

`.factory/claims.json` exists. After `npm ci`, every listed command was run
individually through the product/demo entry points. All 13 passed:

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `repo-gaps` | PASS | Found both `SETUP001` and undocumented `WAREHOUSE_ID`. |
| `absent-fixtures` | PASS | Found missing configured `fixtures/order.json`. |
| `workspace-formats` | PASS | Found variables in Bruno, Postman, and `.http` sources using all documented reference forms. |
| `local-free-audit` | PASS | Local audit completed while loopback HTTP/HTTPS proxies received zero requests. |
| `redacted-reports` | PASS | Variable and response-body sentinels were absent from terminal, JSON, and HTML reports. |
| `explicit-smoke` | PASS | Exactly one named request ran and the redirect destination received zero requests. |
| `target-policy` | PASS | HTTP and HTTPS local targets were accepted; HTTP staging was rejected. |
| `exit-codes` | PASS | Pass, finding/failed smoke, and invalid input returned 0, 1, and 2; JSON stdout parsed. |
| `cli-demo-isolation` | PASS | Demo report was written under a new OS temporary directory; the working repository was unchanged. |
| `package-install` | PASS | Packaged crate installed outside the checkout; help, version `0.1.0`, and `demo --json` worked. |
| `build-artifacts` | PASS | Clean build produced the release binary and `dist/site/index.html`. |
| `sample-report-content` | PASS | CLI and browser agreed on 3 files, 2 setup steps, 1 fixture, 2 smoke requests, and `VAR001`. |
| `demo-sandbox` | PASS | Browser demo reset on reload, stored no browser data, and made only same-origin requests. |

The landing page, legal pages, demo copy, and README were cross-checked against
the claim inventory. No unsupported or unlisted user-facing claim was found.

## Clean build, tests, and package

```text
npm ci                                      PASS — 57 packages, 0 vulnerabilities
npm test                                    PASS — 8 Rust, 1 Vitest, 30 Playwright tests
cargo fmt --all -- --check                  PASS
cargo clippy --all-targets -- -D warnings   PASS
npm run build                               PASS — release CLI and dist/site/
cargo package --allow-dirty                 PASS — 16 files, 87.5 KiB / 25.9 KiB compressed
```

The clean-consumer claim performed a real `cargo package`, extracted the
`.crate`, installed it under a fresh root, and exercised the installed public
binary. The manifest exposes the single `api-handoff-audit` binary.

## Independent CLI exercise

A separate temporary repository and two loopback servers exercised the release
binary beyond the project assertions. The normal case sent one POST to
`/orders/42` with substituted authorization and JSON body, accepted HTTP 201,
returned exit 0, and emitted one parseable JSON report. Neither the secret nor
the response-body sentinel appeared in stdout or the persisted report.

Boundary and recovery behavior was correct:

- a 302 redirect, HTTP 500, and a one-second timeout returned report status
  `FAIL` and exit 1; the redirect destination received zero requests;
- an off-target resolved URL, unknown smoke name, HTTP staging target,
  timeouts 0 and 301, malformed environment file, and missing repository
  returned exit 2 with specific recovery text;
- `--help` and `--version` were non-interactive; version was `0.1.0`;
- the bundled demo created its HTML report under `/tmp`, reported the expected
  Parcel Lane counts and finding, and did not write into the checkout;
- the generated HTML report had a title, `lang=en`, one `h1`, one `main`, no
  overflow at 390 px, no console/page errors, and zero serious/critical axe
  findings.

## Live UI, accessibility, privacy, and routing

- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns
  a real 404 with the complete product shell and a route back.
- Desktop 1440×900 and mobile 390×844 checks found one `h1`, one `main`, valid
  route titles/canonicals, no missing image alt, no horizontal overflow, no
  request failures, and zero serious/critical axe findings. Product routes had
  no console or page errors. The browser's expected failed-resource message
  appears only when deliberately loading the HTTP 404 document.
- Every measured visible control is at least 44 px high and wide. Keyboard
  traversal starts at the skip link; all focus samples use a visible 3 px cyan
  outline. Enter opens the demo, Space activates its correction action, the
  horizontally scrollable terminal is focusable, and route/history changes
  move focus to the new `h1` without a trap.
- Reduced-motion mode collapses animation and transition durations to
  `0.00001s`; nothing loops.
- The complete demo correction/reset/reload flow kept the sticky “Demo — sample
  data, nothing is saved” banner visible. `localStorage`, `sessionStorage`, and
  IndexedDB remained empty. All 10 requests stayed on
  `https://api-handoff-audit.sociobot.in`.
- All navigable internal and Param Factory links returned 200; email links are
  explicit. The live site has no analytics, third-party script/font, sign-in,
  billing call, service worker, or product backend.

The response headers include a self-only CSP with `frame-ancestors 'none'`,
HSTS, `nosniff`, strict-origin referrer policy, and a camera/microphone/location
permissions policy. Documents use a 30-second revalidating cache. Hashed JS,
CSS, fonts, and images use `public, max-age=31536000, immutable`; an ETag
conditional request returned 304.

The product is a local CLI with a static documentation/demo site. It has no
server-side product or unlock endpoint, sign-in, persistence backend, or PWA.
Rate-limit/429, Entra authority, backend concurrency/persistence, and service
worker update/offline checks are therefore not applicable.

## Performance

Lighthouse 13.4.1 mobile against the live URL scored 100 for performance,
accessibility, best practices, and SEO. FCP was 0.78 s, LCP 1.30 s, total
blocking time 18 ms, CLS 0, speed index 1.75 s, and total transfer 82,393
bytes. Lab INP was not available because the page has no sampled interaction.

Fresh build budgets pass: JS is 11,998 bytes raw / 4,442 bytes gzip; CSS is
15,514 bytes raw / 4,150 bytes gzip; both self-hosted fonts total 27,992 bytes;
the mobile hero is 43,672 bytes and desktop hero is 107,972 bytes.

## Defects

No release-blocking, high, medium, or low product defects were found.
