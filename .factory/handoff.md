# API Handoff Audit v0.1.0 handoff

## What shipped

- A Rust single-binary CLI with `audit`, `run`, and `demo` commands.
- Repository scans for Bruno, Postman JSON, and `.http` variable references.
- Checks for undocumented or missing variables, setup steps, fixtures, and smoke files.
- Explicit smoke execution against configured `local` or HTTPS `staging` targets.
- Redirect refusal, target-host checks, path traversal checks, timeouts, and CI exit codes.
- Redacted terminal, JSON, and self-contained HTML reports.
- A bundled Parcel Lane sample copied to a fresh temporary directory by `demo`.
- A responsive static product site in the required night-market neon direction.
- Real `/demo`, `/ci-pack`, `/privacy`, `/terms`, and `/404` routes.
- A $39 one-time CI Pack flow using Sociobot checkout, restore, daily verification caching, a GitHub Actions starter, and two repository presets.
- Original generated hero art, responsive WebP assets, Open Graph art, favicon, and self-hosted fonts.
- Claims, demo, design, and copy audits under `.factory/`.

## Run and build

```sh
npm ci
npm test
npm run build
```

`npm run build` compiles `target/release/api-handoff-audit` and builds the deployable site at `dist/site/`. The required deploy root contains `index.html`.

Try the CLI without setup:

```sh
cargo run -- demo
```

Run the site locally:

```sh
npm run dev
```

## Verification completed

- `npm test`: passed.
  - TypeScript strict type check: passed.
  - Rust: 8 tests passed.
  - Vitest: 2 tests passed.
  - Playwright: 18 tests passed on Chromium 1.58.2.
- Every claim in `.factory/claims.json` passed against a fresh temporary repository or browser context.
- Axe: no serious or critical issues on `/`, `/demo`, `/ci-pack`, `/privacy`, `/terms`, or `/404`.
- Factory URL check: one `<h1>`, `lang`, `<main>`, alt text, and zero console errors.
- Mobile check: no horizontal overflow at 390 × 844.
- Keyboard check: skip link, primary action, route focus, and back navigation passed.
- `npm audit --omit=dev`: zero vulnerabilities.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package --allow-dirty`: packaged and verified successfully at 25.7 KiB compressed.
- Fresh `git archive` checkout: `npm ci` and `npm run build` passed; binary reported `0.1.0` and `dist/site/index.html` existed.
- Lighthouse mobile-class run: Performance 100, Accessibility 100, Best Practices 100, SEO 100.
- Lighthouse metrics: LCP 1.66 s, CLS 0, total blocking time 0 ms.
- Initial compiled JavaScript: 16.79 KB raw / 6.23 KB gzip.
- Compiled CSS: 14.47 KB raw / 4.01 KB gzip.
- Self-hosted fonts: 28 KB total.
- Hero images: 108 KB desktop and 44 KB mobile. Open Graph image: 80 KB.

## Privacy and security notes

- `audit` constructs no HTTP client and makes no network request.
- `run` sends only the named request to the configured target origin.
- Reports exclude environment values and response bodies.
- The browser demo writes no storage and makes no third-party request.
- The optional license token uses `sb_license:api-handoff-audit`. Its verdict uses `sb_license_verdict:api-handoff-audit`.
- Site runtime dependencies, fonts, and art are self-hosted. There is no analytics code.
- Static Web Apps headers include CSP, frame blocking, referrer policy, MIME protection, and a permissions policy.

## Known v1 limits

- Postman collections are scanned for variable references. Smoke execution uses `.http` files or simple Bruno method, URL, and header blocks.
- Complex Bruno scripts, GraphQL bodies, multipart bodies, and Postman collection execution are out of scope for v1.
- The CI Pack is delivered in the browser. Team report retention is not included because this release has no backend or hosted repository data.
- Registry publishing and Sociobot product registration remain factory release tasks.

## Next steps

1. Register the `api-handoff-audit` paid product and confirm its $39 live price.
2. Publish the Rust crate or attach platform binaries during the factory release.
3. Add signed team report retention only with a documented retention and deletion policy.
