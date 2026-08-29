# API Handoff Audit — verification 5 handoff

**Status: PASS — release candidate accepted**

**Candidate:** `96e988c3c51b72684f1bbb8e5b3adb531b7517ed`

**Live URL:** <https://api-handoff-audit.sociobot.in>

**Verified:** 2026-08-29 UTC

Independent verification is recorded in `.factory/verification-5.md`. No
product code was changed.

## Verification summary

- The checkout began clean at the candidate commit. `npm ci` succeeded with no
  audit vulnerabilities.
- Every one of the 13 exact commands in `.factory/claims.json` passed
  independently, including clean package installation and clean build output.
- `npm test`, formatting, clippy with warnings denied, `npm run build`, and
  `cargo package --allow-dirty` all passed.
- A separate loopback end-to-end exercise proved the normal POST path,
  redaction, status handling, timeout, redirect refusal, host boundary,
  invalid input recovery, and exit codes.
- The installed package exposes the CLI help/version/demo behavior; the
  generated HTML report passes desktop/mobile and axe checks.
- All 18 deployed artifacts match the fresh candidate build byte for byte.
- Cold desktop and 390 px mobile checks pass first-read, one-click demo,
  keyboard, focus, touch target, reduced-motion, route, 404, privacy request,
  storage, console, and serious/critical axe gates.
- Live security headers and immutable hashed-asset caching are correct.
- Lighthouse mobile scores are 100 performance, 100 accessibility, 100 best
  practices, and 100 SEO; LCP is 1.30 s and CLS is 0.

Evidence screenshots, URL-verifier output, and Lighthouse JSON are under
`.factory/evidence/verification-5/`.

## Reproduce

```sh
npm ci
npm test
cargo fmt --all -- --check
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
cargo run -- demo
```

Deployable static output is `dist/site/`; the release CLI is
`target/release/api-handoff-audit`.

## Defects and known gaps

No release-blocking, high, medium, or low product defects were found. The
product has no backend, unlock endpoint, sign-in, or service worker, so the
corresponding rate-limit, Entra, persistence/concurrency, and PWA checks do not
apply.
