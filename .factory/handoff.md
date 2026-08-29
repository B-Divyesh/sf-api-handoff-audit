# API Handoff Audit — polish 2 handoff

**Status:** PASS — no outstanding review findings
**Product repair commit:** `824bcac7e1b5212bd34faaa2b6851813accbef1f`
**Live URL:** <https://api-handoff-audit.sociobot.in>
**Deployed:** 2026-08-29 UTC

## What changed

- Closed every finding in `.factory/review-1.md` and `.factory/review-2.md`.
- Rewrote the privacy route to distinguish local audits from smoke requests,
  removed the untestable hosted-workspace statement, and added a real
  `--env-file` claim with sentinel-redaction coverage.
- Completed the demo and package claim proofs: copied bundled files are now
  compared byte-for-byte, and packaged installation must contain exactly one
  binary.
- Replaced the remaining indirect landing labels and market-lore 404 wording
  without changing the night-market visual system.
- Captured live evidence under `.factory/evidence/polish-2/`. The detailed
  finding-to-evidence matrix is `.factory/polish-2.md`.

## Verification

Fresh clone: `/tmp/api-handoff-audit-polish2.ah1IpF/clone`

```sh
npm ci
# every literal command in .factory/claims.json, individually
npm test
npm run build
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

All 14 registered claim commands passed from that clean clone, followed by the
full suite: TypeScript check, 8 Rust tests, 1 Vitest test, and 31 Playwright
tests. The build produced `target/release/api-handoff-audit` and `dist/site/`.
`cargo package --allow-dirty` passed (16 files; 87.6 KiB / 25.9 KiB compressed).

Post-deploy, `verify-url.sh` passed on the landing page. Live axe checks found
zero serious or critical violations on `/`, `/demo?demo=1`, `/privacy`,
`/terms`, and `/missing-stall`. The live demo check confirmed a sticky phone
banner, correction/reset behavior, zero local/session storage, and only
same-origin requests. Initial JavaScript is 11.95 kB raw / 4.42 kB gzip; CSS
is 15.51 kB raw / 4.16 kB gzip.

## Run and release

```sh
npm ci
npm test
npm run build
cargo run -- demo
```

`npm run build` writes the deployable static site to `dist/site/`. Publish the
crate only through the factory-owned release process; the ready-to-publish
check is `cargo package --allow-dirty`.

## Known gaps

None. The product remains a local Rust CLI with a static documentation/demo
site; it intentionally has no account, backend, analytics, billing, or
service worker.
