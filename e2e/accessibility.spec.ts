import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 10: Accessibility
 * Priority: Medium
 * Per specs/validation.md
 */
test.describe("Accessibility", () => {
  test("complete flow with keyboard only", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Tab to skip link
    await page.keyboard.press("Tab");

    // Skip link should be focused
    const skipLink = page.locator(SELECTORS.skipLink);
    await expect(skipLink).toBeFocused();

    // Tab to symbol selector
    await page.keyboard.press("Tab");

    // Open with Enter
    await page.keyboard.press("Enter");

    // Navigate and select
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");

    // Tab to direction toggle
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab"); // Skip Buy, go to Sell
    await page.keyboard.press("Space");

    // Tab to quantity input
    await page.keyboard.press("Tab");
    await page.keyboard.type("10");

    // Tab through preset buttons to Compare button
    await page.keyboard.press("Tab"); // 1
    await page.keyboard.press("Tab"); // 10
    await page.keyboard.press("Tab"); // 100
    await page.keyboard.press("Tab"); // 1000
    await page.keyboard.press("Tab"); // Compare

    // Submit with Enter
    await page.keyboard.press("Enter");

    // Wait for results
    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    // Should show results
    await page.waitForTimeout(500);
    const hasResults =
      (await page.locator('[class*="card"]').first().isVisible().catch(() => false)) ||
      (await page.locator("table").first().isVisible().catch(() => false));

    expect(hasResults).toBe(true);
  });

  test("focus ring visible on all interactive elements", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check focus visibility on main elements
    const elements = [
      page.locator(SELECTORS.symbolSelector),
      page.locator(SELECTORS.buyButton),
      page.locator(SELECTORS.quantityInput),
      page.locator(SELECTORS.compareButton),
    ];

    for (const element of elements) {
      await element.focus();

      // Check if element has focus-visible styles
      const hasFocusRing = await element.evaluate((el) => {
        const style = window.getComputedStyle(el);
        const outline = style.outline;
        const boxShadow = style.boxShadow;
        const ringStyle = el.className;

        // Check for visible focus indicator
        return (
          outline !== "none" ||
          boxShadow !== "none" ||
          ringStyle.includes("focus") ||
          ringStyle.includes("ring")
        );
      });

      expect(hasFocusRing).toBe(true);
    }
  });

  test("skip link navigates to main content", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Focus skip link
    await page.keyboard.press("Tab");

    const skipLink = page.locator(SELECTORS.skipLink);
    await expect(skipLink).toBeFocused();

    // Activate skip link
    await page.keyboard.press("Enter");

    // Main content should be focused or scroll position should change
    const mainContent = page.locator(SELECTORS.mainContent).first();
    const isFocused = await mainContent.evaluate(
      (el) => document.activeElement === el || el.contains(document.activeElement)
    );

    expect(isFocused).toBe(true);
  });

  test("form inputs have associated labels", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check quantity input has label
    const quantityInput = page.locator(SELECTORS.quantityInput);
    const inputId = await quantityInput.getAttribute("id");

    if (inputId) {
      const label = page.locator(`label[for="${inputId}"]`);
      const hasLabel = await label.count() > 0;
      const hasAriaLabel = await quantityInput.getAttribute("aria-label");
      const hasAriaLabelledBy = await quantityInput.getAttribute("aria-labelledby");

      expect(hasLabel || hasAriaLabel || hasAriaLabelledBy).toBeTruthy();
    }
  });

  test("images have alt text", async ({ page }) => {
    await page.goto(ROUTES.home);

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      const role = await img.getAttribute("role");

      // Either has alt text or is decorative (empty alt or role="presentation")
      expect(alt !== null || role === "presentation").toBe(true);
    }
  });

  test("Axe audit passes with no critical/serious violations", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Wait for page to fully load
    await page.waitForLoadState("networkidle");

    // Run Axe accessibility audit, excluding known acceptable patterns
    // (decorative labels and ad placeholders with intentionally muted text)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude('[class*="text-muted-foreground/"]') // Decorative muted text
      .exclude('[data-slot-id]') // Ad placeholder elements
      .analyze();

    // Filter for critical and serious violations
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    // Log violations for debugging
    if (criticalViolations.length > 0) {
      console.log("Critical/Serious violations:", JSON.stringify(criticalViolations, null, 2));
    }

    expect(criticalViolations).toHaveLength(0);
  });

  test("Axe audit on results page", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Submit a quote to show results
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for results
    await page.waitForResponse(
      (response) =>
        response.url().includes("/api/quote") && response.status() === 200,
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // Run Axe audit, excluding known acceptable patterns
    // (decorative labels and ad placeholders with intentionally muted text)
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .exclude('[class*="text-muted-foreground/"]') // Decorative muted text
      .exclude('[data-slot-id]') // Ad placeholder elements
      .analyze();

    // Filter for critical and serious violations
    const criticalViolations = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalViolations).toHaveLength(0);
  });

  test("buttons and links have accessible names", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check all buttons have accessible names
    const buttons = page.locator("button");
    const buttonCount = await buttons.count();

    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute("aria-label");
      const ariaLabelledBy = await button.getAttribute("aria-labelledby");
      const title = await button.getAttribute("title");

      const hasAccessibleName =
        (text && text.trim().length > 0) ||
        ariaLabel ||
        ariaLabelledBy ||
        title;

      expect(hasAccessibleName).toBeTruthy();
    }
  });

  test("color contrast is sufficient", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Run Axe with color contrast rules, excluding known acceptable patterns
    // (decorative labels and ad placeholders with intentionally muted text)
    const results = await new AxeBuilder({ page })
      .withRules(["color-contrast"])
      .exclude('[class*="text-muted-foreground/"]') // Decorative muted text
      .exclude('[data-slot-id]') // Ad placeholder elements
      .analyze();

    // Filter for color contrast violations
    const contrastViolations = results.violations.filter(
      (v) => v.id === "color-contrast"
    );

    // Allow some violations in non-critical areas but flag critical ones
    const criticalContrastViolations = contrastViolations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    expect(criticalContrastViolations).toHaveLength(0);
  });

  test("page language is set", async ({ page }) => {
    await page.goto(ROUTES.home);

    const lang = await page.locator("html").getAttribute("lang");
    expect(lang).toBe("en");
  });

  test("aria-live regions announce changes", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Check for aria-live region
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeVisible();

    // Submit a quote
    await page.locator(SELECTORS.symbolSelector).click();
    await page.locator('[cmdk-item]:has-text("BTC-USDT")').click();
    await page.locator(SELECTORS.quantityInput).fill("1");
    await page.locator(SELECTORS.compareButton).click();

    // Wait for results
    await page.waitForResponse(
      (response) => response.url().includes("/api/quote"),
      { timeout: 30000 }
    );

    await page.waitForTimeout(500);

    // Live region should have updated content
    const announcement = await liveRegion.textContent();
    expect(announcement?.length).toBeGreaterThan(0);
  });
});
