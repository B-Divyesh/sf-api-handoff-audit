# Independent verification 3 — FAIL

**Candidate:** `ef1c59b4e5f7b2e7187fa5c952d9e1645fefa4ff`

**Verified URL:** <https://api-handoff-audit.sociobot.in>

**Date:** 2026-08-29 UTC

**Verdict:** **FAIL — do not release**

The repaired CLI and live site work for the core handoff job, and the live files
match this candidate. The candidate still fails the supplied claims contract:
one declared claim test does not exercise all of its claim, and the README has
functional promises absent from `.factory/claims.json`.

## First-read gate

**Pass.** A cold live page says “Check an API handoff before it stalls,” names
small teams handing an API workflow to a new contributor, and shows “Try it
with sample data” in the initial viewport. The action opens `/demo` in one
click. The adjacent text explains that it shows a complete audit with one real
gap.

## Mandatory claim commands

The checkout started clean at the candidate commit. After `npm ci`, every exact
command in `.factory/claims.json` passed independently:

| Claim | Result | Observed evidence |
| --- | --- | --- |
| `repo-gaps` | pass | CLI demo reports `VAR001`, `WAREHOUSE_ID`, and `requests/create-order.http`. |
| `workspace-formats` | pass | Bruno, Postman JSON, and `.http` references were each found. |
| `local-free-audit` | pass | Audit passed while loopback HTTP/HTTPS proxies recorded zero requests. |
| `redacted-reports` | pass | Secret and response-body sentinels were absent from terminal, JSON, and HTML reports. |
| `explicit-smoke` | pass | Exactly one named request was sent and its redirect was not followed. |
| `demo-sandbox` | pass | Browser demo reset on reload, stored nothing, and made only same-origin requests. |

The literal commands are all `npm run test:e2e -- --grep @claim:<id>`. The
first cold command spent 1.3 minutes compiling the Rust binary; the remaining
claim runs completed in 2.6–3.8 seconds.

Passing command status does not satisfy the content requirement by itself.
`tests/claims.spec.ts:23` only asserts the undocumented `WAREHOUSE_ID` and its
file. It does not create or assert a setup gap, although the `repo-gaps` claim
also promises setup-gap detection. The bundled demo has two documented setup
steps. A separate Rust unit test covers an empty setup list, but it is not the
one tagged demo claim test required by the claims contract.

The README also promises detection of absent fixtures, exact exit codes
`0`/`1`/`2`, recognition of `$dotenv NAME`, and that the CLI demo writes only
to a temporary directory. None has its own entry in `.factory/claims.json`.
Some behavior is covered elsewhere, but the supplied contract requires every
visitor-facing claim to be listed and proven by its declared sandbox test.

## Clean checkout, build, and package

- `npm ci`: pass; 57 packages installed, 0 vulnerabilities.
- `npm test`: pass — TypeScript, 8 Rust tests, 1 Vitest test, and 21 Playwright
  tests. The fresh packaged-consumer test passed in 2.6 minutes under its
  3-minute test ceiling.
- `npm run build`: pass; release CLI and `dist/site/` produced.
- `cargo fmt --all -- --check`: pass.
- `cargo clippy --all-targets -- -D warnings`: pass.
- `cargo package --allow-dirty`: pass; 16 files, 87.7 KiB unpacked and 26.0
  KiB compressed.
- Independent consumer: extracted the `.crate` under a new `/tmp` directory,
  ran `cargo install --path ... --root ...`, then verified version `0.1.0` and
  parsed `demo --json` as one JSON value. The report path remained on stderr.

## Independent CLI exercise

A temporary repository and loopback server exercised a POST with a header,
body, `${ORDER_ID}`, `{{API_TOKEN}}`, fixture, two accepted statuses, and an
environment file. Exactly one request arrived at `/orders/42`; HTTP 201
produced `smoke_result.status: "PASS"` and exit 0. The JSON report omitted both
the secret and the server's response-body sentinel.

Recovery and boundaries behaved as documented:

- timeout `0`, an unknown smoke name, malformed env input, and an HTTP staging
  target returned exit 2 with actionable errors;
- a request path outside the repository was rejected by the audit and returned
  exit 1;
- `--help`, `--version`, and `demo --json` were non-interactive and usable;
- the generated shareable HTML report had a title, `lang=en`, one `h1`, one
  `main`, no console errors, no mobile overflow, and zero serious/critical axe
  findings at desktop and 390 px.

## Live deployment and privacy

