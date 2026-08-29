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
