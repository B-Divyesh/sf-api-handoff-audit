# API Handoff Audit — adversarial review 2 handoff

**Status: FAIL — 1 blocking, 2 major, 2 minor findings**

**Reviewed candidate:** `161a3043916a4dbd8c8ffea0671e6eeb5e6a3391`

**Live URL:** <https://api-handoff-audit.sociobot.in>

**Reviewed:** 2026-08-29 UTC

The full report is `.factory/review-2.md`. No product code was changed.

## What was done

- Opened the live landing page cold at 390 × 844 and 1440 × 900.
- Exercised the one-click browser demo, correction, Reset, reload, Start for
  real, storage isolation, sticky mobile banner, and request log.
- Ran all 13 commands in `.factory/claims.json` separately from a fresh clone.
- Re-audited every landing and README sentence and checked live claims against
  the registry.
- Rechecked every F-1 finding and historical verification defect in live code
  and product behavior.
- Crawled routes and links; checked direct metadata, HTTP 404 behavior,
  History focus, headers, reduced motion, mobile targets, console output, and
  serious/critical axe results.

## Verification

```sh
npm ci
npm test
```

`npm test` passed with 8 Rust, 1 Vitest, and 30 Playwright tests. Every exact
claim command passed independently in
`/tmp/api-handoff-review2.XnlrKw/clone`. Live axe scans found zero
serious/critical issues at mobile and desktop widths, and the demo request log
contained only the product origin.

## What remains

- Reopen F-1-8: correct the broad/unlisted privacy copy on `/privacy`.
- Register and test the public `--env-file` behavior.
- Extend two claim tests to assert copied demo files and exactly one installed
  binary.
- Replace the inaccurate landing labels and metaphorical 404 copy listed in
  F-2-4 and F-2-5.

After those repairs, rerun the entire review; PASS requires zero findings.
