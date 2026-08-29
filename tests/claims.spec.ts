import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const binary = join(process.cwd(), "target/debug/api-handoff-audit");

test.beforeAll(async () => {
  await exec("cargo", ["build", "--quiet"], { cwd: process.cwd() });
});

async function cleanProject(request = "GET {{BASE_URL}}/health\n") {
  const root = await mkdtemp(join(tmpdir(), "handoff-claim-"));
  await mkdir(join(root, "requests"));
  await writeFile(join(root, "requests/health.http"), request);
  return root;
}

async function cli(args: string[], options: Parameters<typeof exec>[2] = {}) {
  try {
    const result = await exec(binary, args, options);
    return { ...result, code: 0 };
  } catch (error: unknown) {
    const result = error as { stdout?: string; stderr?: string; code?: number };
    return { stdout: result.stdout ?? "", stderr: result.stderr ?? "", code: result.code ?? -1 };
  }
}

test("@claim:repo-gaps finds an undocumented variable and an undocumented setup gap", async () => {
  const root = await cleanProject("GET {{BASE_URL}}/{{WAREHOUSE_ID}}/health\n");
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Gap sample'
[[smoke]]
name='health'
request='requests/health.http'
`);
  const result = await cli(["audit", root, "--json"]);
  expect(result.code).toBe(1);
  const report = JSON.parse(result.stdout);
  expect(report.findings).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "SETUP001", message: "No setup steps are documented." }),
    expect.objectContaining({ code: "VAR001", message: "WAREHOUSE_ID is used but not documented.", file: "requests/health.http" }),
  ]));
});

test("@claim:absent-fixtures finds a configured fixture that is absent", async () => {
  const root = await cleanProject();
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Fixture sample'
setup_steps=['Run the server']
[[fixtures]]
path='fixtures/order.json'
[[smoke]]
name='health'
request='requests/health.http'
`);
  const result = await cli(["audit", root, "--json"]);
  expect(result.code).toBe(1);
  expect(JSON.parse(result.stdout).findings).toEqual(expect.arrayContaining([
    expect.objectContaining({ code: "FIX001", message: "Fixture fixtures/order.json is missing.", file: "fixtures/order.json" }),
  ]));
});

test("@claim:package-install installs one packaged CLI with help, version, and JSON demo output", async () => {
  // A packaged consumer compiles the release binary outside this workspace.
  // Keep that real install regression independent from Playwright's UI budget.
  test.setTimeout(180_000);
  const consumer = await mkdtemp(join(tmpdir(), "handoff-consumer-"));
  const installRoot = join(consumer, "install");
  await exec("cargo", ["package", "--allow-dirty", "--quiet"], { cwd: process.cwd() });
  await exec("tar", ["-xzf", join(process.cwd(), "target/package/api-handoff-audit-0.1.0.crate"), "-C", consumer]);
  await exec("cargo", ["install", "--path", join(consumer, "api-handoff-audit-0.1.0"), "--root", installRoot, "--quiet"]);
  const command = join(installRoot, "bin", "api-handoff-audit");
  const { stdout: help } = await exec(command, ["--help"]);
  const { stdout: version } = await exec(command, ["--version"]);
  const { stdout, stderr } = await exec(command, ["demo", "--json"]);
  expect(help).toContain("Check an API repository before a teammate inherits it");
  expect(version.trim()).toBe("api-handoff-audit 0.1.0");
  const report = JSON.parse(stdout);
  expect(report.project).toBe("Parcel Lane API");
  expect(stderr).toContain("HTML report:");
});

test("@claim:build-artifacts builds the release binary and deployable site", async () => {
  test.setTimeout(180_000);
  await exec("npm", ["run", "build"], { cwd: process.cwd() });
  expect((await stat(join(process.cwd(), "target/release/api-handoff-audit"))).isFile()).toBe(true);
  expect((await stat(join(process.cwd(), "dist/site/index.html"))).isFile()).toBe(true);
});

test("@claim:local-free-audit runs without a license or network request", async () => {
  let proxyRequests = 0;
  const proxy = createServer((_request, response) => { proxyRequests += 1; response.writeHead(500).end(); });
  await new Promise<void>(resolve => proxy.listen(0, "127.0.0.1", resolve));
  const proxyPort = (proxy.address() as { port: number }).port;
  const root = await cleanProject();
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Local sample'
setup_steps=['Run the server']
[[smoke]]
name='health'
request='requests/health.http'
`);
  const { stdout } = await exec(binary, ["audit", root], { env: { ...process.env, HTTP_PROXY: `http://127.0.0.1:${proxyPort}`, HTTPS_PROXY: `http://127.0.0.1:${proxyPort}` } });
  proxy.close();
  expect(stdout).toContain("PASS");
  expect(proxyRequests).toBe(0);
});

