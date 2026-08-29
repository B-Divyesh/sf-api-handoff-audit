# API Handoff Audit — adversarial first-read review 1 handoff

**Status: FAIL**

Reviewed the live deployment and repository at
`38bc73c43052bca99247d1c071adf755bbcdc8ba`. No product code was changed.

The complete report is `.factory/review-1.md`. It records 2 blocking, 6 major,
and 8 minor findings. The blockers are the non-persistent demo banner at 390 px
and the misleading “Mark documented” demo action that produces PASS without a
repository edit or CLI rerun.

## Verification completed

- Cold live review at 390 × 844 and 1440 × 900.
- One-click demo, Reset, reload, exit, storage, and request-log checks.
- Every one of the 11 `claims.json` commands run separately from a clean clone;
  all passed.
- `npm test` from the clean clone: 8 Rust, 1 Vitest, and 26 Playwright tests
  passed.
- `npm run build` from the clean clone: release CLI and `dist/site` produced.
- Direct CLI demo from an empty temporary directory; no working-directory
  writes.
- Live route metadata, 404 status, link crawl, History API focus, mobile
  overflow, reduced motion, and axe checks.

## Next steps

Fix every item F-1-1 through F-1-16, add the missing tagged claim coverage,
and rerun the review from scratch. PASS requires zero remaining findings.
