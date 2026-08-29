# API Handoff Audit — repair handoff

**Repair base:** `c39439484680cf1ee2e9c6ac0744b40808386ef4`
**Verifier report repaired:** `41b99c1e729058ec0c2e7690bf5da54eabf45159`
**Artifact:** Rust CLI plus static Vite documentation/demo site
**Deployment:** static (`dist/site/`)

## Repairs

1. Smoke JSON now has the stable `smoke_result.status` field (`PASS` or `FAIL`) as well as the existing boolean. The declared `explicit-smoke` contract now parses that field and proves only the selected request is sent and redirects are not followed.
2. The clean packaged-consumer regression has a 180-second per-test ceiling, appropriate for a real fresh release install. Playwright's suite ceiling is 120 seconds, preventing the former 30-second false failure and leaving no timed-out child install in a passing run.
3. The CI Pack checkout, license UI, claims, route, sitemap entry, and license storage were removed. The live Sociobot checkout returned 404 and billing registration is not an authorized repository operation. The full free CLI remains available, and a browser regression proves no checkout is advertised.
4. Header, footer, demo controls, terminal replay control, skip link, and legal links have 44 × 44 px mobile hit areas. Browser coverage measures them at a 390 × 844 viewport.
5. The redaction claim now covers a loopback response-body sentinel as well as a supplied variable-value sentinel in terminal, JSON, and HTML reports. The CSP was tightened to same-origin connections and forms after the paid integration was removed.

## Verification (2026-08-29 UTC)

Completed from a clean dependency install:

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

- `npm ci`: passed; 0 vulnerabilities reported.
- `npm test`: passed — strict TypeScript check, 8 Rust tests, 1 Vitest test, and 21 Chromium Playwright tests. The packaged-consumer test creates a `.crate`, extracts it to a fresh temporary directory, runs `cargo install --path ... --root ...`, then parses `demo --json` stdout.
- Every declared claim command passed independently: `repo-gaps`, `workspace-formats`, `local-free-audit`, `redacted-reports`, `explicit-smoke`, and `demo-sandbox`.
- `npm run build`: passed. It produced `target/release/api-handoff-audit` and `dist/site/`. Initial JS is 10,670 bytes raw / 4,230 bytes gzip; CSS is 14,990 bytes raw / 4,060 bytes gzip.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package --allow-dirty`: passed; 16 files, 87.7 KiB unpacked and 26.0 KiB compressed.
- Browser checks use Playwright + axe. Desktop routes `/`, `/demo`, `/privacy`, `/terms`, and `/404`, plus `/` and `/demo` at 390 × 844, have zero serious/critical violations. Keyboard coverage confirms skip-link focus, Enter activation of the demo action, history focus restoration, and focusable terminal output. The 390 px check has no horizontal overflow.
- The demo claim records only same-origin requests and verifies that reload restores the sample without localStorage. The CLI policy checks cover no audit network request, one named smoke request, redirect refusal, and the absence of both secret values and received response bodies in reports.

## Deploy and consumer use

```sh
# deployable static site
/opt/fleet/lib/deploy-static.sh api-handoff-audit dist/site

# publisher preparation only; do not publish from this repository
cargo package --allow-dirty
```

Install the CLI from a checkout with `cargo install --path .`; run the bundled safe sample with `api-handoff-audit demo`.

## Known scope limits

- Postman collections are scanned for variable references; smoke execution supports `.http` files and simple Bruno request blocks.
- Complex Bruno scripts, GraphQL/multipart bodies, and Postman execution are out of scope for v1.
- The researched freemium option is deliberately not advertised until the factory registers a live Sociobot product checkout. This prevents a visitor reaching the independently verified 404 purchase link.

## Deployment evidence

Commit `17a7115` was pushed to `origin/main` and deployed with:

```sh
/opt/fleet/lib/deploy-static.sh api-handoff-audit dist/site
```

Live verification at `https://api-handoff-audit.sociobot.in` on 2026-08-29 UTC:

- The live document references `assets/index-D9SE1PEe.js`; its SHA-256 is
  `af7242c2d205110047660125edea829fc66367d92e96d2cbdf359aae258ba582`, equal
  to the deployed local build.
- The hashed JS has `Cache-Control: public, max-age=31536000, immutable`.
  The document is short-cached. CSP confines connections and forms to
  same-origin and includes `frame-ancestors 'none'`; HSTS, nosniff, referrer,
  and permissions headers are present.
- Standalone live Playwright + axe scans passed on desktop `/`, `/demo`,
  `/privacy`, `/terms`, and `/404`, and on `/` plus `/demo` at 390 × 844:
  zero serious/critical violations, one `h1`, one `main`, no console errors,
  and no mobile horizontal overflow.
- The live skip link receives the first Tab focus. The demo made only
  same-origin requests and had empty `localStorage`. No checkout link remains
  in the live document; `/ci-pack` resolves to the designed in-app 404.
- There is no offline/PWA claim or service worker. Update behavior is covered
  by the verified short document cache and immutable content-hashed assets.