test("@claim:workspace-formats scans Bruno, Postman, and .http variable references", async () => {
  const root = await mkdtemp(join(tmpdir(), "handoff-formats-"));
  await writeFile(join(root, "one.bru"), "get {\n url: {{BASE_URL}}/{{BRUNO_ID}}\n}\n# $dotenv DOTENV_ID\n");
  await writeFile(join(root, "two.http"), "GET {{BASE_URL}}/${HTTP_ID}\n");
  await writeFile(join(root, "postman.json"), JSON.stringify({ info: { name: "Sample" }, url: "{{POSTMAN_ID}}" }));
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Format sample'
setup_steps=['Run the server']
[[variables]]
name='BRUNO_ID'
required=false
[[variables]]
name='HTTP_ID'
required=false
[[variables]]
name='POSTMAN_ID'
required=false
[[variables]]
name='DOTENV_ID'
required=false
[[smoke]]
name='first'
request='two.http'
`);
  const reportOutput = join(root, "report.json");
  const { stdout } = await exec(binary, ["audit", root, "--json", "--output", reportOutput]);
  const report = JSON.parse(stdout);
  expect(report.scanned_files).toBe(3);
  expect(report.variables).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: "BRUNO_ID", used_by: ["one.bru"] }),
    expect.objectContaining({ name: "HTTP_ID", used_by: ["two.http"] }),
    expect.objectContaining({ name: "POSTMAN_ID", used_by: ["postman.json"] }),
    expect.objectContaining({ name: "DOTENV_ID", used_by: ["one.bru"] }),
  ]));
  expect(JSON.parse(await readFile(reportOutput, "utf8"))).toEqual(report);
});

test("@claim:redacted-reports excludes supplied values and response bodies from terminal, JSON, and HTML reports", async () => {
  const root = await cleanProject("GET {{BASE_URL}}/health\nAuthorization: Bearer {{API_TOKEN}}\n");
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Secret sample'
setup_steps=['Run the server']
[[variables]]
name='API_TOKEN'
secret=true
[[smoke]]
name='health'
request='requests/health.http'
`);
  const env = { ...process.env, API_TOKEN: "do-not-print-this-value" };
  for (const format of ["terminal", "json", "html"]) {
    const output = join(root, `report.${format}`);
    await exec(binary, ["audit", root, "--format", format, "--output", output], { env });
    expect(await readFile(output, "utf8")).not.toContain("do-not-print-this-value");
  }

  const bodySentinel = "response-body-must-never-appear";
  const server = createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" }).end(bodySentinel);
  });
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const port = (server.address() as { port: number }).port;
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Secret sample'
setup_steps=['Run the server']
[targets.local]
base_url='http://127.0.0.1:${port}'
[[variables]]
name='API_TOKEN'
secret=true
[[smoke]]
name='health'
request='requests/health.http'
`);
  try {
    for (const format of ["terminal", "json", "html"]) {
      const output = join(root, `smoke-report.${format}`);
      await exec(binary, ["run", root, "--target", "local", "--smoke", "health", "--format", format, "--output", output], { env });
      expect(await readFile(output, "utf8")).not.toContain(bodySentinel);
    }
  } finally {
    await new Promise<void>(resolve => server.close(() => resolve()));
  }
});

test("@claim:explicit-smoke runs only the named request and does not follow redirects", async () => {
  let requested = 0;
  let followed = 0;
  const destination = createServer((_request, response) => { followed += 1; response.writeHead(200).end("unexpected"); });
  await new Promise<void>(resolve => destination.listen(0, "127.0.0.1", resolve));
  const destinationPort = (destination.address() as { port: number }).port;
  const target = createServer((_request, response) => { requested += 1; response.writeHead(302, { Location: `http://127.0.0.1:${destinationPort}/leave` }).end(); });
  await new Promise<void>(resolve => target.listen(0, "127.0.0.1", resolve));
  const targetPort = (target.address() as { port: number }).port;
  const root = await cleanProject();
  await writeFile(join(root, "requests/other.http"), "GET {{BASE_URL}}/other\n");
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Run sample'
setup_steps=['Run the server']
[targets.local]
base_url='http://127.0.0.1:${targetPort}'
[[smoke]]
name='health'
request='requests/health.http'
expect_status=[302]
[[smoke]]
name='other'
request='requests/other.http'
`);
  const { stdout } = await exec(binary, ["run", root, "--target", "local", "--smoke", "health", "--json"]);
  await Promise.all([
    new Promise<void>(resolve => target.close(() => resolve())),
    new Promise<void>(resolve => destination.close(() => resolve())),
  ]);
  const report = JSON.parse(stdout);
  expect(report.smoke_result.status).toBe("PASS");
  expect(requested).toBe(1);
  expect(followed).toBe(0);
});

test("@claim:target-policy accepts HTTP local targets and rejects HTTP staging targets", async () => {
  const root = await cleanProject();
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Target policy sample'
setup_steps=['Run the server']
[targets.local]
base_url='http://127.0.0.1:9'
[targets.staging]
base_url='http://127.0.0.1:9'
[[smoke]]
name='health'
request='requests/health.http'
`);
  const local = await cli(["run", root, "--target", "local", "--smoke", "health", "--json"]);
  expect(local.code).toBe(1);
  expect(JSON.parse(local.stdout).smoke_result).toMatchObject({ target: "local", status: "FAIL" });
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Target policy sample'
setup_steps=['Run the server']
[targets.local]
base_url='https://127.0.0.1:9'
[targets.staging]
base_url='http://127.0.0.1:9'
[[smoke]]
name='health'
request='requests/health.http'
`);
  const secureLocal = await cli(["run", root, "--target", "local", "--smoke", "health", "--json"]);
  expect(secureLocal.code).toBe(1);
  expect(JSON.parse(secureLocal.stdout).smoke_result).toMatchObject({ target: "local", status: "FAIL" });
  const staging = await cli(["run", root, "--target", "staging", "--smoke", "health"]);
  expect(staging.code).toBe(2);
  expect(staging.stderr).toContain("The staging target must use https.");
});

test("@claim:exit-codes uses exact result codes and keeps --json stdout parseable", async () => {
  const root = await cleanProject();
  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Exit code sample'
setup_steps=['Run the server']
[[smoke]]
name='health'
request='requests/health.http'
`);
  const passed = await cli(["audit", root, "--json"]);
  expect(passed.code).toBe(0);
  expect(JSON.parse(passed.stdout)).toMatchObject({ project: "Exit code sample", findings: [] });

  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Exit code sample'
