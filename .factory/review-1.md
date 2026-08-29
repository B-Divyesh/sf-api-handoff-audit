# Adversarial first-read review 1 — API Handoff Audit

**Verdict: FAIL**

**Reviewed:** 29 August 2026 UTC  
**Repository:** `38bc73c43052bca99247d1c071adf755bbcdc8ba`  
**Live site:** <https://api-handoff-audit.sociobot.in>  
**Finding count:** 2 blocking, 6 major, 8 minor

The CLI, normal site routes, and listed claims work. The review fails because
the mobile demo loses its sandbox banner, the demo shows a remediation the CLI
did not perform, six public claim groups are absent from `claims.json`, and
the copy and route metadata still have specific defects. PASS requires zero
findings.

## Findings

### Blocking

#### F-1-1 — The demo banner is not persistent on a phone

- **Location:** live `/demo` at 390 px; `site/src/style.css`, mobile rule for
  `.demo-banner`.
- **Exact text:** “Demo — sample data, nothing is saved”.
- **Evidence:** at the top, the banner was visible and 108.8 px high. After
  scrolling, its box began at `y = -392` and was outside the 844 px viewport.
  Computed `position` was `relative`. At 1440 px it remained visible with
  `position: sticky`.
- **Why this fails:** the sandbox contract requires the banner, Reset, and
  Start for real to remain present. A phone visitor can scroll into the report
  and lose the only indication that the controls affect sample state.
- **Concrete fix:** remove the mobile `position: relative` override. Keep the
  banner sticky at 390 px, and add a Playwright assertion that scrolls beyond
  the finding and confirms the banner and both actions remain in the viewport.

#### F-1-2 — The browser demo claims to fix documentation without doing so

- **Location:** live `/demo`, finding action and resulting audit state.
- **Exact text:** button “Mark documented”; after one click, “Ready to hand
  off”, “PASS”, and “No handoff gaps found”.
- **Evidence:** clicking the button changed the in-memory screen from the
  `WAREHOUSE_ID` finding to PASS. No `handoff-audit.toml` content was shown as
  changed, and no audit was run. The real CLI has no command that marks a
  finding documented.
- **Why this fails:** a first-time visitor sees a capability and workflow the
  product does not have. A demo must be an honest sample of the real job, not a
  simulated fix that bypasses the repository edit and rerun.
- **Concrete fix:** replace the action with “Show the corrected config”. Show
  the exact `WAREHOUSE_ID` addition, then show a clearly labelled recorded
  rerun and its PASS report. Do not imply that the CLI edits the repository.
  Keep Reset restoring the original config and finding.

### Major

#### F-1-3 — The sample-result claims are unlisted and not tested as a set

- **Locations and exact text:** landing action note “See a complete audit with
  one real gap”; terminal “3 workspace files scanned · 2 setup steps · 1
  fixture”; demo counts “Files 3”, “Setup steps 2”, “Fixtures 1”, “Smoke
  requests 2”, and “Needs one fix”.
- **Evidence:** no entry in `.factory/claims.json` promises these sample counts
  or browser/CLI parity. `@claim:cli-demo-isolation` checks the project name and
  report location. `@claim:demo-sandbox` checks reset, storage, and requests.
- **Why this fails:** these quantitative statements are part of the evidence a
  visitor uses to understand the output. “Complete” and “real” also overstate a
  deliberately constructed sample.
- **Concrete fix:** change the action note to “See the sample report and its one
  finding.” Add a `sample-report-content` claim whose test asserts the exact
  CLI counts, finding, file, next step, and the same values in `/demo`.

#### F-1-4 — The documented Rust compatibility claim is unlisted

- **Location:** README, Install.
- **Exact text:** “Build the single binary with Rust 1.85 or newer”.
- **Evidence:** `package-install` passed with the worker's current Rust
  toolchain, but no claim entry or test runs the minimum supported 1.85
  toolchain.
- **Why this fails:** a user can rely on the stated minimum and still encounter
  an untested build.
