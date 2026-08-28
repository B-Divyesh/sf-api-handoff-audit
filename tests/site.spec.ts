import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = ["/", "/demo", "/ci-pack", "/privacy", "/terms", "/404"];

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

test("keyboard users can reach and open the sample audit", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
  await page.getByRole("link", { name: "Try it with sample data" }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/demo$/);
});

test("unknown routes show the designed in-app 404 page", async ({ page }) => {
  await page.goto("/missing-stall");
  await expect(page.getByRole("heading", { name: "This route has no request file" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to the audit" })).toBeVisible();
});