[[smoke]]
name='health'
request='requests/health.http'
`);
  const findings = await cli(["audit", root]);
  expect(findings.code).toBe(1);
  expect(findings.stdout).toContain("SETUP001");

  await writeFile(join(root, "handoff-audit.toml"), `version=1
project='Exit code sample'
setup_steps=['Run the server']
[targets.local]
base_url='http://127.0.0.1:9'
[[smoke]]
name='health'
request='requests/health.http'
`);
  const failedSmoke = await cli(["run", root, "--target", "local", "--smoke", "health", "--json"]);
  expect(failedSmoke.code).toBe(1);
  expect(JSON.parse(failedSmoke.stdout).smoke_result).toMatchObject({ status: "FAIL" });

  const invalid = await cli(["run", root]);
  expect(invalid.code).toBe(2);
  expect(invalid.stderr).toContain("--target");
  expect(invalid.stderr).toContain("--smoke");

  await writeFile(join(root, "handoff-audit.toml"), "version=2\nproject='Exit code sample'\n");
  const invalidConfig = await cli(["audit", root]);
  expect(invalidConfig.code).toBe(2);
  expect(invalidConfig.stderr).toContain("Unsupported config version 2");
});

test("@claim:cli-demo-isolation creates its report in a new temporary directory", async () => {
  const root = await cleanProject();
  const before = await readdir(root, { recursive: true });
  const result = await cli(["demo", "--json"], { cwd: root });
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toMatchObject({ project: "Parcel Lane API" });
  const reportPath = result.stderr.match(/^HTML report: (.+)$/m)?.[1];
  expect(reportPath).toBeTruthy();
  expect(reportPath!.startsWith(tmpdir())).toBe(true);
  expect((await stat(reportPath!)).isFile()).toBe(true);
  expect(await readFile(reportPath!, "utf8")).toContain("Parcel Lane API");
  expect(await readdir(root, { recursive: true })).toEqual(before);
});

test("@claim:sample-report-content matches the CLI sample counts, finding, file, and next step in the browser demo", async ({ page }) => {
  const result = await cli(["demo", "--json"]);
  const report = JSON.parse(result.stdout);
  expect(result.code).toBe(0);
  expect(report).toMatchObject({ project: "Parcel Lane API", scanned_files: 3, setup_steps: 2, fixtures_checked: 1, smoke_requests: 2 });
  expect(report.findings).toEqual(expect.arrayContaining([expect.objectContaining({ code: "VAR001", file: "requests/create-order.http", message: "WAREHOUSE_ID is used but not documented." })]));
  await page.goto("/demo?demo=1");
  await expect(page.locator(".audit-counts div").filter({ hasText: "Files" }).locator("dd")).toHaveText("3");
  await expect(page.locator(".audit-counts div").filter({ hasText: "Setup steps" }).locator("dd")).toHaveText("2");
  await expect(page.locator(".audit-counts div").filter({ hasText: "Fixtures" }).locator("dd")).toHaveText("1");
  await expect(page.locator(".audit-counts div").filter({ hasText: "Smoke requests" }).locator("dd")).toHaveText("2");
  await expect(page.getByRole("heading", { name: "WAREHOUSE_ID is used but not documented." })).toBeVisible();
  await expect(page.locator(".finding code")).toHaveText("requests/create-order.http");
  await expect(page.getByText("Add WAREHOUSE_ID under [[variables]] in handoff-audit.toml.")).toBeVisible();
});

test("@claim:demo-sandbox resets sample changes and sends no third-party requests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") external.push(request.url()); });
  await page.goto("/demo?demo=1");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await page.getByRole("button", { name: "Show the corrected config" }).click();
  await expect(page.getByRole("heading", { name: "Corrected handoff-audit.toml" })).toBeVisible();
  await expect(page.getByText("The CLI does not make this edit.")).toBeVisible();
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length }))).toEqual({ local: 0, session: 0 });
  await page.reload();
  await expect(page.getByRole("heading", { name: "WAREHOUSE_ID is used but not documented." })).toBeVisible();
  expect(external).toEqual([]);
});
