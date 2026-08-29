import { expect, test } from "@playwright/test";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
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

test("@claim:repo-gaps finds the sample repository's undocumented variable", async () => {
  const { stdout } = await exec(binary, ["demo"], { cwd: process.cwd() });
  expect(stdout).toContain("WAREHOUSE_ID is used but not documented");
  expect(stdout).toContain("requests/create-order.http");
});

test("a clean packaged consumer can parse demo --json stdout", async () => {
  // A packaged consumer compiles the release binary outside this workspace.
  // Keep that real install regression independent from Playwright's UI budget.
  test.setTimeout(180_000);
  const consumer = await mkdtemp(join(tmpdir(), "handoff-consumer-"));
  const installRoot = join(consumer, "install");
  await exec("cargo", ["package", "--allow-dirty", "--quiet"], { cwd: process.cwd() });
  await exec("tar", ["-xzf", join(process.cwd(), "target/package/api-handoff-audit-0.1.0.crate"), "-C", consumer]);
  await exec("cargo", ["install", "--path", join(consumer, "api-handoff-audit-0.1.0"), "--root", installRoot, "--quiet"]);
  const command = join(installRoot, "bin", "api-handoff-audit");
  const { stdout, stderr } = await exec(command, ["demo", "--json"]);
  const report = JSON.parse(stdout);
  expect(report.project).toBe("Parcel Lane API");
  expect(stderr).toContain("HTML report:");
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
  await writeFile(join(root, "one.bru"), "get {\n url: {{BASE_URL}}/{{BRUNO_ID}}\n}\n");
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
[[smoke]]
name='first'
request='two.http'
`);
  const reportOutput = join(root, "report.json");
  const { stdout } = await exec(binary, ["audit", root, "--json", "--output", reportOutput]);
  const report = JSON.parse(stdout);
  expect(report.scanned_files).toBe(3);
  expect(report.variables.every((item: { used_by: string[] }) => item.used_by.length === 1)).toBe(true);
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

test("@claim:demo-sandbox resets sample changes and sends no third-party requests", async ({ page }) => {
  const external: string[] = [];
  page.on("request", request => { if (new URL(request.url()).origin !== "http://127.0.0.1:4173") external.push(request.url()); });
  await page.goto("/demo");
  await expect(page.getByText("Demo — sample data, nothing is saved")).toBeVisible();
  await page.getByRole("button", { name: "Mark documented" }).click();
  await expect(page.getByText("No handoff gaps found")).toBeVisible();
  expect(await page.evaluate(() => localStorage.length)).toBe(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "WAREHOUSE_ID is used but not documented." })).toBeVisible();
  expect(external).toEqual([]);
});
