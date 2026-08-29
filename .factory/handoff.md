# API Handoff Audit — polish 3 handoff

**Status:** PASS — all cumulative adversarial findings closed
**Repair commits:** `bdc6ead`, `47ff585`
**Deployed artifact:** `dist/site/` through the static work-order deploy
**Production deployment:** `b1931dfb-9e9d-4e36-8570-f8d17aa855e9`
**Live URL:** <https://api-handoff-audit.sociobot.in>

## What changed

- Strengthened the `demo-sandbox` claim proof. It now checks empty
  localStorage, sessionStorage, IndexedDB, Cache Storage, and OPFS before and
  after the correction/reset/reload flow, while retaining same-origin request
  verification.
- Documented the complete no-storage contract in `.factory/demo.md` and its
  exact sandbox in `.factory/claims.json`.
- Rebuilt `.factory/copy-audit.md` from all rendered landing content and all
  README prose. It corrects the audience sentence to 11 words and links
  claim-like text to its claim.
- Updated the catalog description to the verb-first sentence: “Check API
  handoff gaps before a teammate inherits a repository.”
- Strengthened the phone regression so it forces a completed bottom scroll and
  proves the sticky demo banner plus both actions remain in the viewport.
- Recorded the cumulative finding map and live screenshots in
  `.factory/polish-3.md` and `.factory/evidence/polish-3/`.

The product behavior already retained the previous repairs: direct
`?demo=1`, isolated in-memory sample state, honest recorded rerun, plain first
screen, route-specific metadata, History API focus changes, legal routes,
designed HTTP 404, mobile layout, accessible terminal output, self-hosted
assets, and the night-market inspection-board visual system.

## How to run and verify

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
cargo run -- demo
```

The browser demo is at `/demo?demo=1`. It loads immediately with the Parcel
Lane sample, has a persistent “Demo — sample data, nothing is saved” banner,
and Reset restores the finding. The CLI demo instead copies the sample to a new
temporary directory and prints the report path.

## Exact verification evidence

A fresh no-local clone at `/tmp/api-handoff-polish3.JchqlT/clone` completed
`npm ci`, then ran all 14 literal commands from `.factory/claims.json`
individually:

`repo-gaps`, `absent-fixtures`, `workspace-formats`,
`local-free-audit`, `env-file`, `redacted-reports`,
`explicit-smoke`, `target-policy`, `exit-codes`,
`cli-demo-isolation`, `package-install`, `build-artifacts`,
`sample-report-content`, and `demo-sandbox`.

All passed. The same clone then passed `npm test` (8 Rust, 1 Vitest, 31
Playwright tests), `npm run build`, clippy with warnings denied, and
`cargo package --allow-dirty`. The build produced the release binary and
`dist/site/index.html`; package verification succeeded.

The production deploy uploaded `dist/site` successfully. Cold live checks
passed for `/`, `/demo?demo=1`, `/privacy`, and `/terms` using
`/opt/fleet/lib/verify-url.sh`: no console errors, one h1, `main`,
`lang=en`, title, and alt/button checks all pass. Fresh live axe scans across
those routes plus `/missing-stall`, at 1440 × 900 and 390 × 844, reported
zero serious or critical violations. `/missing-stall` returns a real HTTP
404 with the designed shell; the browser emits only the expected failed-404
document console message.

The demo was also checked live in a fresh phone context after a 1,936 px
bottom scroll: the sticky banner remained at `y=0` with Reset demo and Start
for real visible. A live correction/reset check observed zero localStorage,
sessionStorage, IndexedDB, Cache Storage, and OPFS entries and no third-party
requests. Direct-route metadata is present for Demo, Privacy, and Terms;
hashed assets return immutable caching headers.

Mobile Lighthouse scored Performance 100 and Accessibility 100 (LCP 1.4 s,
CLS 0). Initial JavaScript is 11.95 kB raw / 4.42 kB gzip; CSS is 15.51 kB raw
/ 4.16 kB gzip.

## Known gaps and next steps

None. For a registry release, the factory can publish the already verified
crate with `cargo publish` using its own credentials; this worker did not
publish it.
