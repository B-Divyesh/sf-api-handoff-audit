# Adversarial first-read review 3 — API Handoff Audit

**Verdict: FAIL**

**Reviewed:** 29 August 2026 UTC
**Repository:** `806f7f3a10466b50491ea1dcab8bf065073695fe`
**Live site:** <https://api-handoff-audit.sociobot.in>
**Finding count:** 0 blocking, 1 major, 1 minor

The cold first screen, one-click sample, real CLI demo, registered claim
commands, full test suite, live structure, accessibility, and prior repairs
were rechecked. The product flow is clear and honest. This review remains a
FAIL because the published demo-sandbox test does not prove all of its
no-persistence claim, and the mandatory copy-audit record is incomplete and
contains an incorrect count. A PASS requires zero findings.

## Findings

### Major

#### F-3-1 — The demo-sandbox claim test does not prove that the demo saves nothing

- **Location:** `.factory/claims.json`, `demo-sandbox`; `tests/claims.spec.ts`,
  `@claim:demo-sandbox`; `.factory/demo.md`, Browser.
- **Exact claim:** “Demo changes are not saved and the demo sends no
  third-party requests.” The demo documentation further says: “The browser
  demo does not use localStorage, IndexedDB, or OPFS.”
- **Evidence:** the tagged test clicks the recorded correction, checks only
  `localStorage.length` and `sessionStorage.length`, reloads, and checks that
  the finding returns. It never checks `indexedDB.databases()`, Cache Storage,
  or OPFS. An implementation could write the sample or another real-data key
  to IndexedDB/OPFS and still pass this test. The fresh live manual check did
  find all of these stores empty after the correction flow, so this is a gap in
  the required claim proof rather than an observed live persistence failure.
- **Why this matters:** the sample banner asks a first-time visitor to trust
  “nothing is saved.” The required sandbox rule requires that trust to be
  demonstrated from a clean context, not inferred from a reload.
- **Concrete fix:** extend `@claim:demo-sandbox` to assert empty
  `localStorage`, `sessionStorage`, `await indexedDB.databases()`,
  `await caches.keys()`, and OPFS directory entries before and after the
  correction/reset flow. Keep its request listener assertion. If any store is
  intentionally used, assert a `demo:`-prefixed namespace and that real keys
  remain absent.

### Minor

#### F-3-2 — The mandatory copy-audit record is incomplete and miscounts visible copy

- **Location:** `.factory/copy-audit.md`.
- **Exact text:** it says “For teams giving a shared API workflow to a new
  contributor.” has **10** words. It has **11** words. The document is titled
  “Landing-page copy audit” but omits required visible landing copy such as
  “See the sample report and its one finding.”, the sample terminal lines,
  the three workflow explanations, footer text, and every README sentence.
- **Why this matters:** the plain-words proof is intended to make excessive,
  vague, or inconsistent copy mechanically reviewable. An incomplete and
  inaccurate source-of-truth audit cannot demonstrate that the landing page
  and README were fully checked.
- **Concrete fix:** regenerate `.factory/copy-audit.md` from the rendered
  landing page and `README.md`. Include every heading, sentence, control,
  accessible label, sample-output line, and README sentence; correct the
  audience count to 11; retain the terminology table and link each claim-like
  sentence to its claim id.

## 1. Cold first screen

Fresh Chromium contexts opened the live URL without existing storage at
390 × 844 and 1440 × 900. No scrolling occurred before this interpretation.

| Question | First-read answer |
| --- | --- |
| What does it do? | It checks an API repository for handoff gaps before a teammate takes over. |
| For whom? | Teams giving a shared API workflow to a new contributor. |
| What should I click first? | “Try it with sample data”; its adjacent text says that it opens the sample report and its one finding. |

The headline, audience sentence, action, action result, and three plain facts
were visible above the fold at both sizes. The phone page width was exactly
390 px with no horizontal overflow. This gate passes.

## 2. Copy audit

