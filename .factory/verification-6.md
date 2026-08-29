# Independent verification 6 — PASS

**Verified candidate:** `98d5ee4644dc0f037de5a6be97d237f2c325e0aa`  
**Live URL:** <https://api-handoff-audit.sociobot.in>  
**Verification date:** 2026-08-29 UTC  
**Result:** **PASS**

## Release decision

The candidate meets the researched CLI contract. It audits a repository for
handoff gaps, runs only an explicitly named smoke request against a configured
local/staging target, and emits redacted terminal, JSON, and HTML reports. No
release-blocking, high, medium, or low defects were found.

The cold first read of the live landing page was clear: it says it checks an
API repository before handoff, names teams onboarding a contributor, and
offers a first-screen **Try it with sample data** link that says it will show a
sample report and finding. The link opens `/demo?demo=1` in one click.

## Claims — all passed individually

From this clean checkout, each literal command in `.factory/claims.json` was
run separately through its shipped CLI/demo test entry point. All 14 returned
zero:

| Claim IDs | Result |
| --- | --- |
| `repo-gaps`, `absent-fixtures`, `workspace-formats` | PASS |
| `local-free-audit`, `env-file`, `redacted-reports` | PASS |
| `explicit-smoke`, `target-policy`, `exit-codes` | PASS |
| `cli-demo-isolation`, `package-install`, `build-artifacts` | PASS |
| `sample-report-content`, `demo-sandbox` | PASS |

Notable observed assertions: the local audit made zero requests through
loopback HTTP/HTTPS proxies; supplied secret and response-body sentinels were
absent from terminal/JSON/HTML reports; a selected smoke request made one
request and did not follow its redirect; and the package claim extracted and
installed one isolated `api-handoff-audit` binary, whose `--help`, version
`0.1.0`, and `demo --json` all worked.

## Local quality and CLI checks

```text
npm ci                                  PASS — 57 packages, 0 vulnerabilities
npm test                                PASS — TypeScript, 8 Rust, 1 Vitest, 31 Playwright tests
cargo fmt --all -- --check              PASS
cargo clippy --all-targets -- -D warnings PASS
cargo package --allow-dirty             PASS — 16 files, 87.6 KiB / 25.9 KiB compressed
npm run build                           PASS — target/release/api-handoff-audit and dist/site/
```

Independent release-binary smoke checks passed. `demo --json` created a new
`/tmp/api-handoff-audit-demo-*` directory, reported the bundled three files,
two setup steps, one fixture, two smoke requests, and one `WAREHOUSE_ID`
finding, and printed the HTML report path without writing into the repository.
The non-interactive help is useful. Invalid `--timeout-seconds 0` exited `2`
with the recovery message `--timeout-seconds must be between 1 and 300.`

## Live deployment, privacy, accessibility, and performance

The live main JavaScript asset `/assets/main-CGrZMT8N.js` matched the final
local build byte-for-byte (SHA-256
`9366b1ec758bfdf51c6311c4c1bbfee80b9ffc975618024062379fde8aacad43`). This
is the product-code artifact for the verified candidate; the candidate's
change from the prior product commit is documentation.

- `/`, `/demo`, `/privacy`, `/terms`, `/robots.txt`, `/sitemap.xml`, social
  image, and icon assets returned 200. Unknown routes returned the designed
  404 page.
- At desktop 1440×900 and mobile 390×844, `/`, `/demo?demo=1`, `/privacy`,
  and `/terms` had one `h1`, one `main`, `lang=en`, no horizontal overflow,
  no console/page errors, and no axe serious/critical violations. The expected
  browser error for a deliberately requested 404 document was excluded.
- Keyboard testing reached the skip link first with a visible cyan 3px focus
  outline. Enter opened the sample, Space activated its correction control,
  focus moved to the corrected configuration, and Reset restored the original
  finding. Reduced-motion mode reduced transition duration to `0.00001s`.
- A fresh Playwright request log for the complete demo flow contained only
  `https://api-handoff-audit.sociobot.in`; `localStorage` and `sessionStorage`
  remained empty. The demo banner states that sample data is not saved.
- Responses send a self-only CSP (including `connect-src 'self'` and
  `frame-ancestors 'none'`), HSTS, `nosniff`, strict-origin referrer policy,
  and camera/microphone/location permissions policy. Documents use
  `public, must-revalidate, max-age=30`; hashed JS/CSS use
  `public, max-age=31536000, immutable`; conditional document fetch returned
  304.
- Initial JS is 11,954 bytes raw (4.42 kB gzip), CSS is 15,514 bytes raw
  (4.16 kB gzip), and the mobile hero is 43,672 bytes, all within the supplied
  static-product budgets.

This is a local CLI with a static documentation/demo site: it has no product
server endpoint, sign-in, billing/unlock call, persistence backend, analytics,
or service worker. Rate-limit/429 allowance, Entra tenant, backend
concurrency/persistence, and PWA update/offline checks are not applicable.

## Defects by severity

| Severity | Findings |
| --- | --- |
| Release-blocking | None |
| High | None |
| Medium | None |
| Low | None |

