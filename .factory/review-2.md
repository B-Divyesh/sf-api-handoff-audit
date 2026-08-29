# Adversarial first-read review 2 — API Handoff Audit

**Verdict: FAIL**

**Reviewed:** 29 August 2026 UTC

**Repository:** `161a3043916a4dbd8c8ffea0671e6eeb5e6a3391`

**Live site:** <https://api-handoff-audit.sociobot.in>

**Finding count:** 1 blocking, 2 major, 2 minor

The cold landing screen and one-click demo pass. All 13 registered claim
commands and the complete test suite pass. The review still fails because a
privacy claim from F-1-8 remains live, one privacy capability is absent from
the claims registry, two registered tests do not prove their full claim text,
and two copy groups still violate the supplied plain-words rules.

## Findings

### Blocking

#### F-2-1 / F-1-8 reopened — the privacy route keeps an unlisted scope claim and overstates local handling

- **Location:** live `/privacy`; `site/src/main.ts:83`.
- **Exact text:** “Your repository data stays local” and “The CLI has no
  account, telemetry, or hosted workspace.”
- **Evidence:** the same page later says a smoke run sends a request to a local
  or staging target. That request comes from a repository request file, so the
  unqualified h1 is not true for the whole CLI. The `local-free-audit` claim
  proves that an *audit* makes no network request; it does not own “repository
  data stays local” for smoke runs or the negative “no hosted workspace”
  promise. F-1-8 identified the same unlisted hosted-workspace/product-scope
  claim. Polish 1 removed it from the landing page and README but left it on
  this live route.
- **Why a first-time visitor is misled:** the strongest privacy statement says
  data stays local, while a supported workflow transmits the selected request
  to a configured target. The qualification appears only after the promise.
- **Concrete fix:** use the h1 “Audit locally; send smoke requests only to your
  target.” Rewrite the lede as “The CLI has no account or telemetry.” Remove
  “hosted workspace” unless a registered test proves that exact scope claim.
  Recheck every route, not only landing and README, when closing F-1-8.

### Major

#### F-2-2 — reading `--env-file` is an unlisted public claim

- **Location:** live `/privacy`; `site/src/main.ts:83`.
- **Exact text:** “It reads a chosen environment file when you pass
  `--env-file`.”
- **Evidence:** `.factory/claims.json` has no entry for loading values from an
  environment file. `redacted-reports` supplies a process environment value;
  it does not pass `--env-file`.
- **Why a first-time visitor is misled:** this is an operational capability and
  privacy boundary a CLI user can rely on, but the declared sandbox never
  verifies it.
- **Concrete fix:** add an `env-file` claim. In its tagged test, create a fresh
  repository and environment file with a sentinel value, pass `--env-file`,
  confirm the variable is reported as supplied, and confirm the sentinel is
  absent from terminal, JSON, and HTML output. Alternatively, remove the
  sentence.

#### F-2-3 — two listed claim tests do not prove their complete claim text

- **Location:** `.factory/claims.json` entries `cli-demo-isolation` and
  `package-install`; `tests/claims.spec.ts:68-86` and `316-328`.
- **Exact claims:** “The CLI demo copies bundled sample data to a new temporary
  directory…” and “The ready-to-publish package installs one
  api-handoff-audit binary…”.
- **Evidence:** `@claim:cli-demo-isolation` checks the report path and that the
  working repository is unchanged, but never asserts that the four bundled
  sample files were copied beside the report. `@claim:package-install` runs the
  expected executable but never lists the install `bin` directory to prove
  that exactly one binary was installed. Both commands pass without proving
  those words.
- **Why a first-time visitor is misled:** the registry presents these as tested
  guarantees, but either implementation could regress while its tagged test
  remains green.
- **Concrete fix:** assert the copied config, two request files, and fixture in
  the demo directory, including equality with the bundled sources. Assert that
  the isolated install root's `bin` directory contains exactly
  `api-handoff-audit`.

### Minor

#### F-2-4 — two landing labels are not plain section names

- **Location:** live landing page, workflow and boundary sections;
  `site/src/main.ts`.
- **Exact text:** “Three checks, one report” and “Your repository stays the
  workspace”.
- **Why this fails:** the three numbered items are workflow steps, not three
  checks. The second phrase makes “workspace” carry a metaphor instead of
  naming the section's data-flow subject. Both make a reader decode copy that
  could be direct.
- **Concrete rewrite:** use “Three steps” and “Where repository data goes”.

#### F-2-5 — the 404 uses product lore instead of a plain error heading

- **Location:** live unknown route and `/404`; `site/src/main.ts:91`.
- **Exact text:** “STALL CLOSED / 404” and “This route has no request file”.
- **Why this fails:** a missing web page is neither a closed market stall nor
  a missing API request file. The supplied plain-words rule prohibits metaphor
  and requires headings that make sense by themselves.
