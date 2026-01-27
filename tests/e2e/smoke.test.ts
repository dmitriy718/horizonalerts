import { test, expect } from "@playwright/test";

test.describe("Smoke Tests", () => {
  test("Homepage loads correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Horizon Alerts/);
    await expect(page.locator("h1")).toContainText("Signals that never repaint");
  });

  test("Public feed displays signals", async ({ page }) => {
    await page.goto("/");
    // We expect either signals or the empty state message
    const emptyState = page.locator("text=No public signals in the last session");
    const signals = page.locator(".group.relative"); // SignalCard class

    const isEmptyVisible = await emptyState.isVisible();
    const isSignalsVisible = await signals.count() > 0;

    expect(isEmptyVisible || isSignalsVisible).toBeTruthy();
  });

  test("API Health check", async ({ page }) => {
    const response = await page.request.get("http://localhost:4000/health");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.service).toBe("api");
  });
});
