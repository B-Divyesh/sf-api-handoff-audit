import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const routes = ["/", "/demo", "/privacy", "/terms", "/404"];

for (const route of routes) {
  test(`${route} has one clear page heading and no serious accessibility issues`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page).toHaveTitle(/API Handoff Audit/);
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(issue => ["serious", "critical"].includes(issue.impact ?? ""));
    expect(serious).toEqual([]);
  });
}

test("history navigation restores routes and moves focus", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Demo", exact: true }).click();
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator("h1")).toBeFocused();
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator("h1")).toBeFocused();
});

test("the first screen fits a 390px phone without horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: "Try it with sample data" })).toBeVisible();
  const width = await page.evaluate(() => ({ body: document.body.scrollWidth, view: document.documentElement.clientWidth }));
  expect(width.body).toBeLessThanOrEqual(width.view);
});

test("mobile header, footer, demo, and terminal controls have 44px hit areas", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["/", "/demo", "/privacy", "/terms"]) {
    await page.goto(route);
    const targets = page.locator(".site-header a, footer a, .terminal-bar button, .demo-banner a, .demo-banner button, .legal a");
    for (let index = 0; index < await targets.count(); index += 1) {
      const box = await targets.nth(index).boundingBox();
      if (!box) continue;
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
  }
});

test("does not advertise a checkout", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('a[href*="/checkout"]')).toHaveCount(0);
  await expect(page.getByText("$39", { exact: true })).toHaveCount(0);
  await page.goto("/ci-pack");
  await expect(page.getByRole("heading", { name: "This route has no request file" })).toBeVisible();
});

for (const route of ["/", "/demo"]) {
  test(`${route} exposes its mobile terminal output to keyboard users without serious axe issues`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    const output = page.locator('pre[aria-label="API Handoff Audit demo output"]').first();
    await expect(output).toHaveAttribute("tabindex", "0");
    await output.focus();
    await expect(output).toBeFocused();
    await expect(output).toHaveCSS("outline-style", "solid");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter(issue => ["serious", "critical"].includes(issue.impact ?? ""));
    expect(serious).toEqual([]);
  });
}

test("the deployment configuration gives hashed assets immutable caching", async () => {
  const config = JSON.parse(await readFile(join(process.cwd(), "dist/site/staticwebapp.config.json"), "utf8")) as {
    navigationFallback?: unknown;
    responseOverrides: Record<string, { rewrite: string }>;
    routes: { route: string; rewrite?: string; headers?: Record<string, string> }[];
  };
  const assetRoute = config.routes.find(route => route.route === "/assets/*");
  expect(assetRoute?.headers["Cache-Control"]).toBe("public, max-age=31536000, immutable");
  expect(config.navigationFallback).toBeUndefined();
  expect(config.responseOverrides["404"]).toEqual({ rewrite: "/404.html" });
  expect(config.routes.find(entry => entry.route === "/demo")?.rewrite).toBe("/demo.html");
  expect(config.routes.find(entry => entry.route === "/privacy")?.rewrite).toBe("/privacy.html");
  expect(config.routes.find(entry => entry.route === "/terms")?.rewrite).toBe("/terms.html");
  expect(config.routes.find(entry => entry.route === "/404")).toBeUndefined();
});

test("keyboard users can reach and open the sample audit", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.getByRole("link", { name: "Try it with sample data" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo\?demo=1$/);
});

test("?demo=1 opens the isolated sample directly and keeps its controls visible on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/?demo=1");
  await expect(page.getByRole("heading", { name: "Inspect a sample handoff report" })).toBeVisible();
  const banner = page.getByLabel("Demo mode");
  await expect(banner).toHaveCSS("position", "sticky");
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const box = await banner.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y + box!.height).toBeLessThanOrEqual(844);
  await expect(page.getByRole("button", { name: "Reset demo" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Start for real" })).toBeVisible();
});

test("direct route documents have their own social metadata before JavaScript runs", async () => {
  const expected = [
    ["demo.html", "Demo — API Handoff Audit", "https://api-handoff-audit.sociobot.in/demo"],
    ["privacy.html", "Privacy — API Handoff Audit", "https://api-handoff-audit.sociobot.in/privacy"],
    ["terms.html", "Terms — API Handoff Audit", "https://api-handoff-audit.sociobot.in/terms"],
  ];
  for (const [file, title, url] of expected) {
    const html = await readFile(join(process.cwd(), "dist/site", file), "utf8");
    expect(html).toContain(`<meta property="og:title" content="${title}"`);
    expect(html).toContain(`<meta name="twitter:title" content="${title}"`);
    expect(html).toContain(`<meta property="og:url" content="${url}"`);
  }
});

test("direct not-found navigation has the complete accessible site shell", async ({ page }) => {
  await page.goto("/404");
  await expect(page.getByRole("heading", { name: "This route has no request file" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to the audit" })).toBeVisible();
  await expect(page.locator("header.site-header")).toBeVisible();
  await expect(page.locator("footer")).toContainText("v0.1.0 · build 2026.08.29");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://api-handoff-audit.sociobot.in/404");
  await expect(page).toHaveTitle("Page not found — API Handoff Audit");
});

test("unknown routes show the designed in-app 404 page", async ({ page }) => {
  await page.goto("/missing-stall");
  await expect(page.getByRole("heading", { name: "This route has no request file" })).toBeVisible();
});
