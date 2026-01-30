import { test, expect } from "@playwright/test";

test.describe("Auth & Dashboard Flow", () => {
  
  test("Complete Signup Flow", async ({ page }) => {
    // 1. Start at Home
    await page.goto("/");
    await page.click("text=Get Access"); // Links to pricing? Or Navbar "Get Access" button links to Pricing.
    
    // Direct navigation to Auth for robust testing
    await page.goto("/auth?mode=signup");
    
    // 2. Fill Signup Form
    const timestamp = Date.now();
    const email = `dmitriyzag718+test${timestamp}@gmail.com`;
    
    await page.fill('input[name="firstName"]', "Test");
    await page.fill('input[name="lastName"]', "Bot");
    await page.fill('input[name="age"]', "30");
    await page.fill('input[name="zipCode"]', "90210");
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', "Password123!");
    
    // 3. Submit
    await page.click("button:has-text('Create Account')");
    
    // 4. Verify Redirect to Dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    
    // 5. Check Dashboard Elements
    await expect(page.locator("text=Live Dashboard")).toBeVisible();
    await expect(page.locator("text=Scanner")).toBeVisible();
    
    // 6. Check Signal Feed (Real Data)
    // Wait for signal feed to populate (might take 5s due to polling)
    // We check for "Entry Zone" text which appears on cards
    await expect(page.locator("text=Entry Zone").first()).toBeVisible({ timeout: 15000 });
    
    // 7. Test Chart Modal
    // Click the first signal card
    await page.click(".glass-card");
    // Expect TradingView chart to appear (iframe or container)
    await expect(page.locator(".tradingview-widget-container")).toBeVisible();
  });

});