The live `index.html`, hashed JS, hashed CSS, both hero images, Open Graph art,
favicon, standalone 404, robots, and sitemap are byte-for-byte equal to the
fresh candidate build. The principal hashes are:

- JS `index-D9SE1PEe.js`:
  `af7242c2d205110047660125edea829fc66367d92e96d2cbdf359aae258ba582`
- CSS `index-CyieNWfr.css`:
  `e966e8ea7465c7e92b5b9abc1d0b2a006ecaa93213af3214f260aff3f158aa5c`
- `index.html`:
  `f9eaf295e7ace7ceba2f154c3e09b97ef30b0a7a919e7cd6bb1b79cadcf2b118`

Fresh desktop and 390 × 844 contexts checked `/`, `/demo`, `/privacy`,
`/terms`, `/404`, and an unknown route. The main app routes have one `h1`, one
`main`, route-specific titles, no page/console/request errors, no horizontal
overflow, no missing image alt, no controls below 44 × 44 px, and zero
serious/critical axe violations. All crawled internal and factory links return
200; mail links are explicit.

The keyboard sequence starts with the skip link. Every sampled focus state has
a visible 3 px cyan outline with 4 px offset. Enter opens the demo, route focus
moves to the new `h1`, Space activates “Mark documented,” and the terminal is
focusable. Reduced motion shortens motion to `0.01ms` and stops repeated
animation.

The complete demo flow—load, mark documented, reset, mark again, reload, and
start for real—made only same-origin requests. `localStorage` and
`sessionStorage` remained empty, and reload restored the sample gap. The page
does not register a service worker and makes no offline/PWA claim.

Live headers include CSP with `frame-ancestors 'none'`, HSTS, nosniff,
referrer policy, and permissions policy. The document is short-cached for 30
seconds. Hashed assets return `Cache-Control: public, max-age=31536000,
immutable`. The CSP permits connections and forms only to self.

This is a static site with no product API, unlock endpoint, sign-in, or
backend. Rate-limit, persistence/concurrency, and Entra checks are therefore
not applicable. There is no paid checkout advertised.

## Performance

Mobile first-load transfer measured 81,529 bytes across the two fonts, JS,
CSS, and 768 px hero image. Budgets pass:

- JS: 10,670 bytes raw / 4,223 bytes gzip;
- CSS: 14,990 bytes raw / 4,056 bytes gzip;
- fonts: 27,992 bytes total;
- mobile hero: 43,672 bytes; desktop hero: 107,972 bytes.

Lighthouse 12.8.2 mobile against the live URL scored 99 performance, 100
accessibility, 100 best practices, and 100 SEO. Lab metrics were FCP 0.9 s,
LCP 1.4 s, total blocking time 150 ms, CLS 0, and speed index 0.9 s. Lab
Lighthouse did not report INP.

## Release-blocking defects

### High — claims inventory and declared proof are incomplete

The tagged `repo-gaps` test can pass when setup-gap detection is broken because
it proves only an undocumented variable. The README also makes multiple
functional promises with no claims entries, including absent-fixture detection
and the exact exit-code contract. This violates the supplied “every claim is a
test” policy; that policy explicitly makes unlisted or unproved claims a failed
review.

Repair by auditing landing and README claims, giving each claim one registry
entry, and making each exact tagged sandbox test assert every promised outcome.
At minimum, add a missing-setup fixture to `repo-gaps` (or split the claim) and
register/prove fixture detection, exit codes, syntax recognition, and CLI demo
isolation.

## Other defects

### Medium — unknown URLs are soft 404s and direct `/404` has a different shell

`GET /missing-stall` returns HTTP 200 because `navigationFallback` serves the
SPA, although the client renders the not-found view. `GET /404` also returns
200 but resolves directly to the 436-byte standalone `404.html`, not the SPA
route: it has no standard header, footer, skip link, canonical, description,
or build ID. In-app navigation to `/404` renders the full shell, so direct load
and client navigation disagree. This does not meet the supplied real-404 and
consistent-route skeleton requirements.

Define the known SPA routes explicitly and allow unknown paths to reach a real
404 response override, or otherwise return status 404 while preserving the
same accessible shell and metadata on direct load.

## Re-verification required

1. Complete the claims registry and make every exact claim command prove its
   whole claim from the demo sandbox.
2. Make direct and client-side 404 behavior consistent and return a real 404
   for unknown URLs.
3. Re-run all claim commands first, then `npm test`, the exact build, clean
   package install, live hash comparison, mobile axe, privacy request log,
   headers, and Lighthouse.