Counting treats hyphenated terms, paths, flags, and code tokens separated by
spaces as words. Commands are included when visible as product output. The
tables include headings and controls because the plain-words rules apply to
them too. No landing or README item exceeds 22 words. No banned marketing
word, unexplained slogan, jargon-only heading, inconsistent product term, or
non-result-naming button was found in the rendered product copy.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| API Handoff Audit home | 4 | Pass — accessible wordmark label |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Check an API repository before handoff | 6 | Pass — job headline |
| For teams giving a shared API workflow to a new contributor. | 11 | Pass — audience and situation |
| Try it with sample data | 5 | Pass — primary result-naming action |
| See the sample report and its one finding. | 8 | Pass — `sample-report-content` |
| Free local audit. | 3 | Pass — `local-free-audit` |
| No account needed. | 3 | Pass — `local-free-audit` |
| Reports hide variable values. | 4 | Pass — `redacted-reports` |
| API files and checklists hang like signs in a night-market inspection lane. | 12 | Pass — purpose-focused image alt |
| Sample CLI output | 3 | Pass — section label |
| Sample audit finding | 3 | Pass — section heading |
| The bundled repository contains a request that uses an undocumented variable. | 11 | Pass — `sample-report-content` |
| Recorded terminal output | 3 | Pass — accessible region label |
| parcel-lane / audit | 2 | Pass — sample context |
| Replay output | 2 | Pass — result-naming button |
| API Handoff Audit demo output | 5 | Pass — accessible output label |
| $ api-handoff-audit demo | 2 | Pass — command |
| API HANDOFF AUDIT NEEDS WORK | 5 | Pass — recorded result |
| Parcel Lane API | 3 | Pass — sample project |
| 3 workspace files scanned · 2 setup steps · 1 fixture | 9 | Pass — `sample-report-content` |
| [set] API_TOKEN (secret) | 3 | Pass — redacted state |
| VAR001 Error: WAREHOUSE_ID is used but not documented. | 8 | Pass — `repo-gaps` |
| Next: Add WAREHOUSE_ID under [[variables]]. | 5 | Pass — sample next step |
| HTML report: /tmp/api-handoff-audit-demo-…/handoff-report.html | 3 | Pass — `cli-demo-isolation` |
| Three steps | 2 | Pass — literal workflow label |
| How the handoff audit works | 5 | Pass — section heading |
| Scan the repository | 3 | Pass — step heading |
| Point the CLI at Bruno, Postman, or .http files in Git. | 11 | Pass — `workspace-formats` |
| Name one smoke request | 4 | Pass — step heading |
| Choose a configured local or staging target. | 7 | Pass — `target-policy` |
| The CLI sends only that request. | 6 | Pass — `explicit-smoke` |
| Share the redacted report | 4 | Pass — step heading |
| Write terminal, JSON, or HTML output without variable values or response bodies. | 12 | Pass — `redacted-reports` |
| What the audit does not do | 6 | Pass — boundary label |
| Where repository data goes | 4 | Pass — section heading |
| The audit reads local text files. | 6 | Pass — `local-free-audit` |
| It has no telemetry. | 5 | Pass — `local-free-audit` |
| A smoke run contacts only the target you select. | 9 | Pass — `explicit-smoke` |
| It never follows a redirect. | 5 | Pass — `explicit-smoke` |
| API Handoff Audit | 3 | Pass — footer name |
| Check an API repository before a teammate inherits it. | 9 | Pass — footer one-liner |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| external | 1 | Pass — screen-reader context |
| v0.1.0 · build 2026.08.29 | 3 | Pass — build identifier |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| API Handoff Audit | 3 | Pass |
| Check an API repository before a teammate inherits it. | 9 | Pass |
| API Handoff Audit is a Rust CLI for teams that keep API requests in Git. | 15 | Pass |
| It finds missing variables, undocumented setup, and absent fixtures. | 9 | Pass — `repo-gaps`, `absent-fixtures` |
| It runs only the smoke requests you name against configured local or staging targets. | 14 | Pass — `explicit-smoke`, `target-policy` |
| Its terminal, JSON, and HTML reports never include variable values or response bodies. | 13 | Pass — `redacted-reports` |
| The free CLI runs local audits and named smoke requests. | 10 | Pass — scope summary |
| Try the bundled project | 4 | Pass — section heading |
| The command copies examples/parcel-lane to a temporary directory, audits it, writes a redacted HTML report, and prints its path. | 19 | Pass — `cli-demo-isolation` |
| Nothing is written to your repository. | 6 | Pass — `cli-demo-isolation` |
| The browser demo is available at https://api-handoff-audit.sociobot.in/demo. | 7 | Pass — direct route |
| Install | 1 | Pass |
| Build the single binary | 4 | Pass — `package-install` |
| The package starts at version 0.1.0. | 6 | Pass — `package-install` |
| Configure a repository | 3 | Pass |
| Create handoff-audit.toml at the repository root. | 6 | Pass |
| Request files use a plain HTTP format. | 7 | Pass — `workspace-formats` |
| The scanner also reads Bruno .bru files and Postman collection JSON. | 11 | Pass — `workspace-formats` |
| It recognizes {{NAME}}, ${NAME}, and $dotenv NAME variable references. | 9 | Pass — `workspace-formats` |
| Audit and run | 3 | Pass |
| Audit without sending a request | 5 | Pass — `local-free-audit` |
| Run one named request against a configured target | 8 | Pass — `explicit-smoke` |
| run requires both --target and --smoke. | 6 | Pass — `exit-codes` |
| The target must exist under [targets.local] or [targets.staging]. | 8 | Pass — `target-policy` |
| Local targets accept http or https; staging targets require https. | 10 | Pass — `target-policy` |
| The CLI never follows redirects to a different host. | 9 | Pass — `explicit-smoke` |
| Exit codes are 0 for pass, 1 for audit findings or a failed smoke response, and 2 for invalid input or configuration. | 22 | Pass — `exit-codes` |
| Add --json as shorthand for JSON on stdout. | 8 | Pass — `exit-codes` |
| Develop and verify | 3 | Pass |
| npm run build compiles the release binary and the site. | 10 | Pass — `build-artifacts` |
| The deployable site lands in dist/site/. | 6 | Pass — `build-artifacts` |
| cargo package --allow-dirty checks the ready-to-publish crate. | 7 | Pass — `package-install` |
| Privacy and scope | 3 | Pass |
| Audit reads local text files and does not use telemetry. | 10 | Pass — `local-free-audit` |
| Smoke runs send the selected request to the configured target. | 10 | Pass — `explicit-smoke` |
| Reports show variable names and states, but never their values. | 10 | Pass — `env-file`, `redacted-reports` |
| The product site has privacy and terms pages. | 8 | Pass — live route crawl |
| The MIT license is in LICENSE. | 6 | Pass — repository inspection |