- **Concrete fix:** add a `rust-1-85` claim and CI/test job pinned to Rust 1.85,
  or remove the minimum-version statement and name only the tested toolchain.

#### F-1-5 — The no-checkout statement is absent from the claim registry

- **Location:** README, opening section.
- **Exact text:** “The product does not offer a paid checkout at this time.”
- **Evidence:** `tests/site.spec.ts` checks that the site does not advertise a
  checkout, but `.factory/claims.json` has no corresponding entry.
- **Why this fails:** the sentence is a current product/pricing promise. A test
  outside the registry is not discoverable through the required claim audit.
- **Concrete fix:** add a `no-paid-checkout` entry pointing to the existing
  tagged test after tagging it, or delete this time-sensitive sentence.

#### F-1-6 — The build-output statements are absent from the claim registry

- **Location:** README, Develop and verify.
- **Exact text:** “`npm run build` compiles the release binary and the site.”
  “The deployable site lands in `dist/site/`.”
- **Evidence:** the build passed and produced both outputs, but no claim entry
  owns these two documented outcomes.
- **Why this fails:** these are commands a maintainer will rely on during
  handoff, exactly the risk the product exists to reduce.
- **Concrete fix:** add one `build-artifacts` claim and a tagged test that runs
  the build and asserts the release binary plus `dist/site/index.html`, or move
  the statements into tested contributor documentation outside product claims.

#### F-1-7 — The publishing statement is unlisted and unverified

- **Location:** README, Install.
- **Exact text:** “Publishing is handled by Param Factory; this repository does
  not publish from CI.”
- **Evidence:** there is no matching claim entry or tagged test.
- **Why this fails:** a maintainer may rely on this when deciding whether a
  release action is safe.
- **Concrete fix:** delete the sentence if it is factory-internal information,
  or add a repository-policy claim that checks all workflow files for publish
  steps.

#### F-1-8 — The negative product-scope claim is unlisted

- **Locations:** landing boundary section and README, Privacy and scope.
- **Exact text:** “It does not design APIs, edit requests, or store
  credentials.” README says: “The CLI is not an API designer, request editor,
  hosted workspace, or credential vault.”
- **Evidence:** no claim entry covers these four negative capabilities. The
  `local-free-audit` test observes network traffic during `audit`; it does not
  prove the complete scope sentence.
- **Why this fails:** these boundaries are useful, but the claims contract
  requires each promise to be test-owned or removed.
- **Concrete fix:** split the boundary into claims that can be observed, such
  as the exact command surface and absence of credential writes, and add tagged
  tests. Remove any remainder that cannot be tested.

### Minor

#### F-1-9 — “Full” is an undefined marketing adjective

- **Location:** README, opening section.
- **Exact text:** “The free CLI performs the full local audit and smoke run.”
- **Why this fails:** “full” has no boundary and suggests broader coverage than
  the named checks.
- **Concrete rewrite:** “The free CLI runs local audits and named smoke
  requests.”

#### F-1-10 — “Small” is vague and provides no usable information

- **Location:** README, opening section.
- **Exact text:** “API Handoff Audit is a small Rust CLI for teams that keep API
  requests in Git.”
- **Why this fails:** “small” is an unmeasured adjective. The rest of the
  sentence already defines the product and audience.
- **Concrete rewrite:** “API Handoff Audit is a Rust CLI for teams that keep API
  requests in Git.”

#### F-1-11 — The hero eyebrow uses a metaphor instead of product information

- **Location:** landing hero.
- **Exact text:** “A preflight check for API repositories”.
- **Why this fails:** “preflight” borrows an aviation metaphor and repeats the
  headline without adding a usable fact.
- **Concrete fix:** delete the eyebrow. The headline and audience sentence
  already carry the information.

#### F-1-12 — The headline ends in a metaphor instead of naming the exact job

- **Location:** landing `h1`.
- **Exact text:** “Check an API handoff before it stalls”.
- **Why this fails:** “stalls” describes a mood or possible consequence, while
  the tool actually checks a repository. The meaning is recoverable, so the
  cold-read gate passes, but the heading still violates the no-metaphor rule.
