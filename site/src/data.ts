export type Finding = {
  code: string;
  message: string;
  next: string;
  file: string;
};

export const sampleFindings: Finding[] = [
  {
    code: "VAR001",
    message: "WAREHOUSE_ID is used but not documented.",
    next: "Add WAREHOUSE_ID under [[variables]] in handoff-audit.toml.",
    file: "requests/create-order.http",
  },
];

export const terminalLines = [
  "$ api-handoff-audit demo",
  "API HANDOFF AUDIT  NEEDS WORK",
  "Parcel Lane API",
  "",
  "3 workspace files scanned · 2 setup steps · 1 fixture",
  "[set] API_TOKEN (secret)",
  "",
  "VAR001 Error: WAREHOUSE_ID is used but not documented.",
  "Next: Add WAREHOUSE_ID under [[variables]].",
  "",
  "HTML report: /tmp/api-handoff-audit-demo-…/handoff-report.html",
];

export const ciWorkflow = `name: API handoff audit
on: [pull_request]
jobs:
  handoff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cargo install api-handoff-audit --locked
      - run: api-handoff-audit audit . --json --output handoff-report.json
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: handoff-report
          path: handoff-report.json`;

export const ciPresets = [
  { name: "Bruno repository preset", text: `version = 1
project = "Your API"
setup_steps = ["Copy .env.example", "Start the local server"]

[[variables]]
name = "API_TOKEN"
required = true
secret = true

[[smoke]]
name = "health"
request = "requests/health.bru"
expect_status = [200]` },
  { name: "Postman repository preset", text: `version = 1
project = "Your API"
setup_steps = ["Import the shared environment", "Start the staging tunnel"]

[[variables]]
name = "API_TOKEN"
required = true
secret = true

[[smoke]]
name = "first-request"
request = "smoke/first-request.http"
expect_status = [200, 204]` },
];
