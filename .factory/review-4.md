# Adversarial first-read review 4 — API Handoff Audit

**Verdict: PASS**

**Reviewed:** 29 August 2026 UTC
**Repository:** `e3040dff2b86091043edb7410786ac5c82531898`
**Live site:** <https://api-handoff-audit.sociobot.in>
**Finding count:** 0 blocking, 0 major, 0 minor

This is a full review, not a diff review. Fresh mobile and desktop contexts,
the demo flow, all registered claim commands from a clean clone, routes,
metadata, links, storage, request logging, accessibility, copy, and all prior
findings were rechecked. There are no remaining findings.

## 1. Cold first screen

Fresh Chromium contexts opened the live landing page at 390 × 844 and
1440 × 900 with no pre-existing browser storage. Before scrolling:

| Question | First-read answer | Evidence on the first screen |
| --- | --- | --- |
| What does it do? | It checks an API repository for handoff gaps before a teammate inherits it. | “Check an API repository before handoff” |
| For whom? | Teams handing a shared API workflow to a new contributor. | “For teams giving a shared API workflow to a new contributor.” |
| What should I click first? | Try the supplied report. | “Try it with sample data” plus “See the sample report and its one finding.” |

The headline is six words, the audience sentence is 11 words, the action is
visible and result-naming, and the three facts are visible. At 390 px,
`scrollWidth === clientWidth === 390`; there is no horizontal overflow. The
cold-read gate passes.

## 2. Copy audit

Word counts treat paths, code tokens, hyphenated terms, and numbers separated
by spaces as one word. Commands/configuration syntax are identified as such;
visible output, headings, labels, controls, alt text, and accessible labels are
included. No item exceeds 22 words. No banned marketing adjective, vague
slogan, unexplained metaphor, inconsistent core term, jargon-only heading, or
non-result-naming button was found. Claim-like product statements map to the
listed claim in the last column.

### Landing page

| Copy | Words | Check / claim |
| --- | ---: | --- |
| Skip to main content | 4 | Pass — skip-link label |
| API Handoff Audit home | 4 | Pass — wordmark label |
| Main navigation | 2 | Pass — navigation label |
| Demo | 1 | Pass — route label |
| How it works | 3 | Pass — route label |
| Privacy | 1 | Pass — route label |
| Check an API repository before handoff | 6 | Pass — job headline |
| For teams giving a shared API workflow to a new contributor. | 11 | Pass — audience and situation |
| Try it with sample data | 5 | Pass — result-naming primary action |
| See the sample report and its one finding. | 8 | `sample-report-content` |
| Free local audit. | 3 | `local-free-audit` |
| No account needed. | 3 | `local-free-audit` |
| Reports hide variable values. | 4 | `redacted-reports` |
| API files and checklists hang like signs in a night-market inspection lane. | 12 | Pass — purpose-focused image alt |
| Sample CLI output | 3 | Pass — section label |
| Sample audit finding | 3 | Pass — section heading |
| The bundled repository contains a request that uses an undocumented variable. | 11 | `sample-report-content` |
| Recorded terminal output | 3 | Pass — region label |
| parcel-lane / audit | 2 | Pass — sample context |
| Replay output | 2 | Pass — result-naming button |
| API Handoff Audit demo output | 5 | Pass — output label |
| $ api-handoff-audit demo | 2 | Command |
| API HANDOFF AUDIT NEEDS WORK | 5 | `sample-report-content` |
| Parcel Lane API | 3 | `sample-report-content` |
| 3 workspace files scanned · 2 setup steps · 1 fixture | 9 | `sample-report-content` |
| [set] API_TOKEN (secret) | 3 | `redacted-reports` |
| VAR001 Error: WAREHOUSE_ID is used but not documented. | 8 | `repo-gaps`, `sample-report-content` |
| Next: Add WAREHOUSE_ID under [[variables]]. | 5 | `sample-report-content` |
| HTML report: /tmp/api-handoff-audit-demo-…/handoff-report.html | 3 | `cli-demo-isolation` |
| Three steps | 2 | Pass — literal workflow label |
| How the handoff audit works | 5 | Pass — section heading |
| Scan the repository | 3 | Pass — step heading |
| Point the CLI at Bruno, Postman, or .http files in Git. | 11 | `workspace-formats` |
| Name one smoke request | 4 | Pass — step heading |
| Choose a configured local or staging target. | 7 | `target-policy` |
| The CLI sends only that request. | 6 | `explicit-smoke` |
| Share the redacted report | 4 | Pass — step heading |
| Write terminal, JSON, or HTML output without variable values or response bodies. | 12 | `redacted-reports` |
| What the audit does not do | 6 | Pass — boundary label |
| Where repository data goes | 4 | Pass — section heading |
| The audit reads local text files. | 6 | `local-free-audit` |
| It has no telemetry. | 5 | `local-free-audit` |
| A smoke run contacts only the target you select. | 9 | `explicit-smoke` |
| It never follows a redirect. | 5 | `explicit-smoke` |
| API Handoff Audit | 3 | Pass — footer name |
| Check an API repository before a teammate inherits it. | 9 | `repo-gaps` |
| Terms | 1 | Pass — route label |
| Built by Param Factory | 4 | Pass — attribution |
| external | 1 | Pass — screen-reader context |
| v0.1.0 · build 2026.08.29 | 3 | `package-install` |