- **Concrete rewrite:** “Check an API repository before handoff”.

#### F-1-13 — The preview label is decorative numbering

- **Location:** landing preview label.
- **Exact text:** “LIVE PREVIEW / 01”.
- **Why this fails:** “01” carries no information, and “live” is inaccurate for
  recorded terminal output.
- **Concrete rewrite:** “Sample CLI output”.

#### F-1-14 — The preview heading is a slogan, not a section name

- **Location:** landing preview `h2`.
- **Exact text:** “See the gap before your teammate does”.
- **Why this fails:** heard alone in a heading list, it does not identify the
  section and frames the teammate as the person who discovers a problem.
- **Concrete rewrite:** “Sample audit finding”.

#### F-1-15 — The boundary label uses an ambiguous term

- **Location:** landing boundary eyebrow.
- **Exact text:** “A checker, not another client”.
- **Why this fails:** “client” can mean an HTTP client, a customer, or a person.
  It makes the reader decode the intended contrast.
- **Concrete rewrite:** “What the audit does not do”.

#### F-1-16 — Route-specific social metadata remains the landing metadata

- **Location:** live `/demo`, `/privacy`, and `/terms`; Open Graph and Twitter
  metadata.
- **Exact text on all three routes:** `og:title` remains “API Handoff Audit —
  check a repository handoff” and `og:description` remains “Find missing API
  variables and setup gaps before a teammate inherits the repository.”
- **Evidence:** the browser title, description, and canonical changed per route,
  but the Open Graph and Twitter values did not.
- **Why this fails:** direct shares of Privacy, Terms, or Demo describe the
  landing page instead of the shared route. Social crawlers commonly read the
  initial document metadata without running the SPA.
- **Concrete fix:** pre-render route-specific HTML or update all Open Graph and
  Twitter title, description, URL, and image fields per route. Add direct-route
  metadata assertions.

## 1. Cold first screen

Fresh contexts were opened without prior storage at 390 × 844 and 1440 × 900.
No scrolling occurred before this interpretation was recorded.

- **What it does, in my words:** checks an API repository for handoff gaps and
  can show a redacted report.
- **For whom:** small engineering teams giving an API workflow to a new
  contributor.
- **What I should click first:** “Try it with sample data”. The adjacent note
  says it opens a sample audit.

All three answers were available on the first screen at both widths. The phone
had no horizontal overflow. This gate passes; F-1-11 through F-1-13 are copy
quality findings rather than cold-read blockers.

## 2. Copy audit

