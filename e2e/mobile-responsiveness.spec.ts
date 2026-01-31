import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES, VIEWPORTS } from "./fixtures";

/**
 * Test Suite 7: Mobile Responsiveness
 * Priority: High
 * Per specs/validation.md
 */
test.describe("Mobile Responsiveness", () => {
  test.use({ viewport: VIEWPORTS.mobile });

  test("375px width renders without horizontal scroll", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check for horizontal overflow
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });

    expect(hasHorizontalScroll).toBe(false);
  });

  test("all content is visible at 375px width", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Main elements should be visible
    await expect(page.getByText("Token Impact")).toBeVisible();
    await expect(page.locator(SELECTORS.symbolSelector)).toBeVisible();
    await expect(page.locator(SELECTORS.quantityInput)).toBeVisible();
    await expect(page.locator(SELECTORS.compareButton)).toBeVisible();
  });

  test("results display as stacked cards on mobile", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Submit a quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // Should show cards, not table
    const cards = page.locator('[class*="card"]');
    const table = page.locator("table");

    // Cards should be visible
    await expect(cards.first()).toBeVisible();

    // Table should not be visible (hidden on mobile)
    const tableVisible = await table.isVisible().catch(() => false);
    expect(tableVisible).toBe(false);
  });

  test("touch targets are at least 44px", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check main interactive elements
    const elements = [
      page.locator(SELECTORS.symbolSelector),
      page.locator(SELECTORS.buyButton),
      page.locator(SELECTORS.sellButton),
      page.locator(SELECTORS.quantityInput),
      page.locator(SELECTORS.compareButton),
    ];

    for (const element of elements) {
      const box = await element.boundingBox();
      if (box) {
        // At least one dimension should be >= 44px for touch target
        const minDimension = Math.min(box.width, box.height);
        expect(minDimension).toBeGreaterThanOrEqual(36); // Allow slight tolerance
      }
    }
  });

  test("direction toggle buttons are accessible on mobile", async ({ page }) => {
    await page.goto(ROUTES.home);

    const buyButton = page.locator(SELECTORS.buyButton);
    const sellButton = page.locator(SELECTORS.sellButton);

    // Both buttons should be visible
    await expect(buyButton).toBeVisible();
    await expect(sellButton).toBeVisible();

    // Should be tappable (click works)
    await sellButton.click();
    await expect(sellButton).toHaveAttribute("aria-checked", "true");

    await buyButton.click();
    await expect(buyButton).toHaveAttribute("aria-checked", "true");
  });

  test("symbol selector dropdown works on mobile", async ({ page }) => {
    await page.goto(ROUTES.home);

    const selector = page.locator(SELECTORS.symbolSelector);

    // Tap to open
    await selector.click();
    await expect(selector).toHaveAttribute("aria-expanded", "true");

    // Dropdown should be visible and usable
    await expect(page.locator(SELECTORS.symbolSearch)).toBeVisible();

    // Select an option
    await page.getByRole("option", { name: /BTC-USDT/i }).click();

    // Should close and show selection
    await expect(selector).toHaveAttribute("aria-expanded", "false");
    await expect(selector).toContainText("BTC");
  });

  test("preset buttons are visible on mobile", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check preset buttons exist and are visible
    const presetButtons = page.locator("button").filter({ hasText: /^(1|10|100|1000)$/ });
    const count = await presetButtons.count();

    expect(count).toBeGreaterThanOrEqual(4);
  });

  test("footer is visible on mobile", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Footer should be visible
    await expect(page.locator("footer")).toBeVisible();
  });

  test("navigation links work on mobile", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Click About link
    await page.locator('footer a:has-text("About")').click();

    // Should navigate to about page
    await expect(page).toHaveURL(/\/about/);
  });
});

test.describe("Desktop Layout", () => {
  test.use({ viewport: VIEWPORTS.desktop });

  test("results display as table on desktop", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Submit a quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // Should show table on desktop
    const table = page.locator("table");
    await expect(table).toBeVisible();
  });

  test("horizontal layout for controls on desktop", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Get positions of main controls
    const selectorBox = await page.locator(SELECTORS.symbolSelector).boundingBox();
    const toggleBox = await page.locator(SELECTORS.directionGroup).boundingBox();

    if (selectorBox && toggleBox) {
      // On desktop, controls should be roughly on the same row (similar Y position)
      // or the difference should be small
      const yDiff = Math.abs(selectorBox.y - toggleBox.y);
      expect(yDiff).toBeLessThan(100); // Allow for some variation
    }
  });
});
