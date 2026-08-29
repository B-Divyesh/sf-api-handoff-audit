# Copy audit

Regenerated on 29 August 2026 from the rendered landing page and `README.md`.
Word counts treat hyphenated terms, paths, flags, code tokens, and numeric
values separated by spaces as one word. Decorative symbols and blank terminal
lines do not count. Commands and configuration examples are listed separately:
they are executable syntax rather than prose sentences. No audited sentence is
over 22 words or uses a banned marketing word.

## Landing page

| Rendered copy or accessible label | Words | Check / claim |
| --- | ---: | --- |
| Skip to main content | 4 | Pass — skip-link label |
| API Handoff Audit home | 4 | Pass — wordmark accessible label |
| Main navigation | 2 | Pass — nav accessible label |
| Demo | 1 | Pass — route label |
| How it works | 3 | Pass — route label |
| Privacy | 1 | Pass — route label |
| Check an API repository before handoff | 6 | Pass — job headline |
| For teams giving a shared API workflow to a new contributor. | 11 | Pass — audience and situation |
| Try it with sample data | 5 | Pass — primary result-naming action |
| See the sample report and its one finding. | 8 | `sample-report-content` |
| Free local audit. | 3 | `local-free-audit` |
| No account needed. | 3 | `local-free-audit` |
| Reports hide variable values. | 4 | `redacted-reports` |
| API files and checklists hang like signs in a night-market inspection lane. | 12 | Pass — image alt text |
| Sample CLI output | 3 | Pass — section label |
| Sample audit finding | 3 | Pass — section heading |
| The bundled repository contains a request that uses an undocumented variable. | 11 | `sample-report-content` |
| Recorded terminal output | 3 | Pass — region accessible label |
| parcel-lane / audit | 2 | Pass — recorded sample context |
| Replay output | 2 | Pass — result-naming control |
| API Handoff Audit demo output | 5 | Pass — output accessible label |
| $ api-handoff-audit demo | 2 | Pass — recorded command |
| API HANDOFF AUDIT NEEDS WORK | 5 | `sample-report-content` |
| Parcel Lane API | 3 | `sample-report-content` |
| 3 workspace files scanned · 2 setup steps · 1 fixture | 9 | `sample-report-content` |
| [set] API_TOKEN (secret) | 3 | `redacted-reports` |
| VAR001 Error: WAREHOUSE_ID is used but not documented. | 8 | `repo-gaps`, `sample-report-content` |
| Next: Add WAREHOUSE_ID under [[variables]]. | 5 | `sample-report-content` |
| HTML report: /tmp/api-handoff-audit-demo-…/handoff-report.html | 3 | `cli-demo-isolation` |
| Three steps | 2 | Pass — workflow label |
| How the handoff audit works | 5 | Pass — section heading |
| Scan the repository | 3 | Pass — step heading |
| Point the CLI at Bruno, Postman, or .http files in Git. | 11 | `workspace-formats` |
| Name one smoke request | 4 | Pass — step heading |
| Choose a configured local or staging target. | 7 | `target-policy` |
| The CLI sends only that request. | 6 | `explicit-smoke` |
| Share the redacted report | 4 | Pass — step heading |
| Write terminal, JSON, or HTML output without variable values or response bodies. | 12 | `redacted-reports` |
| What the audit does not do | 6 | Pass — boundary label |
| Where repository data goes | 4 | Pass — section heading |
| The audit reads local text files. | 6 | `local-free-audit` |
| It has no telemetry. | 5 | `local-free-audit` |
| A smoke run contacts only the target you select. | 9 | `explicit-smoke` |
| It never follows a redirect. | 5 | `explicit-smoke` |
| API Handoff Audit | 3 | Pass — footer product name |
| Check an API repository before a teammate inherits it. | 9 | `repo-gaps` |
| Terms | 1 | Pass — legal route label |
| Built by Param Factory | 4 | Pass — external attribution |
| external | 1 | Pass — external-link screen-reader text |
| v0.1.0 · build 2026.08.29 | 3 | `package-install` |

## README prose