### README

| Copy | Words | Check / claim |
| --- | ---: | --- |
| API Handoff Audit | 3 | Pass — document title |
| Check an API repository before a teammate inherits it. | 9 | `repo-gaps` |
| API Handoff Audit is a Rust CLI for teams that keep API requests in Git. | 15 | Pass — product and audience |
| It finds missing variables, undocumented setup, and absent fixtures. | 9 | `repo-gaps`, `absent-fixtures` |
| It runs only the smoke requests you name against configured local or staging targets. | 14 | `explicit-smoke`, `target-policy` |
| Its terminal, JSON, and HTML reports never include variable values or response bodies. | 13 | `redacted-reports` |
| The free CLI runs local audits and named smoke requests. | 10 | `local-free-audit`, `explicit-smoke` |
| Try the bundled project | 4 | Pass — section heading |
| The command copies examples/parcel-lane to a temporary directory, audits it, writes a redacted HTML report, and prints its path. | 19 | `cli-demo-isolation` |
| Nothing is written to your repository. | 6 | `cli-demo-isolation` |
| The browser demo is available at https://api-handoff-audit.sociobot.in/demo. | 7 | Pass — direct route |
| Install | 1 | Pass — section heading |
| Build the single binary | 4 | `package-install` |
| The package starts at version 0.1.0. | 6 | `package-install` |
| Configure a repository | 3 | Pass — section heading |
| Create handoff-audit.toml at the repository root. | 6 | Pass — configuration instruction |
| Request files use a plain HTTP format. | 7 | `workspace-formats` |
| The scanner also reads Bruno .bru files and Postman collection JSON. | 11 | `workspace-formats` |
| It recognizes {{NAME}}, ${NAME}, and $dotenv NAME variable references. | 9 | `workspace-formats` |
| Audit and run | 3 | Pass — section heading |
| Audit without sending a request | 5 | `local-free-audit` |
| Pass --env-file to read NAME=value entries from the file you choose. | 11 | `env-file` |
| Reports show variable names and states, never those values. | 9 | `env-file`, `redacted-reports` |
| Run one named request against a configured target | 8 | `explicit-smoke` |
| run requires both --target and --smoke. | 6 | `exit-codes` |
| The target must exist under [targets.local] or [targets.staging]. | 8 | `target-policy` |
| Local targets accept http or https; staging targets require https. | 10 | `target-policy` |
| The CLI never follows redirects to a different host. | 9 | `explicit-smoke` |
| Exit codes are 0 for pass, 1 for audit findings or a failed smoke response, and 2 for invalid input or configuration. | 22 | `exit-codes` |
| Add --json as shorthand for JSON on stdout. | 8 | `exit-codes` |
| Develop and verify | 3 | Pass — section heading |
| npm run build compiles the release binary and the site. | 10 | `build-artifacts` |
| The deployable site lands in dist/site/. | 6 | `build-artifacts` |
| cargo package --allow-dirty checks the ready-to-publish crate. | 7 | `package-install` |
| Privacy and scope | 3 | Pass — section heading |
| Audit reads local text files and does not use telemetry. | 10 | `local-free-audit` |
| Smoke runs send the selected request to the configured target. | 10 | `explicit-smoke` |
| Reports show variable names and states, but never their values. | 10 | `env-file`, `redacted-reports` |
| The product site has privacy and terms pages. | 8 | Pass — live route crawl |
| The MIT license is in LICENSE. | 6 | Pass — repository inspection |

