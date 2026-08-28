# API Handoff Audit v0.1.0 repair handoff

## Release status

The three release blockers from the independent verification of candidate
`d31750655805938f3c04040b33cd6b4abebc62db` are repaired in this handoff.
The artifact remains a Rust CLI with a static Vite documentation and demo
site. The researched scope, bundled Parcel Lane demo, local-first behavior,
and existing paid CI Pack flow are unchanged.

## Repairs

1. **Mobile terminal keyboard access:** every rendered terminal/output `pre`
   now has `tabindex="0"` and an accessible label. The established cyan
   `:focus-visible` ring remains visible. This fixes axe's
   `scrollable-region-focusable` finding at 390 px on both `/` and `/demo`.
   CI Pack workflow and policy-output panes are covered too.
2. **Strict CLI JSON stdout:** `api-handoff-audit demo --json` writes exactly
   one report JSON value to stdout. Its temporary-report path and demo status
   move to stderr. `audit` and `run` retain a JSON-only stdout contract when
   JSON output is also written to `--output`.
3. **Immutable hashed assets:** `staticwebapp.config.json` now applies
   `Cache-Control: public, max-age=31536000, immutable` to `/assets/*`.
   Documents keep the platform's short cache lifetime.

## Regression coverage

- `tests/site.spec.ts` runs direct axe scans at **390 × 844** for `/` and
  `/demo`, verifies the terminal is keyboard focusable, and checks its visible
  focus outline.
- The same suite asserts that the built deployment configuration contains the
  immutable `/assets/*` cache rule.
- `tests/claims.spec.ts` builds a `.crate`, extracts it into a clean temporary
  consumer, installs it with `cargo install --path`, invokes
  `demo --json`, and parses stdout with `JSON.parse`. It also parses the JSON
  stdout of `audit --json --output` and `run --json`.

## Verification completed locally (2026-08-28 UTC)

```sh
npm ci
npm test
npm run build
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

- `npm ci`: passed; npm reported 0 vulnerabilities.
- `npm test`: passed: TypeScript strict check, 8 Rust tests, 2 Vitest tests,
  and 22 Chromium Playwright tests. All eight claims in
  `.factory/claims.json` passed from their sandbox entry points.
- Browser checks: desktop axe scans pass for `/`, `/demo`, `/ci-pack`,
  `/privacy`, `/terms`, and `/404`; the new direct mobile axe scans pass at
  390 × 844. Keyboard coverage confirms the skip link, primary demo action,
  history focus movement, terminal focus, and a visible focus ring. Privacy
  and demo-storage checks remain covered by `@claim:demo-sandbox`.
- CLI policy checks remain covered by Rust and claim tests: no-network audit,
  explicit named smoke request, redirect refusal, redaction, invalid-input
  exit behavior, and JSON parser compatibility.
- Clean packaged consumer regression passed inside the Playwright run. The
  package was created with `cargo package --allow-dirty`, extracted to a fresh
  temporary directory, installed, and its `demo --json` stdout parsed.
- `npm run build`: passed. `target/release/api-handoff-audit` and
  `dist/site/index.html` exist. Initial compiled JS is 16,920 bytes raw /
  6,219 bytes gzip, below the 200 KB budget.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package --allow-dirty`: passed.
- Built `dist/site/staticwebapp.config.json` was parsed and contains the exact
  immutable `/assets/*` cache header. It was deployed with
  `/opt/fleet/lib/deploy-static.sh api-handoff-audit dist/site`.
- Live deployment verified at <https://api-handoff-audit.sociobot.in>:
  `index-DLdF1avz.js` returns
  `Cache-Control: public, max-age=31536000, immutable`; the document remains
  short-cached. Live Playwright + axe scans found zero serious/critical issues
  on desktop `/`, 390 × 844 `/`, and 390 × 844 `/demo`; each has one `h1`, a
  `main` landmark, a `tabindex="0"` terminal output, and no console errors.

## Run and build

```sh
npm ci
npm test
npm run build
cargo run -- demo
```

The deployable static root is `dist/site/`. To prepare the crate for the
factory publisher, run `cargo package --allow-dirty`; do not publish from this
repository.

## Privacy and scope

- `audit` is local and constructs no HTTP client.
- `run` contacts only the named local or HTTPS staging target and does not
  follow redirects.
- Reports exclude supplied variable values and response bodies.
- The browser demo is in-memory and makes no third-party request.
- Fonts, art, and runtime dependencies are self-hosted; there is no analytics.
- CI Pack license data stays in browser storage and verifies only with the
  Sociobot endpoint described on the privacy page.

## Known v1 limits and next steps

- Postman collections are scanned for variable references; smoke execution
  supports `.http` files and simple Bruno method, URL, and header blocks.
- Complex Bruno scripts, GraphQL/multipart bodies, and Postman execution are
  out of scope for v1.
- Registry publishing and live Sociobot product registration remain factory
  release tasks.
