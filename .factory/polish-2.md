# Polish 2 — adversarial finding closure

**Repair commit:** `824bcac7e1b5212bd34faaa2b6851813accbef1f`  
**Live URL checked:** <https://api-handoff-audit.sociobot.in>  
**Date:** 2026-08-29 UTC

The review record was read in full, including review 1, review 2, polish 1,
and every earlier verification note. All current and historical findings were
rechecked on the released site. The screenshots below are live captures.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Kept the demo banner sticky at phone width with Reset and Start for real visible. | `?demo=1 opens…phone` test; [mobile demo screenshot](evidence/polish-2/demo-mobile-live.png); live `/demo?demo=1` scroll check. |
| F-1-2 | The demo shows the exact corrected TOML and a labelled recorded rerun; it does not claim to edit a repository. | `@claim:demo-sandbox`; [mobile demo screenshot](evidence/polish-2/demo-mobile-live.png); live correction/reset check. |
| F-1-3 | Kept the exact sample values in the registered `sample-report-content` claim. | `@claim:sample-report-content`; [mobile demo screenshot](evidence/polish-2/demo-mobile-live.png); live `/demo?demo=1`. |
| F-1-4 | Removed the unsupported Rust 1.85 minimum statement. | README copy audit; clean-clone `npm test`; live docs use no minimum-version promise. |
| F-1-5 | Removed the time-sensitive no-checkout promise. | `does not advertise a checkout`; live `/` check. |
| F-1-6 | Kept `build-artifacts` registered and tested. | `@claim:build-artifacts`; clean-clone `npm run build`; live deploy uses `dist/site/`. |
| F-1-7 | Removed the factory-internal publishing statement. | README copy audit; clean-clone `cargo package --allow-dirty`. |
| F-1-8 | Removed the remaining hosted-workspace scope claim and qualified privacy handling around smoke requests. | `@claim:local-free-audit`, `@claim:explicit-smoke`; [privacy screenshot](evidence/polish-2/privacy-live.png); live `/privacy`. |
| F-1-9 | Replaced the undefined “full” copy with named audit and smoke work. | README copy audit; `@claim:local-free-audit`. |
| F-1-10 | Removed the vague “small” product description. | README copy audit; live `/`. |
| F-1-11 | Removed the metaphorical preflight eyebrow. | Landing copy audit; live `/`. |
| F-1-12 | Uses the direct repository-before-handoff headline. | Landing copy audit; live `/`. |
| F-1-13 | Uses “Sample CLI output” rather than decorative numbering. | Landing copy audit; live `/`. |
| F-1-14 | Uses “Sample audit finding” as a real section heading. | Landing copy audit; live `/`. |
| F-1-15 | Uses “What the audit does not do” as a direct boundary label. | Landing copy audit; live `/`. |
| F-1-16 | Retains prerendered route-specific OG/Twitter metadata. | `direct route documents…metadata`; live `/demo`, `/privacy`, `/terms` source checks. |
| F-2-1 | Privacy now says “Audit locally; send smoke requests only to your target” and only promises no account or telemetry. | `@claim:local-free-audit`, `@claim:explicit-smoke`; [privacy screenshot](evidence/polish-2/privacy-live.png); live `/privacy`. |
| F-2-2 | Added the `env-file` claim and test. It verifies a chosen file supplies a variable state while its sentinel never appears in terminal, JSON, or HTML reports. | `@claim:env-file`; clean-clone claim run; live `/privacy`. |
| F-2-3 | `cli-demo-isolation` now byte-compares the config, both bundled requests, and fixture in the temporary demo directory. `package-install` now asserts the isolated bin directory contains exactly `api-handoff-audit`. | `@claim:cli-demo-isolation`, `@claim:package-install`; clean-clone claim run. |
| F-2-4 | Replaced “Three checks, one report” with “Three steps” and “Your repository stays the workspace” with “Where repository data goes.” | Landing copy audit; live `/`. |
| F-2-5 | Replaced market lore with “404 error” and “Page not found,” including the no-JavaScript document. | `direct not-found navigation…` and `unknown routes…`; [live 404 screenshot](evidence/polish-2/404-live.png); live `/missing-stall`. |

## Live recheck

- `/`, `/demo?demo=1`, `/privacy`, `/terms`, and `/missing-stall` were opened in
  fresh browser contexts. The first four returned 200; the unknown route
  returned the designed 404 document.
- The mobile demo banner stayed within the 390 × 844 viewport after scrolling;
  correction, Reset, zero web-storage entries, and same-origin-only requests
  were observed.
- `/opt/fleet/lib/verify-url.sh` passed on the landing URL. Live Playwright axe
  scans reported zero serious or critical violations on all five routes.