Terminology is consistent: **repository** (checkout), **smoke request**
(named executable request), **target** (selected destination), **variable**
(input name), **report** (result), and **sample data** (bundled example).

## 3. Demo and sandbox

One click on the first-screen action opened `/demo?demo=1`. The first screen
already contained a realistic Parcel Lane report: repository tree, four counts,
`VAR001`, the source file, and the exact next edit. It is clearly recorded
sample output, not an implied write to a repository.

- The persistent banner reads “Demo — sample data, nothing is saved.” At 390
  px it remained `position: sticky` at `y = 0` after scrolling to the actual
  2,780 px page bottom; Reset demo and Start for real remained visible.
- Show the corrected config displays the exact TOML addition, says “The CLI
  does not make this edit,” and labels the passing state “Recorded CLI rerun.”
  Reset restores the initial finding; reload also restores it.
- In a fresh live context, before and after correction/reset, localStorage,
  sessionStorage, IndexedDB, Cache Storage, and OPFS were empty.
- The live request log contained only the site document and self-hosted fonts,
  CSS, JavaScript, and assets. No third-party request occurred.
- The CLI demo is covered by the clean-clone claim test: it copies the bundled
  Parcel Lane sample to a new OS temporary directory, writes an HTML report
  there, prints that path, and leaves the invoking repository unchanged.

## 4. Claims verification

The review used `git clone --no-local` into a new `/tmp` directory and a fresh
`npm ci` (57 packages; zero reported vulnerabilities). Every literal command
from `.factory/claims.json` was run separately. All 14 passed.

| Claim id | Result | Observable assertion |
| --- | --- | --- |
| `repo-gaps` | PASS | Fresh repository reports undocumented setup and `WAREHOUSE_ID`. |
| `absent-fixtures` | PASS | Missing configured fixture reports `FIX001`. |
| `workspace-formats` | PASS | Bruno, Postman, `.http`, and all three variable syntaxes are scanned. |
| `local-free-audit` | PASS | Loopback HTTP/HTTPS proxy sees zero audit requests. |
| `env-file` | PASS | Chosen file supplies variable state without exposing its sentinel. |
| `redacted-reports` | PASS | Variable and response-body sentinels are absent in terminal, JSON, and HTML. |
| `explicit-smoke` | PASS | Only the named request runs; the redirect destination sees zero requests. |
| `target-policy` | PASS | HTTP/HTTPS local targets execute; HTTP staging is rejected. |
| `exit-codes` | PASS | Codes 0, 1, and 2 plus parseable JSON stdout are asserted. |
| `cli-demo-isolation` | PASS | Every bundled sample file is copied; invoking repository is unchanged. |
| `package-install` | PASS | Packaged crate installs exactly one binary with help, v0.1.0, and JSON demo. |
| `build-artifacts` | PASS | Build creates release binary and `dist/site/index.html`. |
| `sample-report-content` | PASS | CLI and browser sample counts, finding, source, and next step agree. |
| `demo-sandbox` | PASS | Storage remains empty across flow; reset/reload work; no third-party request. |

All live landing and README capability statements have a relevant registered
claim, observable test, or are direct route/repository facts. No unlisted
product claim was found.

## 5. History recheck

