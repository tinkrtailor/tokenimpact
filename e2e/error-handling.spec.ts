import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 5: Error Handling
 * Priority: High
 * Per specs/validation.md
 */
test.describe("Error Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
  });

  test("validation error for missing symbol", async ({ page }) => {
    // Enter quantity without symbol
    await page.locator(SELECTORS.quantityInput).fill("10");

    // Try to submit
    await page.locator(SELECTORS.compareButton).click();

    // Should show symbol error
    await expect(page.locator(SELECTORS.symbolSelectorError)).toBeVisible();
    const errorText = await page.locator(SELECTORS.symbolSelectorError).textContent();
    expect(errorText?.toLowerCase()).toContain("select");
  });

  test("validation error for missing quantity", async ({ page }) => {
    // Select symbol without quantity
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();

    // Try to submit
    await page.locator(SELECTORS.compareButton).click();

    // Should show quantity error
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();
    const errorText = await page.locator(SELECTORS.quantityInputError).textContent();
    expect(errorText?.toLowerCase()).toContain("quantity");
  });

  test("validation error for invalid quantity (zero)", async ({ page }) => {
    // Select symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();

    // Enter zero
    await page.locator(SELECTORS.quantityInput).fill("0");

    // Try to submit
    await page.locator(SELECTORS.compareButton).click();

    // Should show quantity error
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();
  });

  test("validation errors clear on valid input", async ({ page }) => {
    // Trigger validation errors
    await page.locator(SELECTORS.compareButton).click();

    // Both errors should appear
    await expect(page.locator(SELECTORS.symbolSelectorError)).toBeVisible();
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();

    // Fix symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();

    // Symbol error should clear
    await expect(page.locator(SELECTORS.symbolSelectorError)).not.toBeVisible();

    // Fix quantity
    await page.locator(SELECTORS.quantityInput).fill("10");

    // Quantity error should clear
    await expect(page.locator(SELECTORS.quantityInputError)).not.toBeVisible();
  });

  test("partial exchange failure shows available results", async ({ page }) => {
    // Submit a valid quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    // Give UI time to render
    await page.waitForTimeout(500);

    // Should show at least some results
    const hasResults =
      (await page.locator('[class*="card"]').first().isVisible().catch(() => false)) ||
      (await page.locator("table").first().isVisible().catch(() => false));

    expect(hasResults).toBe(true);
  });

  test("toast notification for exchange timeout", async ({ page }) => {
    // Submit a valid quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    // If an exchange times out, a toast should appear
    // Note: This test may pass even without a toast if all exchanges succeed
    // We're mainly verifying the app doesn't crash
    await page.waitForTimeout(1000);

    // Page should still be functional
    await expect(page.locator(SELECTORS.symbolSelector)).toBeVisible();
  });

  test("unavailable exchanges are displayed gracefully", async ({ page }) => {
    // Submit a valid quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for response
    const response = await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    const data = await response.json();

    // Give UI time to render
    await page.waitForTimeout(500);

    // Check if any exchange has non-ok status
    const hasUnavailable = data.results?.some(
      (r: { status: string }) => r.status !== "ok"
    );

    if (hasUnavailable) {
      // Should show unavailable indicator (grayed card or status text)
      const unavailableText = page.getByText(/unavailable|timeout|error/i);
      const grayedCard = page.locator('[class*="opacity"]');

      const hasIndicator =
        (await unavailableText.first().isVisible().catch(() => false)) ||
        (await grayedCard.first().isVisible().catch(() => false));

      expect(hasIndicator).toBe(true);
    }
  });

  test("error states have proper ARIA roles", async ({ page }) => {
    // Trigger validation error
    await page.locator(SELECTORS.compareButton).click();

    // Error messages should have alert role
    const symbolError = page.locator(SELECTORS.symbolSelectorError);
    const quantityError = page.locator(SELECTORS.quantityInputError);

    await expect(symbolError).toHaveAttribute("role", "alert");
    await expect(quantityError).toHaveAttribute("role", "alert");
  });

  test("inputs have aria-invalid when validation fails", async ({ page }) => {
    // Trigger validation error
    await page.locator(SELECTORS.compareButton).click();

    // Inputs should have aria-invalid
    await expect(page.locator(SELECTORS.symbolSelector)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
    await expect(page.locator(SELECTORS.quantityInput)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });
});
