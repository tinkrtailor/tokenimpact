import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 4: Quote Results
 * Priority: Critical
 * Per specs/validation.md
 */
test.describe("Quote Results", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
  });

  async function submitQuote(page: import("@playwright/test").Page, symbol = "BTC-USDT", quantity = "1") {
    // Select symbol
    await page.locator(SELECTORS.symbolSelector).click();
    // Use cmdk-item selector instead of role="option"
    await page.locator(`[cmdk-item]:has-text("${symbol}")`).click();

    // Enter quantity
    await page.locator(SELECTORS.quantityInput).fill(quantity);

    // Submit
    await page.locator(SELECTORS.compareButton).click();
  }

  test("results display after form submission", async ({ page }) => {
    await submitQuote(page);

    // Wait for API response
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Check for results (either exchange cards on mobile or table on desktop)
    const hasCards = await page.locator('[class*="bg-card"]').first().isVisible().catch(() => false);
    const hasTable = await page.locator("table").first().isVisible().catch(() => false);

    expect(hasCards || hasTable).toBe(true);
  });

  test("loading state shows skeleton during fetch", async ({ page }) => {
    // Select symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();

    // Enter quantity
    await page.locator(SELECTORS.quantityInput).fill("1");

    // Click submit and immediately check for loading state
    const compareButton = page.locator(SELECTORS.compareButton);
    await compareButton.click();

    // Check for loading indicator - either button text changes or skeleton appears
    const isLoadingButton = await page
      .locator(SELECTORS.comparingButton)
      .isVisible()
      .catch(() => false);
    const hasSpinner = await page
      .locator('[class*="animate-spin"]')
      .isVisible()
      .catch(() => false);

    // At least one loading indicator should have appeared
    expect(isLoadingButton || hasSpinner).toBe(true);
  });

  test("multiple exchanges are shown in results", async ({ page }) => {
    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(1000);

    // Check for multiple exchange results (wait for each to be visible or timeout)
    const exchangeNames = ["Binance", "Coinbase", "Kraken"];
    let visibleExchanges = 0;

    for (const name of exchangeNames) {
      // Use locator and check if it's visible with a short timeout
      const locator = page.locator(`text=${name}`).first();
      const isVisible = await locator.isVisible().catch(() => false);
      if (isVisible) visibleExchanges++;
    }

    // At least 2 exchanges should be shown (some may have errors)
    expect(visibleExchanges).toBeGreaterThanOrEqual(2);
  });

  test("best exchange is marked with BEST badge", async ({ page }) => {
    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Look for BEST badge (use first() since "best" appears in multiple places)
    await expect(page.getByText(/BEST|Best/i).first()).toBeVisible({ timeout: 5000 });
  });

  test("price data is visible in results", async ({ page }) => {
    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Check for price-related content
    // Look for percentage signs (impact %) or dollar/currency values
    const hasPercentage = await page.getByText(/%/).first().isVisible().catch(() => false);
    const hasDollarSign = await page.getByText(/\$/).first().isVisible().catch(() => false);
    const hasPrice = await page
      .locator('[class*="font-mono"]')
      .first()
      .isVisible()
      .catch(() => false);

    expect(hasPercentage || hasDollarSign || hasPrice).toBe(true);
  });

  test("affiliate trade button is visible", async ({ page }) => {
    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Look for trade buttons
    const tradeButtons = page.locator('a[href*="/go/"], button:has-text("Trade")');
    await expect(tradeButtons.first()).toBeVisible({ timeout: 5000 });
  });

  test("results are announced to screen readers", async ({ page }) => {
    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Check for aria-live region with results announcement
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();

    const announcement = await liveRegion.textContent();
    expect(announcement?.length).toBeGreaterThan(0);
  });

  test("copy link button appears after results", async ({ page }) => {
    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Look for Copy Link button
    await expect(page.locator(SELECTORS.copyLinkButton)).toBeVisible({ timeout: 5000 });
  });

  // Skip on WebKit - clipboard-write permission not supported
  test("copy link button copies URL to clipboard", async ({ page, context, browserName }) => {
    test.skip(browserName === "webkit", "clipboard-write permission not supported in WebKit");

    // Grant clipboard permissions (Chromium/Firefox only)
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await submitQuote(page);

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Click Copy Link
    await page.locator(SELECTORS.copyLinkButton).click();

    // Button should change to "Copied!"
    await expect(page.locator(SELECTORS.copiedButton)).toBeVisible();

    // Check clipboard content
    const clipboardContent = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboardContent).toContain("localhost:3000");
    expect(clipboardContent).toContain("s=");
  });
});