| README heading or sentence | Words | Check / claim |
| --- | ---: | --- |
| API Handoff Audit | 3 | Pass — document title |
| Check an API repository before a teammate inherits it. | 9 | `repo-gaps` |
| API Handoff Audit is a Rust CLI for teams that keep API requests in Git. | 15 | Pass — product and audience |
| It finds missing variables, undocumented setup, and absent fixtures. | 9 | `repo-gaps`, `absent-fixtures` |
| It runs only the smoke requests you name against configured local or staging targets. | 14 | `explicit-smoke`, `target-policy` |
| Its terminal, JSON, and HTML reports never include variable values or response bodies. | 13 | `redacted-reports` |
| The free CLI runs local audits and named smoke requests. | 10 | `local-free-audit`, `explicit-smoke` |
| Try the bundled project | 4 | Pass — section heading |
| The command copies examples/parcel-lane to a temporary directory, audits it, writes a redacted HTML report, and prints its path. | 19 | `cli-demo-isolation` |
| Nothing is written to your repository. | 6 | `cli-demo-isolation` |
| The browser demo is available at https://api-handoff-audit.sociobot.in/demo. | 7 | `demo-sandbox` |
| Install | 1 | Pass — section heading |
| Build the single binary | 4 | `package-install` |
| The package starts at version 0.1.0. | 6 | `package-install` |
| Configure a repository | 3 | Pass — section heading |
| Create handoff-audit.toml at the repository root. | 6 | Pass — configuration instruction |
| Request files use a plain HTTP format. | 7 | `workspace-formats` |
| The scanner also reads Bruno .bru files and Postman collection JSON. | 11 | `workspace-formats` |
| It recognizes {{NAME}}, ${NAME}, and $dotenv NAME variable references. | 9 | `workspace-formats` |
| Audit and run | 3 | Pass — section heading |
| Audit without sending a request | 5 | `local-free-audit` |
| Pass --env-file to read NAME=value entries from the file you choose. | 11 | `env-file` |
| Reports show variable names and states, never those values. | 9 | `env-file`, `redacted-reports` |
| Run one named request against a configured target | 8 | `explicit-smoke` |
| run requires both --target and --smoke. | 6 | `exit-codes` |
| The target must exist under [targets.local] or [targets.staging]. | 8 | `target-policy` |
| Local targets accept http or https; staging targets require https. | 10 | `target-policy` |
| The CLI never follows redirects to a different host. | 9 | `explicit-smoke` |
| Exit codes are 0 for pass, 1 for audit findings or a failed smoke response, and 2 for invalid input or configuration. | 22 | `exit-codes` |
| Add --json as shorthand for JSON on stdout. | 8 | `exit-codes` |
| Develop and verify | 3 | Pass — section heading |
| npm run build compiles the release binary and the site. | 10 | `build-artifacts` |
| The deployable site lands in dist/site/. | 6 | `build-artifacts` |
| cargo package --allow-dirty checks the ready-to-publish crate. | 7 | `package-install` |
| Privacy and scope | 3 | Pass — section heading |
| Audit reads local text files and does not use telemetry. | 10 | `local-free-audit` |
| Smoke runs send the selected request to the configured target. | 10 | `explicit-smoke` |
| Reports show variable names and states, but never their values. | 10 | `env-file`, `redacted-reports` |
| The product site has privacy and terms pages. | 8 | Pass — route suite |
| The MIT license is in LICENSE. | 6 | Pass — repository license |

## README commands and configuration

The code blocks were checked as executable syntax rather than prose. They name
the same terms used in the tables: `cargo run -- demo`, `cargo install --path
.`, `api-handoff-audit --help`, `handoff-audit.toml`, supported request syntax,
the audit/run commands, `npm test`, `npm run build`, and `npm run build:site`.
No code example introduces a competing name for repository, smoke request,
target, variable, report, or sample data.

## First-screen read-aloud check

“Check an API repository before handoff. For teams giving a shared API workflow
to a new contributor. Try it with sample data.” The job, audience, and first
action fit in one breath.

## Terminology table

| Concept | One term |
| --- | --- |
| The Git checkout being checked | repository |
| A named request selected for execution | smoke request |
| Its configured destination | target |
| A required input name | variable |
| The generated result | report |
| The bundled example | sample data |

Catalog description: “Check API handoff gaps before a teammate inherits a
repository.” It begins with a verb and has 63 characters.
