import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Smoke Test - Quick Validation
 * Per specs/validation.md
 *
 * Covers only:
 * 1. App loads without error
 * 2. Can submit a quote
 * 3. Results display
 */
test.describe("Smoke Test", () => {
  test("app loads without error", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto(ROUTES.home);
    await page.waitForLoadState("networkidle");

    // Page should load with title
    await expect(page).toHaveTitle(/Token Impact/);

    // Main elements should be visible
    await expect(page.locator(SELECTORS.symbolSelector)).toBeVisible();
    await expect(page.locator(SELECTORS.quantityInput)).toBeVisible();
    await expect(page.locator(SELECTORS.compareButton)).toBeVisible();

    // No unexpected errors
    const unexpectedErrors = errors.filter(
      (error) =>
        !error.includes("Failed to load resource") &&
        !error.includes("net::ERR_")
    );
    expect(unexpectedErrors).toHaveLength(0);
  });

  test("can submit a quote", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Select symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();

    // Enter quantity
    await page.locator(SELECTORS.quantityInput).fill("1");

    // Submit
    await page.locator(SELECTORS.compareButton).click();

    // Wait for API response
    const response = await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    // Should get successful response
    expect(response.status()).toBe(200);
  });

  test("results display correctly", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Select symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();

    // Enter quantity
    await page.locator(SELECTORS.quantityInput).fill("1");

    // Submit
    await page.locator(SELECTORS.compareButton).click();

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Should show results (either cards or table)
    const hasResults =
      (await page.locator('[class*="card"]').first().isVisible().catch(() => false)) ||
      (await page.locator("table").first().isVisible().catch(() => false));

    expect(hasResults).toBe(true);

    // Should show BEST badge
    await expect(page.getByText("BEST")).toBeVisible({ timeout: 5000 });

    // Should have at least one exchange name
    const hasExchange =
      (await page.getByText("Binance").isVisible().catch(() => false)) ||
      (await page.getByText("Coinbase").isVisible().catch(() => false)) ||
      (await page.getByText("Kraken").isVisible().catch(() => false));

    expect(hasExchange).toBe(true);
  });
});