Every earlier review, polish note, verification note, and handoff was read.
Each finding was checked against the current live deployment and the current
source/tests.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 | Fixed: phone banner remains sticky with both controls visible. |
| F-1-2 | Fixed: exact config plus explicitly recorded rerun; no simulated repository edit. |
| F-1-3 | Fixed: sample report content is registered and browser/CLI-parity tested. |
| F-1-4 | Fixed: unsupported Rust-minimum promise removed. |
| F-1-5 | Fixed: unowned no-checkout promise removed. |
| F-1-6 | Fixed: build artifact claim and clean-build assertion exist. |
| F-1-7 | Fixed: factory publishing statement removed from public README. |
| F-1-8 / F-2-1 | Fixed: privacy route distinguishes local audit from target-bound smoke request and omits hosted-workspace wording. |
| F-1-9 | Fixed: undefined “full” wording removed. |
| F-1-10 | Fixed: vague “small” wording removed. |
| F-1-11 | Fixed: metaphorical preflight eyebrow removed. |
| F-1-12 | Fixed: h1 names the repository handoff job. |
| F-1-13 | Fixed: preview is “Sample CLI output,” without decorative numbering. |
| F-1-14 | Fixed: preview heading is “Sample audit finding.” |
| F-1-15 | Fixed: boundary label is plain and specific. |
| F-1-16 | Fixed: direct Demo, Privacy, and Terms documents have route-specific social metadata. |
| F-2-2 | Fixed: `env-file` claim verifies loading and redaction. |
| F-2-3 | Fixed: demo-copy and one-installed-binary proof are explicit. |
| F-2-4 | Fixed: workflow and data-flow headings are literal section names. |
| F-2-5 | Fixed: 404 says “Page not found.” |
| F-3-1 | Fixed: demo-sandbox test snapshots all web storage, IndexedDB, Cache Storage, and OPFS throughout the flow. |
| F-3-2 | Fixed: `.factory/copy-audit.md` is complete and its word counts match the rendered copy. |

Previously recorded verification regressions also remain fixed: mobile terminal
focusability, JSON-only demo stdout, immutable hashed-asset caching,
response-body redaction, touch targets, and an HTTP 404 for unknown routes.

## 6. Structure, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles and headings | PASS — route-specific titles, `lang=en`, one h1, main landmark, and heading order on all checked routes. |
| Metadata | PASS — description, canonical, OG/Twitter title/description/URL/image, SVG favicon, apple icon, and 1200 × 630 OG image. |
| Routes and history | PASS — direct routes, demo deep link, Back navigation, focus-to-h1, and live announcement work. |
| 404 | PASS — unknown route returns HTTP 404 with designed shell and a way home. |
| Link crawl | PASS — internal and factory HTTP links return 200; emails use `mailto:`. |
| Header and footer | PASS — consistent shell, Privacy, Terms, attribution, and build id on routes. |
| Accessibility | PASS — live Axe scans at 390 and 1440 found zero serious/critical violations; all normal routes had no console/page errors. |
| Mobile and motion | PASS — no horizontal overflow; reduced-motion path is effectively instant. |
| Privacy/security | PASS — demo requests are same-origin only; CSP is self-only with response-header `frame-ancestors 'none'`, nosniff, and strict-origin referrer policy. |
| Assets | PASS — live hashed JavaScript has immutable one-year caching; initial JS is 11.95 kB raw / 4.42 kB gzip. |
| Visual identity | PASS — original night-market inspection art, self-hosted type, clipped panels, neon audit marks, and asymmetric layout are distinct from a generic SaaS template and match `.factory/design.md`. |

The browser reports an expected failed-document console message only when the
review deliberately requests an unknown URL that correctly returns HTTP 404;
the rendered 404 has no runtime/script error.

## 7. Missed leverage

No missing AI, import/export, or sync feature is implied by the brief. The
product already imports the three named workspace formats and exports terminal,
JSON, and HTML reports. An AI step would require sending repository material
and would not improve the deterministic handoff checks; no decorative AI or
embedded provider key exists.

## What would make this perfect

No product change is required. Keep the claim registry, clean-consumer package
test, and storage/request-log demo checks current whenever the CLI formats,
demo sample, or public wording changes; that is the remaining standard needed
to keep this zero-finding result true.
