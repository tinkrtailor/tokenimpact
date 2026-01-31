import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 6: URL State
 * Priority: High
 * Per specs/validation.md
 */
test.describe("URL State", () => {
  test("URL updates with params after quote submission", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Submit a quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("10");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    // Give time for URL to update
    await page.waitForTimeout(500);

    // URL should contain symbol param
    const url = page.url();
    expect(url).toContain("s=");
    expect(url).toContain("BTC");
  });

  test("URL contains side parameter", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Select SELL side
    await page.locator(SELECTORS.sellButton).click();

    // Submit a quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("10");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // URL should contain side param
    const url = page.url();
    expect(url.toLowerCase()).toContain("side=sell");
  });

  test("URL contains quantity parameter", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Submit a quote with specific quantity
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("42");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // URL should contain quantity param
    const url = page.url();
    expect(url).toContain("qty=42");
  });

  test("navigating to URL with params restores form state", async ({ page }) => {
    // Navigate directly to URL with params
    await page.goto("/?s=ETH-USDT&side=sell&qty=5");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Form should be populated
    await expect(page.locator(SELECTORS.symbolSelector)).toContainText("ETH-USDT");
    await expect(page.locator(SELECTORS.sellButton)).toHaveAttribute(
      "aria-checked",
      "true"
    );

    // Quantity should be set
    const quantityValue = await page.locator(SELECTORS.quantityInput).inputValue();
    expect(quantityValue).toBe("5");
  });

  test("URL with params auto-fetches results on load", async ({ page }) => {
    // Navigate directly to URL with params
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    await page.goto("/?s=BTC-USDT&side=buy&qty=1");

    // Should automatically fetch results
    await responsePromise;

    // Results should appear
    await page.waitForTimeout(500);
    const hasResults =
      (await page.locator('[class*="card"]').first().isVisible().catch(() => false)) ||
      (await page.locator("table").first().isVisible().catch(() => false));

    expect(hasResults).toBe(true);
  });

  test("shared URL works in new tab", async ({ page, context }) => {
    await page.goto(ROUTES.home);

    // Submit a quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("10");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // Get the URL
    const url = page.url();

    // Open in new tab
    const newPage = await context.newPage();
    await newPage.goto(url);
    await newPage.waitForLoadState("networkidle");

    // Form should be populated in new tab
    await expect(newPage.locator(SELECTORS.symbolSelector)).toContainText("BTC");

    // Should show results
    const hasResults =
      (await newPage.locator('[class*="card"]').first().isVisible().catch(() => false)) ||
      (await newPage.locator("table").first().isVisible().catch(() => false));

    expect(hasResults).toBe(true);

    await newPage.close();
  });

  test("browser back button restores previous state", async ({ page }) => {
    await page.goto(ROUTES.home);

    // First quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("10");
    await page.locator(SELECTORS.compareButton).click();

    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);
    const firstUrl = page.url();

    // Change to different symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /ETH-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("5");
    await page.locator(SELECTORS.compareButton).click();

    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // Press back
    await page.goBack();

    // Should restore previous state
    await page.waitForTimeout(500);
    expect(page.url()).toBe(firstUrl);
  });

  test("invalid URL params handled gracefully", async ({ page }) => {
    // Navigate with invalid params
    await page.goto("/?s=INVALID-PAIR&side=buy&qty=abc");

    // Page should still load without crashing
    await expect(page.getByText("Token Impact")).toBeVisible();

    // Form should be in default/empty state or show validation
    const selector = page.locator(SELECTORS.symbolSelector);
    await expect(selector).toBeVisible();
  });

  test("partial URL params handled correctly", async ({ page }) => {
    // Navigate with only symbol
    await page.goto("/?s=BTC-USDT");

    await page.waitForLoadState("networkidle");

    // Symbol should be set
    await expect(page.locator(SELECTORS.symbolSelector)).toContainText("BTC");

    // Side should default to BUY
    await expect(page.locator(SELECTORS.buyButton)).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });
});
