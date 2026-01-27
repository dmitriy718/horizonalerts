import { test, expect } from "@playwright/test";

test.describe("Full E2E Flow", () => {
  
  test("Public Visitor can browse pages", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Horizon Alerts/);
    
    await page.click("text=Pricing");
    await expect(page).toHaveURL(/\/pricing/);
    
    await page.click("text=Academy");
    await expect(page).toHaveURL(/\/academy/);
    
    // Check if lessons are loaded
    await expect(page.locator("text=Start Lesson").first()).toBeVisible();
  });

  test("Guest can submit support ticket", async ({ page }) => {
    await page.goto("/support");
    await page.fill('input[type="text"]', "Test User");
    await page.fill('input[type="email"]', "test@example.com");
    await page.fill('input[placeholder="Brief summary of your issue"]', "Test Subject");
    await page.fill('textarea', "This is a test message from Playwright.");
    await page.click("button:has-text('Send Message')");
    
    await expect(page.locator("text=Message Received")).toBeVisible();
  });

  test("Onboarding wizard flow (Free)", async ({ page }) => {
    await page.goto("/onboarding?plan=free");
    await expect(page.locator("text=Setup Your Profile")).toBeVisible();
    
    // Step 1
    await page.click("text=Beginner");
    // Step 2
    await page.click("text=Day Trading");
    // Step 3
    await page.click("text=Conservative");
    
    // Auth Step (Visual check)
    await expect(page.locator("text=Create Your Account")).toBeVisible();
  });

});
