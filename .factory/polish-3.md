# Polish 3 — final adversarial closure

**Repair commits:** `bdc6ead` (storage-proof and copy-audit repair), `47ff585`
(completed phone-scroll assertion)  
**Deployed artifact:** static `dist/site`  
**Production deployment:** `b1931dfb-9e9d-4e36-8570-f8d17aa855e9`
**Live URL:** <https://api-handoff-audit.sociobot.in>  
**Evidence directory:** `.factory/evidence/polish-3/`

The review history in `.factory/review-1.md`, `.factory/review-2.md`, and
`.factory/review-3.md`, plus both earlier polish records, was reread before
repair. Every current and historical finding is closed below.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The direct `?demo=1` path keeps the amber demo banner sticky. The test now disables smooth scrolling, reaches a real 1,936 px bottom scroll, and asserts both controls remain in the 390 px viewport. | `?demo=1 opens the isolated sample directly…`; `evidence/polish-3/demo/sticky-banner-mobile.png`; live <https://api-handoff-audit.sociobot.in/demo?demo=1>. |
| F-1-2 | The sample shows the exact TOML addition and labels the result a recorded CLI rerun. It never says the CLI edited the repository. | `@claim:demo-sandbox`; `evidence/polish-3/demo/screenshot-desktop.png`; live correction/reset flow at <https://api-handoff-audit.sociobot.in/demo?demo=1>. |
| F-1-3 | The first-screen note names a sample report and its one finding. The registered browser/CLI parity claim owns all sample counts and the finding. | `@claim:sample-report-content`; `evidence/polish-3/home/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-4 | Removed the unverified Rust 1.85 minimum statement. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-desktop.png`; live README source at the repository URL. |
| F-1-5 | Removed the unowned no-checkout statement and retained a checkout-absence regression. | `does not advertise a checkout`; `evidence/polish-3/home/screenshot-desktop.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-6 | `build-artifacts` remains registered and verifies both the release binary and `dist/site/index.html`. | `@claim:build-artifacts`; `evidence/polish-3/home/verify.json`; deployed static artifact at the live URL. |
| F-1-7 | Removed the factory-internal publishing statement from public README copy. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-desktop.png`; live repository README. |
| F-1-8 | Scope text is now limited to observable local auditing, redaction, and target-bound smoke requests. | `@claim:local-free-audit`, `@claim:explicit-smoke`; `evidence/polish-3/privacy/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in/privacy>. |
| F-1-9 | Replaced “full” with named local audits and smoke requests. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-desktop.png`; live README. |
| F-1-10 | Removed vague “small” product wording. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-desktop.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-11 | Removed the preflight metaphor from the first screen. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-12 | The h1 directly names the job: “Check an API repository before handoff.” | `the first screen fits a 390px phone…`; `evidence/polish-3/home/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-13 | The preview label is “Sample CLI output,” with no decorative sequence number. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-14 | The preview heading is the plain section name “Sample audit finding.” | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-15 | The boundary section uses “What the audit does not do” and “Where repository data goes.” | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-desktop.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-1-16 | Direct Demo, Privacy, and Terms documents retain their own title, description, canonical, Open Graph, and Twitter metadata. | `direct route documents have their own social metadata before JavaScript runs`; `evidence/polish-3/{demo,privacy,terms}/index.html`; live `/demo`, `/privacy`, and `/terms` source checks. |
| F-2-1 | Privacy now distinguishes local auditing from a smoke request sent only to the chosen target, and does not claim a hosted workspace. | `@claim:local-free-audit`, `@claim:explicit-smoke`; `evidence/polish-3/privacy/screenshot-desktop.png`; live <https://api-handoff-audit.sociobot.in/privacy>. |
| F-2-2 | The `env-file` claim reads a chosen file and proves its sentinel value is absent from terminal, JSON, and HTML output. | `@claim:env-file`; `evidence/polish-3/privacy/screenshot-mobile.png`; live privacy copy at <https://api-handoff-audit.sociobot.in/privacy>. |
| F-2-3 | CLI-demo proof byte-compares every copied sample file; package proof asserts exactly one installed binary. | `@claim:cli-demo-isolation`, `@claim:package-install`; `evidence/polish-3/demo/screenshot-desktop.png`; live browser demo at <https://api-handoff-audit.sociobot.in/demo?demo=1>. |
| F-2-4 | The workflow label is “Three steps” and the data-flow heading is “Where repository data goes.” | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in>. |
| F-2-5 | The real HTTP 404 uses “Page not found,” supplies a return link, and keeps the full shell. | `direct not-found navigation…`, `unknown routes show…`; `evidence/polish-3/404/screenshot-mobile.png`; live <https://api-handoff-audit.sociobot.in/missing-stall> returns HTTP 404. |
| F-3-1 | `demo-sandbox` now snapshots localStorage, sessionStorage, the full IndexedDB database list, Cache Storage keys, and OPFS entries before correction, after correction, after Reset, and after reload. All must be empty; the request listener remains. | `@claim:demo-sandbox keeps all browser storage empty…`; `evidence/polish-3/demo/screenshot-mobile.png`; fresh live context reported local/session/IndexedDB/Cache/OPFS counts of 0 at <https://api-handoff-audit.sociobot.in/demo?demo=1>. |
| F-3-2 | Replaced the partial audit with a complete landing/README inventory, corrected the audience count to 11, added terminal, workflow, footer, accessibility labels, README prose, claim links, and terminology. | `.factory/copy-audit.md`; `evidence/polish-3/home/screenshot-desktop.png`; live first screen at <https://api-handoff-audit.sociobot.in>. |

## Verification

A no-local clone at `/tmp/api-handoff-polish3.JchqlT/clone` ran `npm ci`,
then each of the 14 literal commands listed in `.factory/claims.json`
individually. Every claim passed. The same clone then passed:

```sh
npm test
npm run build
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

That run covered 8 Rust tests, 1 Vitest test, and 31 Playwright tests. The
release build produced `target/release/api-handoff-audit` and `dist/site/`;
the packaged crate was 87.6 KiB (25.9 KiB compressed).

After deployment, `verify-url.sh` passed cold production loads for `/`,
`/demo?demo=1`, `/privacy`, and `/terms`: each had no console errors,
one h1, a main landmark, `lang=en`, a route-specific title, and complete
image/button labelling. Fresh Chromium contexts ran axe at 1440 × 900 and
390 × 844 on those four routes plus `/missing-stall`; every scan had zero
serious or critical violations. The intentionally HTTP-404 document produces
the browser's expected failed-document console message and no other error.

The live hashed JavaScript response has `Cache-Control: public,
max-age=31536000, immutable`. Mobile Lighthouse measured Performance 100 and
Accessibility 100, with LCP 1.4 s and CLS 0. The initial site JavaScript is
11.95 kB raw / 4.42 kB gzip and CSS is 15.51 kB raw / 4.16 kB gzip.

## Outcome

There are no remaining findings or known gaps. The static product retains its
night-market inspection-board identity; this repair changed proof, wording
records, and test rigor without replacing the product surface.
