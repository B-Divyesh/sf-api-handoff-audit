# Independent verification — FAIL

**Candidate:** `d31750655805938f3c04040b33cd6b4abebc62db`  
**Verified URL:** <https://api-handoff-audit.sociobot.in>  
**Date:** 2026-08-28 UTC  
**Verdict:** **FAIL — do not release**

The site is deployed from this candidate: downloaded production JS, CSS, desktop/mobile hero art, and Open Graph art have the same SHA-256 hashes as a fresh `npm run build`. The release still fails the required accessibility gate and the public CLI JSON contract.

## First-read test (cold live page)

Pass. The initial page says, “Check an API handoff before it stalls,” identifies “small teams giving a shared API workflow to a new contributor,” and presents “Try it with sample data” with “See a complete audit with one real gap.” It enters `/demo` in one click.

## Required claims

`npm ci` completed successfully. Every command listed in `.factory/claims.json` was run from this checkout and passed.

| Claim | Result |
| --- | --- |
| `repo-gaps` | pass |
| `workspace-formats` | pass |
| `local-free-audit` | pass |
| `redacted-reports` | pass |
| `explicit-smoke` | pass |
| `demo-sandbox` | pass |
| `ci-pack` | pass |
| `license-cache` | pass |

Each was invoked as `npm run test:e2e -- --grep @claim:<id>`.

## Local and CLI verification

- `npm test`: pass — TypeScript check, 8 Rust tests, 2 Vitest tests, and 18 Playwright tests.
- `npm run build`: pass — release binary and `dist/site/` produced. Initial JS is 16,796 bytes raw / 6,230 bytes gzip; CSS is 14,472 bytes raw / 4,010 bytes gzip.
- `cargo clippy --all-targets -- -D warnings`: pass.
- `cargo package --allow-dirty`: pass — 87.1 KiB package / 25.8 KiB compressed.
- Clean consumer: extracted the `.crate`, ran `cargo install --path ...`, then verified `api-handoff-audit --help` and the bundled demo.
- A temporary repository plus a loopback HTTP server produced a passing JSON smoke report with `actual_status: 200`.
- Missing `run --target/--smoke` and timeout 0 correctly exit 2 with actionable errors.

## Live product checks

- `/`, `/demo`, `/ci-pack`, `/privacy`, `/terms`, `/404`, `/404.html`, `robots.txt`, and `sitemap.xml` returned HTTP 200. The external factory link returned 200.
- Desktop cold load had one `h1`, `main`, correct title/lang, no page or console errors, and only same-origin first-load requests (self-hosted JS, CSS, fonts, and art).
- At 390 × 844, every checked route had no horizontal page overflow. Demo state changed in memory, Reset restored the finding, and `localStorage` remained empty in demo mode. An invalid license check made the one declared request to `api.sociobot.in` and displayed recovery copy.
- Keyboard smoke check found the skip link first and a visible cyan 3px focus ring. Reduced-motion CSS reduces transitions to `0.00001s`.
- Live headers include CSP, HSTS, `nosniff`, referrer policy, and permissions policy. CSP confines default resources to self and permits only `https://api.sociobot.in` for paid-license verification.
- Rate limit pass: 60 concurrent invalid license verification requests yielded 30 HTTP 200 and 30 HTTP 429. A subsequent 429 supplied `Retry-After: 2` and `x-ratelimit-after: 2`.

## Release-blocking defects

### High — mobile keyboard accessibility failure

Direct axe-core Playwright scans of the **live** `/` and `/demo` at 390 × 844 produce one serious violation each: `scrollable-region-focusable` on `<pre aria-label="API Handoff Audit demo output">`. The terminal output is horizontally scrollable on a phone but cannot receive keyboard focus, so a keyboard user cannot scroll it. Axe says: “Scrollable region must have keyboard access.” This fails the required zero serious/critical axe gate. The repository e2e suite missed it because its axe scans use desktop viewport.

### High — `demo --json` is not valid JSON

From the clean package consumer, `api-handoff-audit demo --json | jq ...` prints a correct JSON object followed by:

```text
Demo — sample data, nothing was saved to your repository.
HTML report: /tmp/.../handoff-report.html
```

`jq` exits with `parse error: Invalid numeric literal`. The documented/scriptable `--json` interface must emit only JSON on stdout. Send the human demo path/status to stderr or omit it in JSON mode.

### Medium — deployed hashed assets are not immutable cached

The live hashed JS asset `/assets/index-V3vx7lj_.js` returns `Cache-Control: public, must-revalidate, max-age=30`, as does the document. The 30-second asset TTL does not meet the required long-lived immutable caching policy for hashed static assets. Configure deployment headers for `/assets/*`, for example `public, max-age=31536000, immutable`.

## Required repair and re-verification

1. Make every horizontally scrollable terminal/output region focusable and retain an obvious focus indicator; add a 390px axe regression test.
2. Make every `--json` command stdout a single valid JSON value; add a clean consumer/JSON parser regression test for `demo --json`.
3. Set immutable caching for content-hashed assets in deployment and verify live headers.
4. Re-run the claims, full `npm test`, clean-package install, mobile live axe scan, and deployment checks against the repair.