Counting method: hyphenated terms, paths, flags, and numeric values count as one
word; standalone punctuation and decorative symbols do not. Executable command
lines are not sentences, but visible terminal lines, controls, headings,
accessible labels, and sample prose are included. No item exceeds 22 words and
no attached-skill banned word appears.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Skip to main content | 4 | Pass |
| API Handoff Audit home | 4 | Pass |
| Demo | 1 | Pass |
| How it works | 3 | Pass |
| Privacy | 1 | Pass |
| A preflight check for API repositories | 6 | F-1-11: metaphor/redundant label |
| Check an API handoff before it stalls | 7 | F-1-12: metaphor/imprecise job |
| For small teams giving a shared API workflow to a new contributor. | 11 | Pass |
| Try it with sample data | 5 | Pass: result-naming demo action |
| See a complete audit with one real gap. | 8 | F-1-3: unlisted and overstated claim |
| Free local audit. | 3 | Pass: `local-free-audit` |
| No account needed. | 3 | Pass: `local-free-audit` |
| Reports hide variable values. | 4 | Pass: `redacted-reports` |
| API files and checklists hang like signs in a night-market inspection lane. | 12 | Pass: descriptive image alt |
| LIVE PREVIEW / 01 | 3 | F-1-13: decorative/inaccurate label |
| See the gap before your teammate does | 7 | F-1-14: slogan heading |
| The bundled repository contains a request that uses an undocumented variable. | 10 | Pass: `repo-gaps` |
| Recorded terminal output | 3 | Pass |
| parcel-lane / audit | 2 | Pass |
| Replay output | 2 | Pass: result-naming button |
| API Handoff Audit demo output | 5 | Pass |
| $ api-handoff-audit demo | 2 | Pass: command |
| API HANDOFF AUDIT NEEDS WORK | 5 | Pass |
| Parcel Lane API | 3 | Pass |
| 3 workspace files scanned · 2 setup steps · 1 fixture | 9 | F-1-3: unlisted quantitative claim |
| [set] API_TOKEN (secret) | 3 | Pass |
| VAR001 Error: WAREHOUSE_ID is used but not documented. | 8 | Pass: `repo-gaps` |
| Next: Add WAREHOUSE_ID under [[variables]]. | 5 | Pass |
| HTML report: /tmp/api-handoff-audit-demo-…/handoff-report.html | 3 | Pass: `cli-demo-isolation` |
| Three checks, one report | 4 | Pass: useful summary |
| How the handoff audit works | 5 | Pass |
| Scan the repository | 3 | Pass |
| Point the CLI at Bruno, Postman, or `.http` files in Git. | 11 | Pass: `workspace-formats` |
| Name one smoke request | 4 | Pass |
| Choose a configured local or staging target. | 7 | Pass: `target-policy` |
| The CLI sends only that request. | 6 | Pass: `explicit-smoke` |
| Share the redacted report | 4 | Pass |
| Write terminal, JSON, or HTML output without variable values or response bodies. | 12 | Pass: `redacted-reports` |
| A checker, not another client | 5 | F-1-15: ambiguous label |
| Your repository stays the workspace | 5 | Pass |
| The audit reads local text files. | 6 | Pass: `local-free-audit` / `workspace-formats` |
| It has no telemetry and no hosted workspace. | 8 | F-1-8 for “hosted workspace”; telemetry passes `local-free-audit` |
| A smoke run contacts only the target you select. | 9 | Pass: `explicit-smoke` |
| It never follows a redirect. | 5 | Pass: `explicit-smoke` |
| It does not design APIs, edit requests, or store credentials. | 10 | F-1-8: unlisted scope claim |
| API Handoff Audit | 3 | Pass |
| Check an API repository before a teammate inherits it. | 9 | Pass |
| Terms | 1 | Pass |
| Built by Param Factory | 4 | Pass |
| external | 1 | Pass: screen-reader context |
| v0.1.0 · build 2026.08.29 | 3 | Pass |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| API Handoff Audit | 3 | Pass |
| Check an API repository before a teammate inherits it. | 9 | Pass |
| API Handoff Audit is a small Rust CLI for teams that keep API requests in Git. | 16 | F-1-10: vague adjective |
| It finds missing variables, undocumented setup, and absent fixtures. | 8 | Pass: `repo-gaps` / `absent-fixtures` |
| It can run only the smoke requests you name against configured local or staging targets. | 15 | Pass: `explicit-smoke` / `target-policy` |
| Its terminal, JSON, and HTML reports never include variable values or response bodies. | 13 | Pass: `redacted-reports` |
| The free CLI performs the full local audit and smoke run. | 11 | F-1-9: undefined adjective |
| The product does not offer a paid checkout at this time. | 11 | F-1-5: unlisted claim |
| Try the bundled project | 4 | Pass |
| The command copies `examples/parcel-lane` to a temporary directory, audits it, writes a redacted HTML report, and prints its path. | 19 | Pass: `cli-demo-isolation` |
| Nothing is written to your repository. | 6 | Pass: `cli-demo-isolation` |
| The browser demo is available at `https://api-handoff-audit.sociobot.in/demo`. | 8 | Pass |
| Install | 1 | Pass |
| Build the single binary with Rust 1.85 or newer. | 9 | F-1-4: unlisted minimum-version claim |
| The package starts at version `0.1.0`. | 6 | Pass: `package-install` |
| Publishing is handled by Param Factory; this repository does not publish from CI. | 13 | F-1-7: unlisted claim |
| Configure a repository | 3 | Pass |
| Create `handoff-audit.toml` at the repository root. | 6 | Pass |
| Parcel Lane API | 3 | Pass: sample value |
| Copy `.env.example` to `.env.handoff` | 4 | Pass: sample setup step |
| Run `npm run dev` | 4 | Pass: sample setup step |
| A staging token from the API owner | 7 | Pass: sample description |
| A small order body | 4 | Pass: sample description |
| Request files use a plain HTTP format. | 7 | Pass |
| The scanner also reads Bruno `.bru` files and Postman collection JSON. | 11 | Pass: `workspace-formats` |
| It recognizes `{{NAME}}`, `${NAME}`, and `$dotenv NAME` variable references. | 9 | Pass: `workspace-formats` |
| Audit and run | 3 | Pass |
| Audit without sending a request | 5 | Pass: `local-free-audit` |
| Run one named request against a configured target | 8 | Pass: `explicit-smoke` |
| `run` requires both `--target` and `--smoke`. | 6 | Pass: `exit-codes` invalid-input case |
| The target must exist under `[targets.local]` or `[targets.staging]`. | 8 | Pass: `target-policy` |
| Local targets accept `http` or `https`; staging targets require `https`. | 10 | Pass: `target-policy` |
| The CLI never follows redirects to a different host. | 9 | Pass: `explicit-smoke` |
| Exit codes are `0` for pass, `1` for audit findings or a failed smoke response, and `2` for invalid input or configuration. | 22 | Pass: `exit-codes` |
| Add `--json` as shorthand for JSON on stdout. | 8 | Pass: `exit-codes` |
| Develop and verify | 3 | Pass |
| `npm run build` compiles the release binary and the site. | 10 | F-1-6: unlisted build claim |
| The deployable site lands in `dist/site/`. | 6 | F-1-6: unlisted build claim |
| `cargo package --allow-dirty` checks the ready-to-publish crate. | 7 | Pass: exercised by `package-install` |
| Privacy and scope | 3 | Pass |
| Audit reads local text files and does not use telemetry. | 10 | Pass: `local-free-audit` / `workspace-formats` |
| Smoke runs send the selected request to the configured target. | 10 | Pass: `explicit-smoke` |
| Reports show variable names and states, but never their values. | 10 | Pass: `redacted-reports` / `workspace-formats` |
| The CLI is not an API designer, request editor, hosted workspace, or credential vault. | 14 | F-1-8: unlisted scope claim |
| The product site has privacy and terms pages. | 8 | Pass: live crawl |
| The MIT license is in `LICENSE`. | 6 | Pass: repository inspection |

