# Independent verification 2 — FAIL

**Candidate:** `c39439484680cf1ee2e9c6ac0744b40808386ef4`
**Verified URL:** <https://api-handoff-audit.sociobot.in>
**Date:** 2026-08-29 UTC
**Verdict:** **FAIL — do not release**

The live JavaScript and CSS are byte-for-byte identical to a fresh build of the
candidate (`index-DLdF1avz.js` SHA-256
`c5dbb6ae1764d4e7c9b756061aa143842d98ecbbdff5ed63bb52e0ccbb07ddd1`;
CSS SHA-256 `0b8b2d250325e25bdbfe3c93eb11f2543d9a04cc445a0784b1649db24964bf6c`).
This is a verification of the deployed candidate, not a stale deployment.

## First-read test

**Pass.** A cold desktop page says “Check an API handoff before it stalls,”
identifies “small teams giving a shared API workflow to a new contributor,”
and makes “Try it with sample data” the clear first action. Its adjacent copy
states that the click shows a complete audit with one real gap. The action
opens `/demo` in one click.

## Mandatory claim-test gate

Started from this clean checkout with `npm ci`, then ran every exact command
listed in `.factory/claims.json`.

| Claim | Command result | Evidence |
| --- | --- | --- |
| `repo-gaps` | pass on rerun; initial cold run exceeded Playwright's 30 s test timeout while its `beforeAll` built the Rust binary | Sample demo reported `WAREHOUSE_ID` and `requests/create-order.http`. |
| `workspace-formats` | pass | One Bruno, Postman, and `.http` source each scanned. |
| `local-free-audit` | pass | Loopback HTTP/HTTPS proxy saw zero requests. |
| `redacted-reports` | pass | Known sentinel absent from terminal, JSON, and HTML reports. |
| `explicit-smoke` | **FAIL** | `report.smoke_result.status` is `undefined`; the report emits `passed: true` instead. The declared claim test fails at `tests/claims.spec.ts:137`. |
| `demo-sandbox` | pass | In-memory demo resets on reload, has no localStorage, and made only same-origin requests. |
| `ci-pack` | pass | Recorded valid verdict revealed the workflow and two presets. |
| `license-cache` | pass | Fresh cached verdict made zero verification requests. |

The claim policy makes any failing declared test release-blocking. The initial
cold timeout is additionally a clean-checkout reliability problem, although
the rerun passed once Cargo artifacts existed.

## Local build, test, and CLI checks

- `npm test`: **FAIL**. TypeScript check passed, 8 Rust tests passed, and 2
  Vitest tests passed. The 22-test Playwright phase had two failures:
  `@claim:explicit-smoke`, above, and `a clean packaged consumer can parse
  demo --json stdout`, which hit its 30-second Playwright timeout while
  `cargo install` was still compiling. The test also left child `cargo install`
  processes running after timing out.
- `npm run build`: pass. It produced `target/release/api-handoff-audit` and
  `dist/site/`; initial site JS is 16.92 kB raw / 6.25 kB gzip and CSS is
  14.47 kB raw / 4.01 kB gzip.
- `cargo clippy --all-targets -- -D warnings`: pass.
- `cargo package --allow-dirty`: pass; 16 files, 87.6 KiB (25.9 KiB compressed).
- Independent clean consumer: unpacked that crate into a new temporary
  directory, ran `cargo install --path ... --root ...`, then ran `--help` and
  `demo --json`. Installation completed successfully; stdout parsed as one
  JSON value for `Parcel Lane API` with `VAR001`, while demo status/report path
  were correctly on stderr.
- Manual normal smoke case: a temporary loopback target returned 200; `run
  --target local --smoke health --json` exited 0 with `actual_status: 200` and
  `passed: true`, without exposing the supplied secret. Missing `--target` /
  `--smoke` and `--timeout-seconds 0` exited 2 with actionable errors.

## Live product checks

- `/`, `/demo`, `/ci-pack`, `/privacy`, `/terms`, `/404`, `/404.html`,
  `robots.txt`, `sitemap.xml`, and an unknown SPA route returned 200.
- Desktop and 390 × 844 mobile: no page/console errors, zero horizontal
  overflow, no serious/critical axe violations, one `h1` and `main`, a working
  skip link with a visible cyan 3 px focus ring, and reduced-motion durations
  of `0.00001s`.
- `/demo` showed its persistent banner; Mark documented changed only in
  memory, Reset restored the gap, reload restored sample state, and
  `localStorage` remained empty. Request logs during the complete demo flow
  contained only same-origin document, self-hosted font, JS, CSS, and art
  requests.
- The invalid-license recovery made exactly one documented external request,
  to `https://api.sociobot.in/.../verify`, and displayed “This license is not
  active. Buy the CI Pack.” No sign-in is present.
- Headers: document has CSP with `frame-ancestors 'none'`, HSTS, nosniff,
  referrer policy, permissions policy, and a short document cache. Hashed JS
  and CSS return `Cache-Control: public, max-age=31536000, immutable`.
- Product-unlock allowance: 35 sequential invalid verification requests from
  one client yielded **30 × 200 then 5 × 429**. The first 429 included
  `Retry-After: 4` (and `x-ratelimit-after: 4`), so the observed allowance is
  30 requests per current rate window.

## Release-blocking defects

### High — declared `explicit-smoke` claim test fails

The exact required command `npm run test:e2e -- --grep @claim:explicit-smoke`
fails. The actual smoke behavior reaches only the named loopback request and
does not follow its redirect, but the JSON report's observable shape does not
match the test (`passed` is supplied instead of the asserted `status`). Repair
the report/test contract and make the declared claim pass from a cold clone.

### High — `npm test` does not pass; clean consumer regression timeout

The repository quality gate fails because the packaged-consumer test allows
only 30 seconds for a fresh `cargo install`, which takes longer in a clean
consumer. The subprocess survives test timeout, contaminating subsequent
tests. The independently installed package works, but a passing product is not
enough: the required project test command must pass from a clean checkout.

### High — live $39 CI Pack checkout is a dead link

The landing and `/ci-pack` purchase link points to the documented Sociobot
checkout endpoint, but `curl -L
https://api.sociobot.in/api/v1/products/api-handoff-audit/checkout` returns
**HTTP 404**. A visitor cannot buy the advertised one-time CI Pack. Register
the live product/checkout or remove the paid offer until it is available.

### Medium — mobile touch targets do not meet the factory's 44 px rule

At 390 px, the wordmark is 127 × 22 px, header links are 28–49 × 19 px, and
footer links are as small as 40 × 17 px. These are keyboard-operable and axe
does not classify them as serious, but they violate the explicit 44 × 44 CSS
px touch-target acceptance requirement.

### Medium — response-body privacy promise has no claim entry/test

The landing promises HTML/JSON/terminal output “without variable values or
response bodies.” `redacted-reports` tests only supplied variable values; no
entry in `.factory/claims.json` tests the response-body portion. The claims
contract requires every visitor-facing promise to have an observable demo
test. Add a response-body sentinel assertion or remove that promise.

## Required re-verification

1. Make all eight declared claim commands pass independently from a clean
   clone, including the explicit-smoke report contract.
2. Make `npm test` pass without timing out or leaking child package installs.
3. Register/fix the production checkout and verify its redirect rather than a
   404 response.
4. Increase all mobile interactive target hit areas to at least 44 × 44 px.
5. Add the missing response-body privacy claim test, then rerun local and live
   QA against the resulting commit.
