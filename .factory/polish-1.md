# Polish 1 — finding resolution map

**Base review:** `.factory/review-1.md` (`274dc684f5acf47e568de7a1857d59c02ed19640`)
**Repair commits:** `3e9c281a70ff2e0afada5ee2842b02841c915555`, `87f8a81e2f785215ba74420d0215f91098cb1bda`
**Live:** <https://api-handoff-audit.sociobot.in>

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept `.demo-banner` sticky at phone widths; retained both banner controls. | `?demo=1 opens the isolated sample directly...`; live 390px scroll check; `.factory/evidence/polish-1/demo/screenshot-mobile.png` |
| F-1-2 | Replaced “Mark documented” with “Show the corrected config”; shows the exact TOML addition and a labelled recorded CLI rerun. | `@claim:demo-sandbox`; live demo flow check at `/?demo=1` |
| F-1-3 | Rewrote the note as “See the sample report and its one finding”; registered and tested exact sample counts, finding, file, and next step. | `@claim:sample-report-content`; live `/demo?demo=1` |
| F-1-4 | Removed the unverified Rust 1.85 minimum from README. | README copy audit; clean-clone claim run |
| F-1-5 | Removed the time-sensitive no-checkout statement rather than leave an unowned pricing claim. | README copy audit; checkout absence regression |
| F-1-6 | Added `build-artifacts` to `claims.json` and a real clean-build assertion for the binary and `dist/site/index.html`. | `@claim:build-artifacts` from clean clone |
| F-1-7 | Removed factory-internal publishing wording from public README. | README copy audit |
| F-1-8 | Removed untestable negative capability promises; remaining scope text is claim-owned observable behavior. | README and landing copy audit; `local-free-audit` |
| F-1-9 | Rewrote “full local audit” as “runs local audits and named smoke requests.” | README copy audit |
| F-1-10 | Removed vague “small” from the product description. | README copy audit |
| F-1-11 | Removed the hero’s preflight eyebrow. | live `/`; `.factory/evidence/polish-1/home/screenshot-desktop.png` |
| F-1-12 | Rewrote the h1 to “Check an API repository before handoff.” | first-screen mobile test; live `/` |
| F-1-13 | Replaced “LIVE PREVIEW / 01” with “Sample CLI output.” | live `/`; home screenshots |
| F-1-14 | Replaced slogan heading with “Sample audit finding.” | live `/`; home screenshots |
| F-1-15 | Replaced ambiguous label with “What the audit does not do.” | live `/`; home screenshots |
| F-1-16 | Added prerendered `demo.html`, `privacy.html`, and `terms.html` with route-specific OG/Twitter/canonical URLs; SPA also updates those tags on navigation. | direct-route metadata regression; live curl checks for `/demo`, `/privacy`, `/terms` |

## Earlier verification regressions rechecked

The previous verification reports recorded keyboard access to horizontal
terminal output, JSON-only CLI stdout, immutable hashed assets, and a real
404 as prior repair work. They remain covered by `npm test` and were rechecked
live: mobile axe reports zero serious/critical issues, the hashed JS returns
`Cache-Control: public, max-age=31536000, immutable`, and `/missing-stall`
returns 404. `@claim:package-install` parses `demo --json` from a clean
packaged consumer.

## Production recheck

`verify-url.sh` produced no console errors and confirmed title, `lang`, one
`h1`, `main`, and image alt text on cold landing and demo loads. Live axe
covered `/`, `/demo?demo=1`, `/privacy`, `/terms`, and `/missing-stall` at
390px. Lighthouse mobile scored performance 100 and accessibility 100.