## 3. Demo and sandbox

- One click from the first screen opened `/demo`.
- The first demo screen showed Parcel Lane API, “Needs one fix”, four report
  counts, a repository tree, and the report panel. This is realistic sample
  data, not lorem ipsum.
- The exact finding was `WAREHOUSE_ID is used but not documented` in
  `requests/create-order.http`, with a concrete config change.
- Reset restored the original finding after the in-memory state changed.
- Reload also restored the finding.
- Local storage and session storage stayed empty. Source and tests confirm no
  IndexedDB or OPFS use.
- Every observed landing/demo request used
  `https://api-handoff-audit.sociobot.in`; no third-party request occurred.
- “Start for real” returned to `/` and discarded demo state.
- `cargo run --quiet --manifest-path <clean-clone>/Cargo.toml -- demo` was run
  from an empty temporary directory. It printed an HTML path under a new
  `/tmp/api-handoff-audit-demo-*` directory and left the working directory
  empty.
- F-1-1 and F-1-2 keep this section from passing.

## 4. Claims verification

The repository was cloned with `git clone --no-local` into a fresh temporary
directory and installed with `npm ci` (57 packages, zero vulnerabilities).
Every command named in `.factory/claims.json` was run separately.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `repo-gaps` | PASS | Found `SETUP001` and `VAR001` in a fresh repository. |
| `absent-fixtures` | PASS | Found `FIX001` for the absent configured fixture. |
| `workspace-formats` | PASS | Report contained variables from Bruno, Postman JSON, `.http`, and `$dotenv`. |
| `local-free-audit` | PASS | Audit passed and the loopback proxy counted zero requests. |
| `redacted-reports` | PASS | Secret and response sentinels were absent from terminal, JSON, and HTML reports. |
| `explicit-smoke` | PASS | Named server received one request; redirect destination received zero. |
| `target-policy` | PASS | HTTP/HTTPS local attempts were accepted for execution; HTTP staging was rejected with exit 2. |
| `exit-codes` | PASS | Pass, finding/failed smoke, invalid input/config, and JSON stdout assertions passed. |
| `cli-demo-isolation` | PASS | Report was in a new temp directory and the working repository was unchanged. |
| `package-install` | PASS | Packaged crate installed one binary; help, version 0.1.0, and demo JSON passed. |
| `demo-sandbox` | PASS | Browser state reset, storage remained empty, and the local test site made no outside request. |

