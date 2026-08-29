# Independent verification 4 — API Handoff Audit

**Result: PASS**

**Candidate:** `df7ed2c0cd6374f3583495bb89bfc256c2ad9516` (`docs: record repair verification`)

**Live URL:** <https://api-handoff-audit.sociobot.in>

**Verified:** 2026-08-29 UTC, from a clean checkout after `npm ci`.

## First-read and demo gate

A cold, fresh-browser visit answered the required questions in plain words:

- **What it does:** “Check an API handoff before it stalls.”
- **Who it is for:** “For small teams giving a shared API workflow to a new contributor.”
- **What to do first:** the visible primary link says “Try it with sample data,” followed by “See a complete audit with one real gap.”

The one-click demo opened `/demo`, displayed the persistent “Demo — sample data, nothing is saved” banner, showed the realistic Parcel Lane API finding, allowed “Mark documented,” and reset on reload. It wrote no local/session storage and made requests only to `https://api-handoff-audit.sociobot.in`.

## Claims gate

`.factory/claims.json` exists with 11 tagged claims. After the clean install, every claim test passed in the demo/product sandbox:

```text
npm run test:e2e -- --grep '@claim:'
11 passed (2.6m)
```

This included undocumented variables/setup, absent fixtures, Bruno/Postman/.http syntax, local/no-network audit, terminal/JSON/HTML redaction, explicit smoke/no redirect, local-vs-staging policy, exit codes and JSON stdout, temporary CLI-demo isolation, clean packaged-consumer installation, and browser demo isolation. The packaged consumer installed the `.crate`, exposed one `api-handoff-audit` binary, reported `api-handoff-audit 0.1.0`, and ran `demo --json` with the Parcel Lane sample.

## Local product and package verification

```text
npm ci                                  PASS (57 packages, 0 vulnerabilities)
npm test                                PASS — 8 Rust, 1 Vitest, 26 Playwright tests
npm run build                           PASS — target/release/api-handoff-audit and dist/site/
cargo fmt --all -- --check             PASS
cargo clippy --all-targets -- -D warnings  PASS
cargo package --allow-dirty            PASS — 16 files, 87.7 KiB (26.0 KiB compressed)
```

Manual release-binary smoke:

```text
api-handoff-audit 0.1.0
api-handoff-audit demo --json -> Parcel Lane API, 3 scanned files, VAR001, exit 0
```

The supported error path returns exit 2 with an actionable configuration error. Automated claim tests also covered exit 0 (pass), 1 (finding/failed smoke), and 2 (invalid input/configuration), as well as normal, boundary, and recovery cases.

## Live deployment, privacy, accessibility, and performance

- Fresh local and live SHA-256 values matched for `index.html`, `404.html`, `main-DZSlfOtr.js`, and `main-CyieNWfr.css`; the deployed site is the candidate build.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. An unknown route returns a real 404 with the product shell.
- The live page has `lang=en`, one `h1`, a `main`, title, image alt text, and no console or page errors. `/opt/fleet/lib/verify-url.sh` passed in 669 ms.
- Keyboard testing starts at the Skip link; Enter opens the demo. Focus is visibly styled. At 390px, all tested routes have no horizontal overflow; tested controls meet the 44px requirement.
- Live axe checks on `/`, `/demo`, `/privacy`, `/terms`, and `/404` found **zero serious or critical** violations. Reduced motion resolves transitions to `0.00001s`.
- The browser request log during landing and demo used only the product origin. No analytics, third-party scripts, fonts, storage writes, service worker, account, or server-side product endpoint exists. Rate-limit/429 verification is not applicable to this static CLI documentation deployment.
- Headers include CSP with `frame-ancestors 'none'`, `X-Content-Type-Options: nosniff`, strict referrer policy, HSTS, and permissions policy. The hashed JavaScript asset has `Cache-Control: public, max-age=31536000, immutable`.
- Gzipped initial JS is 4,236 bytes and CSS 4,062 bytes; both are well under the static budget. Self-hosted fonts total 27,992 bytes.

## Defects

No release-blocking, high, medium, or low defects found.

## Scope notes

The product is a local Rust CLI plus a static explanatory/demo site. It has no sign-in, billing, backend persistence, PWA/service worker, or API endpoint, so Entra, payment, persistence/concurrency, service-worker update/offline reload, and rate-limit allowance checks do not apply.
