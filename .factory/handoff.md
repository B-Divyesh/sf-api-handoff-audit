# API Handoff Audit — polish 1 handoff

**Status: PASS**
**Repair commits:** `3e9c281a70ff2e0afada5ee2842b02841c915555`, `87f8a81e2f785215ba74420d0215f91098cb1bda`
**Deployed URL:** <https://api-handoff-audit.sociobot.in>

This repair resolves every finding in `.factory/review-1.md`, including the
two blockers, six major items, and eight minor copy/metadata items. The CLI
remains a Rust clap binary; the companion is still a static Vite site.

## What changed

- The one-click sample path is `/demo?demo=1` and `?demo=1` also enters it
  directly. Its sticky mobile banner includes Reset demo and Start for real.
- The sample no longer pretends to edit a repository. It shows the exact
  `WAREHOUSE_ID` configuration change and labels the successful output as a
  recorded rerun after that user-made edit.
- Added claim-owned sample parity and build-output tests, removed unsupported
  README/scope assertions, and rewrote the first screen in plain language.
- Added static direct-route documents for Demo, Privacy, and Terms so their
  initial Open Graph/Twitter metadata is route-specific. The real 404 remains
  a full product-shell page.
- Preserved the repository-night-market identity, self-hosted assets, CSP,
  and static deployment class.

## Verification

- Fresh clone: `npm ci`, then every one of the 13 commands in
  `.factory/claims.json` was run independently; all passed. This includes the
  packaged-consumer install (1.5 min) and clean build-artifact claim (1.5 min).
- Local: `npm test` passed — TypeScript check, 8 Rust tests, 1 Vitest test,
  and 30 Playwright tests in 1.7 min. `npm run build` produced the release
  binary and `dist/site/`.
- Package quality: `cargo fmt --all -- --check`,
  `cargo clippy --all-targets -- -D warnings`, and
  `cargo package --allow-dirty` passed (16 files, 87.5 KiB / 25.9 KiB
  compressed).
- Production: `/opt/fleet/lib/verify-url.sh` passed for `/` and `/demo?demo=1`.
  Screenshots: `.factory/evidence/polish-1/home/screenshot-desktop.png`,
  `.factory/evidence/polish-1/home/screenshot-mobile.png`,
  `.factory/evidence/polish-1/demo/screenshot-desktop.png`, and
  `.factory/evidence/polish-1/demo/screenshot-mobile.png`.
- Final deployed-tree cold check also passed at
  `.factory/evidence/polish-1/final/screenshot-desktop.png` and
  `.factory/evidence/polish-1/final/screenshot-mobile.png`.
- Production routes `/`, `/demo`, `/privacy`, and `/terms` returned 200;
  `/missing-stall` returned HTTP 404. Mobile axe on those routes and the 404
  found zero serious/critical issues. The demo request log contained only the
  product origin.
- Mobile Lighthouse at
  `.factory/evidence/polish-1/lighthouse-mobile.json`: performance 100,
  accessibility 100, FCP 0.8 s, LCP 1.3 s, TBT 0 ms, CLS 0. Initial JS/CSS
  gzip sizes are 4,467 B and 4,150 B.

## Run and deploy

```sh
npm ci
npm test
npm run build
cargo run -- demo
```

The static deployment work-order command is `npm ci && npm run build:site`;
the deployable directory is `dist/site/`. The ready-to-publish CLI package is
checked with `cargo package --allow-dirty`; publishing is not performed here.

## Known gaps

None.