- **Concrete rewrite:** “PAGE NOT FOUND / 404” and “Page not found”. Keep “The
  page may have moved, or the address has a typo” and “Return to the audit”.

## 1. Cold first screen

Fresh Chromium contexts opened the live URL at 390 × 844 and 1440 × 900. No
scrolling occurred before this interpretation was recorded.

- **What it does:** checks an API repository before a handoff and produces a
  report of gaps.
- **For whom:** teams giving a shared API workflow to a new contributor.
- **What to click first:** “Try it with sample data”; the adjacent sentence
  says it opens the sample report and its finding.

All three answers are present above the fold at both widths. The phone has no
horizontal page overflow. This gate passes.

## 2. Copy audit

Counting treats hyphenated terms, paths, flags, and code tokens as one word;
standalone punctuation and decorative symbols are excluded. Code examples are
not sentences. Visible headings, labels, controls, terminal lines, and image
alt text are included. No sentence exceeds 22 words and no banned marketing
word appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| API Handoff Audit home | 4 | Pass — accessible name |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| Check an API repository before handoff | 6 | Pass |
| For teams giving a shared API workflow to a new contributor. | 11 | Pass |
| Try it with sample data | 5 | Pass — result-naming action |
| See the sample report and its one finding. | 8 | Pass — `sample-report-content` |
| Free local audit. | 3 | Pass — `local-free-audit` |
| No account needed. | 3 | Pass — `local-free-audit` |
| Reports hide variable values. | 4 | Pass — `redacted-reports` |
| API files and checklists hang like signs in a night-market inspection lane. | 12 | Pass — literal image description |
| Sample CLI output | 3 | Pass |
| Sample audit finding | 3 | Pass |
| The bundled repository contains a request that uses an undocumented variable. | 11 | Pass — `sample-report-content` |
| Recorded terminal output | 3 | Pass — region name |
| parcel-lane / audit | 2 | Pass — sample context |
| Replay output | 2 | Pass — result-naming button |
| API Handoff Audit demo output | 5 | Pass — output label |
| $ api-handoff-audit demo | 2 | Pass — command |
| API HANDOFF AUDIT NEEDS WORK | 5 | Pass |
| Parcel Lane API | 3 | Pass |
| 3 workspace files scanned · 2 setup steps · 1 fixture | 9 | Pass — `sample-report-content` |
| [set] API_TOKEN (secret) | 3 | Pass |
| VAR001 Error: WAREHOUSE_ID is used but not documented. | 8 | Pass — `repo-gaps` |
| Next: Add WAREHOUSE_ID under [[variables]]. | 5 | Pass |
| HTML report: /tmp/api-handoff-audit-demo-…/handoff-report.html | 3 | Pass — `cli-demo-isolation` |
| Three checks, one report | 4 | **F-2-4** — inaccurate decorative label |
| How the handoff audit works | 5 | Pass |
| Scan the repository | 3 | Pass |
| Point the CLI at Bruno, Postman, or `.http` files in Git. | 11 | Pass — `workspace-formats` |
| Name one smoke request | 4 | Pass |
| Choose a configured local or staging target. | 7 | Pass — `target-policy` |
| The CLI sends only that request. | 6 | Pass — `explicit-smoke` |
| Share the redacted report | 4 | Pass |
| Write terminal, JSON, or HTML output without variable values or response bodies. | 12 | Pass — `redacted-reports` |
| What the audit does not do | 6 | Pass |
| Your repository stays the workspace | 5 | **F-2-4** — indirect/metaphorical heading |
| The audit reads local text files. | 6 | Pass — `local-free-audit` |
| It has no telemetry. | 5 | Pass — `local-free-audit` |
| A smoke run contacts only the target you select. | 9 | Pass — `explicit-smoke` |
| It never follows a redirect. | 5 | Pass — `explicit-smoke` |
| API Handoff Audit | 3 | Pass |
| Check an API repository before a teammate inherits it. | 9 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| external | 1 | Pass — screen-reader context |
| v0.1.0 · build 2026.08.29 | 3 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| API Handoff Audit | 3 | Pass |
| Check an API repository before a teammate inherits it. | 9 | Pass |
| API Handoff Audit is a Rust CLI for teams that keep API requests in Git. | 15 | Pass |
| It finds missing variables, undocumented setup, and absent fixtures. | 9 | Pass — `repo-gaps`, `absent-fixtures` |
| It runs only the smoke requests you name against configured local or staging targets. | 14 | Pass — `explicit-smoke` |
| Its terminal, JSON, and HTML reports never include variable values or response bodies. | 13 | Pass — `redacted-reports` |
| The free CLI runs local audits and named smoke requests. | 10 | Pass |
| Try the bundled project | 4 | Pass |
| The command copies `examples/parcel-lane` to a temporary directory, audits it, writes a redacted HTML report, and prints its path. | 19 | **F-2-3** — registered test does not prove the copied files |
| Nothing is written to your repository. | 6 | Pass — `cli-demo-isolation` |
| The browser demo is available at `https://api-handoff-audit.sociobot.in/demo`. | 7 | Pass — live link |
| Install | 1 | Pass |
| Build the single binary | 4 | **F-2-3** — exact one-binary result is not asserted |
| The package starts at version `0.1.0`. | 6 | Pass — `package-install` |
| Configure a repository | 3 | Pass |
| Create `handoff-audit.toml` at the repository root. | 6 | Pass |
| Request files use a plain HTTP format. | 7 | Pass |
| The scanner also reads Bruno `.bru` files and Postman collection JSON. | 11 | Pass — `workspace-formats` |
| It recognizes `{{NAME}}`, `${NAME}`, and `$dotenv NAME` variable references. | 9 | Pass — `workspace-formats` |
| Audit and run | 3 | Pass |
| Audit without sending a request | 5 | Pass — `local-free-audit` |
| Run one named request against a configured target | 8 | Pass — `explicit-smoke` |
| `run` requires both `--target` and `--smoke`. | 6 | Pass — `exit-codes` |
| The target must exist under `[targets.local]` or `[targets.staging]`. | 8 | Pass — `target-policy` |
| Local targets accept `http` or `https`; staging targets require `https`. | 10 | Pass — `target-policy` |
| The CLI never follows redirects to a different host. | 9 | Pass — `explicit-smoke` |
| Exit codes are `0` for pass, `1` for audit findings or a failed smoke response, and `2` for invalid input or configuration. | 22 | Pass — `exit-codes` |
| Add `--json` as shorthand for JSON on stdout. | 8 | Pass — `exit-codes` |
| Develop and verify | 3 | Pass |
| `npm run build` compiles the release binary and the site. | 10 | Pass — `build-artifacts` |
| The deployable site lands in `dist/site/`. | 6 | Pass — `build-artifacts` |
| `cargo package --allow-dirty` checks the ready-to-publish crate. | 7 | Pass — `package-install` |
| Privacy and scope | 3 | Pass |
| Audit reads local text files and does not use telemetry. | 10 | Pass — `local-free-audit` |
| Smoke runs send the selected request to the configured target. | 10 | Pass — `explicit-smoke` |
| Reports show variable names and states, but never their values. | 10 | Pass — `redacted-reports` |
| The product site has privacy and terms pages. | 8 | Pass — live crawl |
| The MIT license is in `LICENSE`. | 6 | Pass — repository inspection |

