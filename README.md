# API Handoff Audit

Check an API repository before a teammate inherits it.

API Handoff Audit is a Rust CLI for teams that keep API requests in Git. It finds missing variables, undocumented setup, and absent fixtures. It runs only the smoke requests you name against configured local or staging targets. Its terminal, JSON, and HTML reports never include variable values or response bodies.

The free CLI runs local audits and named smoke requests.

## Try the bundled project

```sh
cargo run -- demo
```

The command copies `examples/parcel-lane` to a temporary directory, audits it, writes a redacted HTML report, and prints its path. Nothing is written to your repository.

The browser demo is available at <https://api-handoff-audit.sociobot.in/demo>.

## Install

Build the single binary:

```sh
cargo install --path .
api-handoff-audit --help
```

The package starts at version `0.1.0`.

## Configure a repository

Create `handoff-audit.toml` at the repository root:

```toml
version = 1
project = "Parcel Lane API"
setup_steps = [
  "Copy .env.example to .env.handoff",
  "Run npm run dev"
]

[[variables]]
name = "API_TOKEN"
description = "A staging token from the API owner"
required = true
secret = true

[[fixtures]]
path = "fixtures/order.json"
description = "A small order body"

[targets.local]
base_url = "http://127.0.0.1:4010"

[targets.staging]
base_url = "https://staging.example.test"

[[smoke]]
name = "health"
request = "requests/health.http"
expect_status = [200]
```

Request files use a plain HTTP format:

```http
GET {{BASE_URL}}/health
Authorization: Bearer {{API_TOKEN}}
```

The scanner also reads Bruno `.bru` files and Postman collection JSON. It recognizes `{{NAME}}`, `${NAME}`, and `$dotenv NAME` variable references.

## Audit and run

Audit without sending a request:

```sh
api-handoff-audit audit . --env-file .env.handoff
api-handoff-audit audit . --format json --output handoff-report.json
api-handoff-audit audit . --format html --output handoff-report.html
```

Run one named request against a configured target:

```sh
api-handoff-audit run . --target local --smoke health --env-file .env.handoff
```

`run` requires both `--target` and `--smoke`. The target must exist under `[targets.local]` or `[targets.staging]`. Local targets accept `http` or `https`; staging targets require `https`. The CLI never follows redirects to a different host.

Exit codes are `0` for pass, `1` for audit findings or a failed smoke response, and `2` for invalid input or configuration. Add `--json` as shorthand for JSON on stdout.

## Develop and verify

```sh
npm install
npm test
npm run build
npm run build:site
```

`npm run build` compiles the release binary and the site. The deployable site lands in `dist/site/`. `cargo package --allow-dirty` checks the ready-to-publish crate.

## Privacy and scope

Audit reads local text files and does not use telemetry. Smoke runs send the selected request to the configured target. Reports show variable names and states, but never their values.

The product site has [privacy](https://api-handoff-audit.sociobot.in/privacy) and [terms](https://api-handoff-audit.sociobot.in/terms) pages. The MIT license is in [LICENSE](LICENSE).