No listed claim test failed. F-1-3 through F-1-8 identify public claims that
are not listed, so the claim inventory is still incomplete.

## 5. History

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist.
`.factory/handoff.md` reported a PASS at candidate `df7ed2c`. Its stated 8 Rust,
1 Vitest, and 26 Playwright results were reproduced from the clean clone. The
listed-claim results, build output, CLI demo isolation, route shell, link crawl,
same-origin request behavior, asset budget, and axe result were also
reconfirmed. There were no earlier finding IDs to retest. This review's
findings are omissions from that handoff, not claimed prior fixes that
regressed.

## 6. Structure, access, and identity

| Check | Result |
| --- | --- |
| Per-route `<title>` after SPA navigation | PASS: landing, Demo, Privacy, Terms, and 404 use the required pattern and stay under 60 characters. |
| One `h1`, `main`, `lang=en`, heading order | PASS on all five routes. |
| Description and canonical | PASS after render on every route. |
| Open Graph and Twitter metadata | FAIL: F-1-16. |
| SVG favicon, apple-touch icon, 1200 × 630 OG image | PASS; all returned 200. |
| `robots.txt` and `sitemap.xml` | PASS; sitemap lists `/`, `/demo`, `/privacy`, and `/terms`. |
| Designed 404 | PASS; an unknown URL returned HTTP 404 with the complete product shell and a route home. |
| Deep links, History API, back button, route focus | PASS; Demo navigation and Back focused the new `h1`. |
| Link crawl | PASS; all HTTP links returned 200 and both `mailto:` links were valid explicit schemes. |
| Header/footer consistency | PASS on every route, including 404. |
| Keyboard and touch | PASS in the full suite; skip link, Enter activation, focus styles, and tested 44 px targets passed. |
| Accessibility scan | PASS; live axe scans reported zero serious or critical issues on all routes. |
| Reduced motion | PASS; computed transition and animation durations were `0.00001s`. |
| Console | PASS on normal routes; no console errors were observed. |
| Initial code weight | PASS; production JS was 4.23 kB gzip and CSS was 4.06 kB gzip. |
| Visual identity | PASS; the asymmetric night-market inspection board, generated product art, type, clipped panels, and finding rows are distinct from a generic SaaS template. |

The expected 404 document response causes Chromium to report the failed
document status while loading an unknown URL; no script, asset, CSP, or runtime
error was present.

## 7. Missed leverage

No missing AI, import/export, or sync feature is recorded. The brief calls for
a local repository audit, explicit smoke run, and redacted report. Those jobs
are present. JSON and HTML provide export, the scanner imports the three named
request formats, and an AI step would add secret-handling and network cost
without improving the core deterministic check.

## What would make this perfect

Resolve F-1-1 through F-1-16, then rerun this entire review from a fresh clone
and fresh browser contexts. A perfect result keeps the sandbox banner visible
on a phone, demonstrates the real edit-and-rerun workflow, has one tagged test
for every remaining public claim, removes all metaphor and decorative copy,
and serves route-correct social metadata. Nothing else is currently identified
as missing.