Terminology is consistent: **repository** is the checkout, **smoke request** is
the named request, **target** is its destination, **variable** is an input
name, **report** is the result, and **sample data** is the bundled example.

## 3. Demo and sandbox

- One click on “Try it with sample data” opened `/demo?demo=1` and immediately
  showed Parcel Lane API, four counts, the repository tree, `VAR001`, its file,
  its next step, and the demo banner.
- At 390 px, the 108.8 px banner remained at `y=0` after scrolling to the page
  bottom. Reset and Start for real remained visible with 44 px heights.
- “Show the corrected config” displayed the exact TOML addition and labelled
  the PASS result as a recorded rerun. Reset and reload restored the finding.
- Fresh mobile and desktop contexts retained no localStorage, sessionStorage,
  IndexedDB database, or Cache Storage entry. All observed requests were to
  `https://api-handoff-audit.sociobot.in`.
- The clean-clone CLI demo test ran from a fresh temporary working repository,
  wrote its report under a new OS temporary path, and left that working
  repository unchanged.

The demo behavior passes. F-2-3 concerns the completeness of its registered
automated proof, not an observed demo failure.

## 4. Claims verification

The repository was cloned with `git clone --no-local` to
`/tmp/api-handoff-review2.XnlrKw/clone`, then installed with `npm ci` (57
packages, zero vulnerabilities). Every literal command in
`.factory/claims.json` ran separately.

| Claim | Result | Evidence |
| --- | --- | --- |
| `repo-gaps` | PASS | Fresh repository produced `SETUP001` and undocumented `WAREHOUSE_ID`. |
| `absent-fixtures` | PASS | Missing configured fixture produced `FIX001`. |
| `workspace-formats` | PASS | Bruno, Postman, `.http`, and all three reference forms were found. |
| `local-free-audit` | PASS | Audit passed while the proxy counter remained zero. |
| `redacted-reports` | PASS | Variable and response-body sentinels were absent from all three formats. |
| `explicit-smoke` | PASS | Named server received one request; redirect destination received none. |
| `target-policy` | PASS | HTTP/HTTPS local configurations were accepted; HTTP staging was rejected. |
| `exit-codes` | PASS | Codes 0, 1, and 2 and parseable JSON stdout were asserted. |
| `cli-demo-isolation` | PASS, incomplete proof | Temp report and unchanged working repository passed; F-2-3 remains. |
| `package-install` | PASS, incomplete proof | Help, version, and demo JSON passed; F-2-3 remains. |
| `build-artifacts` | PASS | Release binary and `dist/site/index.html` were created. |
| `sample-report-content` | PASS | CLI/browser counts, finding, file, and next step matched. |
| `demo-sandbox` | PASS | Reload reset state and request interception saw no third party. |