Terminology is consistent: **repository** is the checked Git checkout,
**smoke request** is the named executable request, **target** is its selected
destination, **variable** is an input name, **report** is the result, and
**sample data** is the bundled example.

## 3. Demo and sandbox

- The hero action opened `/demo?demo=1` in one click from the cold landing
  page. Direct `?demo=1` also entered the sample.
- The first demo screen already showed the Parcel Lane API report: 3 files,
  2 setup steps, 1 fixture, 2 smoke requests, the source tree, `VAR001`, the
  `WAREHOUSE_ID` message, its source file, and the concrete next config edit.
- At 390 px and 1440 px the persistent “Demo — sample data, nothing is saved”
  banner was `position: sticky` at `y = 0` after scrolling to the page bottom.
  Both Reset demo and Start for real remained usable.
- “Show the corrected config” showed the exact TOML addition and said “The CLI
  does not make this edit.” Its PASS state is labelled “Recorded CLI rerun.”
  Reset restored the original finding; reload also restored it.
- A fresh live request log for the full correction/reset flow contained only
  `https://api-handoff-audit.sociobot.in` documents, fonts, CSS, and JavaScript.
  No third-party request occurred.
- A fresh live manual storage inspection after correction found empty
  localStorage, sessionStorage, IndexedDB, Cache Storage, and OPFS. F-3-1 is
  about missing automated proof for the last three stores.
- The shipped CLI demo was exercised through the clean-clone claim test. It
  copied the Parcel Lane sample to a new OS temporary directory, wrote the
  HTML report there, printed that path, and left the invoking repository
  unchanged.

## 4. Claims verification

From a clean `git clone --no-local` checkout at the reviewed commit,
`npm ci` installed 57 packages with zero reported vulnerabilities. Every
literal command listed in `.factory/claims.json` was run independently; all
14 passed. The subsequent full suite passed all 31 tests.

| Claim | Result | Observable check |
| --- | --- | --- |
| `repo-gaps` | PASS | Fresh repository produced `SETUP001` and `VAR001`. |
| `absent-fixtures` | PASS | Missing configured fixture produced `FIX001`. |
| `workspace-formats` | PASS | Bruno, Postman, `.http`, and all documented references were found. |
| `local-free-audit` | PASS | Loopback HTTP/HTTPS proxies observed zero audit requests. |
| `env-file` | PASS | Chosen environment value supplied a state without exposing its sentinel. |
| `redacted-reports` | PASS | Variable and response-body sentinels were absent from terminal, JSON, and HTML output. |
| `explicit-smoke` | PASS | Only the named request ran; its redirect destination received zero requests. |
| `target-policy` | PASS | HTTP/HTTPS local targets were accepted; HTTP staging was rejected. |
| `exit-codes` | PASS | Result codes 0, 1, and 2 and parseable JSON stdout were asserted. |
| `cli-demo-isolation` | PASS | Bundled sample files matched the copied temp files; invoking repository stayed unchanged. |
| `package-install` | PASS | The packed crate installed exactly one binary with help, version 0.1.0, and JSON demo support. |
| `build-artifacts` | PASS | Build created the release binary and `dist/site/index.html`. |
| `sample-report-content` | PASS | CLI/browser counts, finding, source, and next step matched. |
| `demo-sandbox` | PASS, incomplete proof | Reload, web storage, and same-origin requests passed; F-3-1 remains. |

No live landing or README claim-like sentence lacked a relevant registry
entry. F-3-1 concerns the adequacy of the registered test, not an unlisted
sentence or a failing command.

