import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 2: Symbol Selector
 * Priority: Critical
 * Per specs/validation.md
 */
test.describe("Symbol Selector", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
  });

  test("dropdown opens on click", async ({ page }) => {
    const selector = page.locator(SELECTORS.symbolSelector);

    // Initially closed
    await expect(selector).toHaveAttribute("aria-expanded", "false");

    // Click to open
    await selector.click();

    // Should be open
    await expect(selector).toHaveAttribute("aria-expanded", "true");

    // Search input should be visible
    await expect(page.locator(SELECTORS.symbolSearch)).toBeVisible();
  });

  test("search filters symbols correctly", async ({ page }) => {
    // Open dropdown
    await page.locator(SELECTORS.symbolSelector).click();

    // Type in search
    const searchInput = page.locator(SELECTORS.symbolSearch);
    await searchInput.fill("BTC");

    // Wait for filtering
    await page.waitForTimeout(100);

    // Should show BTC pairs (use cmdk-item selector)
    await expect(page.locator('[cmdk-item]:has-text("BTC")').first()).toBeVisible();

    // Clear and search for ETH
    await searchInput.clear();
    await searchInput.fill("ETH");
    await page.waitForTimeout(100);

    // Should show ETH pairs
    await expect(page.locator('[cmdk-item]:has-text("ETH")').first()).toBeVisible();
  });

  test("selection updates selector display", async ({ page }) => {
    const selector = page.locator(SELECTORS.symbolSelector);

    // Open dropdown
    await selector.click();

    // Click on a symbol (BTC-USDT)
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();

    // Dropdown should close
    await expect(selector).toHaveAttribute("aria-expanded", "false");

    // Selector should show selected value
    await expect(selector).toContainText("BTC-USDT");
  });

  test("keyboard navigation works", async ({ page }) => {
    const selector = page.locator(SELECTORS.symbolSelector);

    // Focus and open with keyboard
    await selector.focus();
    await page.keyboard.press("Enter");

    // Should be open
    await expect(selector).toHaveAttribute("aria-expanded", "true");

    // Navigate with arrow keys
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Select with Enter
    await page.keyboard.press("Enter");

    // Dropdown should close
    await expect(selector).toHaveAttribute("aria-expanded", "false");

    // Should have a value selected
    const text = await selector.textContent();
    expect(text).not.toBe("Select pair...");
  });

  test("shows exchange availability badges", async ({ page }) => {
    // Open dropdown
    await page.locator(SELECTORS.symbolSelector).click();

    // Wait for dropdown to open
    await expect(page.locator(SELECTORS.symbolSelector)).toHaveAttribute("aria-expanded", "true");

    // Look for command items (cmdk uses [cmdk-item] attribute)
    const items = page.locator('[cmdk-item]');
    const firstOption = items.first();

    // Should have exchange abbreviations (BN, CB, KR)
    await expect(firstOption).toBeVisible();
    const optionText = await firstOption.textContent();

    // Should contain at least one exchange badge
    expect(
      optionText?.includes("BN") ||
        optionText?.includes("CB") ||
        optionText?.includes("KR")
    ).toBe(true);
  });

  test("escape key closes dropdown", async ({ page }) => {
    const selector = page.locator(SELECTORS.symbolSelector);

    // Open dropdown
    await selector.click();
    await expect(selector).toHaveAttribute("aria-expanded", "true");

    // Press Escape
    await page.keyboard.press("Escape");

    // Should be closed
    await expect(selector).toHaveAttribute("aria-expanded", "false");
  });

  test("clicking outside closes dropdown", async ({ page }) => {
    const selector = page.locator(SELECTORS.symbolSelector);

    // Open dropdown
    await selector.click();
    await expect(selector).toHaveAttribute("aria-expanded", "true");

    // Click outside (on the page header)
    await page.getByText("Token Impact").first().click();

    // Should be closed
    await expect(selector).toHaveAttribute("aria-expanded", "false");
  });
});