No command failed. F-2-2 is an unlisted claim; F-2-3 leaves parts of two
listed claims untested. The claims gate therefore does not pass.

## 5. History

Every earlier review, polish report, verification report, and current handoff
was read. Each F-1 finding was checked in both the live site and current code.

| Earlier finding | Current result |
| --- | --- |
| F-1-1 sticky mobile demo banner | Fixed: live scroll check and regression pass. |
| F-1-2 simulated “Mark documented” fix | Fixed: exact config plus recorded rerun. |
| F-1-3 unlisted sample result | Fixed: registered `sample-report-content` passes. |
| F-1-4 Rust 1.85 README promise | Fixed: removed from README. |
| F-1-5 no-checkout promise | Fixed: removed from README. |
| F-1-6 build claims | Fixed: registered `build-artifacts` passes. |
| F-1-7 publishing statement | Fixed: removed from README. |
| F-1-8 negative scope claims | **Not fully fixed:** “hosted workspace” remains on `/privacy`; reopened as F-2-1. |
| F-1-9 undefined “full” | Fixed. |
| F-1-10 vague “small” | Fixed. |
| F-1-11 preflight metaphor | Fixed. |
| F-1-12 metaphorical headline | Fixed. |
| F-1-13 decorative preview number | Fixed. |
| F-1-14 slogan preview heading | Fixed. |
| F-1-15 ambiguous “client” label | Fixed. |
| F-1-16 route social metadata | Fixed in initial HTML and rendered metadata. |

Earlier verification defects are also fixed: mobile terminal output is
focusable, `demo --json` keeps stdout parseable, hashed assets are immutable,
the smoke result contract passes, the clean suite no longer times out, the
dead paid checkout is gone, touch targets pass, response-body redaction is
tested, setup-gap coverage is in the tagged claim, and unknown routes return a
designed HTTP 404 with the full shell.

## 6. Structure, accessibility, and identity

| Check | Result |
| --- | --- |
| Titles | PASS: landing uses “Product — what it does”; Demo, Privacy, Terms, and 404 use route-specific titles under 60 characters. |
| Semantics | PASS: `lang=en`, one h1, `main`, and ordered headings on every route. |
| Metadata | PASS: descriptions, canonicals, OG/Twitter fields, SVG favicon, apple-touch icon, and 1200 × 630 OG image are present. |
| Routing | PASS: direct routes load, Back restores `/demo?demo=1`, and focus moves to its h1. |
| 404 | PASS structurally: an unknown URL returns HTTP 404 with the full shell; copy fails F-2-5. |
| Links | PASS: every crawled HTTP link returned 200; mail links use explicit `mailto:` URLs. |
| Header/footer | PASS on all routes with Privacy, Terms, factory credit, and build id. |
| Accessibility | PASS: zero serious/critical axe issues at 390 × 844 and 1440 × 900; no page overflow; focus and 44 px demo targets pass. |
| Motion | PASS: reduced-motion contexts computed `0.00001s` transitions. |
| Console | PASS on normal routes; the expected failed-document message accompanies the intentional 404 response only. |
| Security/privacy | PASS: CSP, nosniff, referrer, and permissions headers are present; demo requests were same-origin. |
| Asset budget | PASS: production JS is 11.99 kB raw / 4.44 kB gzip. |
| Visual identity | PASS: asymmetric night-market art, self-hosted type, clipped panels, and finding rows are product-specific rather than a generic SaaS template. |

The complete local `npm test` gate passed: TypeScript, 8 Rust tests, 1 Vitest
test, and 30 Playwright tests. The clean-clone `build-artifacts` command also
produced the release binary and `dist/site/`.

## 7. Missed leverage

No additional AI, import/export, or sync feature is required by the brief.
The deterministic repository check does not benefit from sending repository
content to a model. Bruno, Postman, and `.http` import are present; terminal,
JSON, and HTML export are present; exit codes support CI use. No runtime model
key or decorative AI feature exists.

## What would make this perfect

Resolve F-2-1 through F-2-5, then rerun the review from fresh browser contexts
and a fresh clone. A zero-finding result requires accurate privacy wording on
every route, a tagged `--env-file` privacy test, complete assertions for the
two registered packaging/demo claims, direct workflow labels, and a literal
404 heading. Nothing else is currently identified as missing.