## 5. History recheck

Every earlier review, polish note, verification report, and handoff was read.
Each historical finding was reconfirmed against the live site and current
source/tests.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 sticky phone demo banner | Fixed: live 390 px scroll retains banner and both controls; mobile rule remains sticky. |
| F-1-2 simulated documentation fix | Fixed: source and live demo show exact TOML plus a labelled recorded rerun. |
| F-1-3 sample results unlisted | Fixed: `sample-report-content` asserts CLI/browser parity. |
| F-1-4 Rust 1.85 promise | Fixed: removed from README. |
| F-1-5 no-checkout promise | Fixed: removed; no checkout route is advertised. |
| F-1-6 build-output promises | Fixed: `build-artifacts` is registered and passed. |
| F-1-7 factory publishing statement | Fixed: removed from README. |
| F-1-8 scope/privacy overstatement | Fixed: live privacy headline distinguishes audit from target-bound smoke requests. |
| F-1-9 undefined “full” | Fixed: README names local audits and smoke requests. |
| F-1-10 vague “small” | Fixed: removed. |
| F-1-11 preflight metaphor | Fixed: removed. |
| F-1-12 metaphorical handoff headline | Fixed: live h1 names the repository job. |
| F-1-13 decorative preview number | Fixed: “Sample CLI output.” |
| F-1-14 slogan preview heading | Fixed: “Sample audit finding.” |
| F-1-15 ambiguous client label | Fixed: “What the audit does not do.” |
| F-1-16 direct-route social metadata | Fixed: direct Demo, Privacy, and Terms documents have route-specific title, description, canonical, OG, and Twitter fields. |
| F-2-1 / F-1-8 reopened privacy wording | Fixed: live privacy copy is target-qualified and omits hosted-workspace language. |
| F-2-2 `--env-file` claim | Fixed: `env-file` exists and passed. |
| F-2-3 incomplete CLI-demo/package proof | Fixed: tests compare copied files and assert the one installed binary. |
| F-2-4 indirect landing labels | Fixed: “Three steps” and “Where repository data goes.” |
| F-2-5 metaphorical 404 | Fixed: direct live heading is “Page not found.” |

The earlier verification failures for mobile terminal focus, JSON-only demo
stdout, immutable hashed assets, exact smoke reporting, test timeout, response
body redaction, touch targets, and real 404 routing also remain fixed in the
current source and full test run.

## 6. Structure, access, and identity

| Check | Result |
| --- | --- |
| Route title pattern | Pass: landing is “API Handoff Audit — check repository handoffs”; other pages use route-specific titles under 60 characters. |
| Semantic shell | Pass: every tested route has `lang=en`, one h1, one main, ordered headings, header, nav, footer, skip link, and visible focus. |
| Metadata | Pass: description, canonical, OG/Twitter title/description/URL/image, SVG favicon, apple icon, and 1200 × 630 social image are present. |
| Routes and history | Pass: `/`, `/demo`, `/privacy`, `/terms`, direct 404, unknown route, Back button, h1 focus, and live route announcement work. |
| 404 | Pass: unknown URL returns HTTP 404 with the designed full shell and a return link. |
| Link crawl | Pass: every internal and factory HTTP link returned 200; email links use `mailto:`. |
| Demo privacy | Pass in observed flow: only same-origin requests; see F-3-1 for the incomplete automated storage proof. |
| Accessibility | Pass: live axe found zero serious/critical violations across five routes at 390 px and 1440 px. |
| Mobile | Pass: no horizontal overflow; tested controls are 44 px or larger. |
| Motion | Pass: reduced motion makes transitions and animation effectively instant. |
| Console | Pass on product routes. The expected failed-resource console message occurs only when intentionally loading the HTTP 404 document. |
| Build/performance | Pass: initial JS is 11.95 kB raw / 4.42 kB gzip; CSS is 15.51 kB raw / 4.16 kB gzip. |
| Visual identity | Pass: the asymmetric night-market inspection board, generated art, clipped panels, neon rules, self-hosted type, and finding rows match the documented product-specific visual thesis and are not a generic SaaS template. |

## 7. Missed leverage

No additional AI feature is required. The brief calls for a deterministic,
local repository check and an explicit smoke request; sending repository
content to a model would weaken the privacy promise without improving the
core job. Import is present for Bruno, Postman, and `.http`; export is present
for terminal, JSON, and HTML reports; no provider key or decorative AI feature
exists.

## What would make this perfect

Add complete storage-namespace assertions to the demo-sandbox claim test, then
regenerate the copy audit with the complete landing and README inventories and
correct word counts. Re-run the 14 individual claim commands and the full
suite from a fresh clone. At that point, the observed product flow and its
proof records would have no remaining finding.
