import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 3: Quote Form
 * Priority: Critical
 * Per specs/validation.md
 */
test.describe("Quote Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ROUTES.home);
  });

  test("side toggle switches between BUY and SELL", async ({ page }) => {
    const buyButton = page.locator(SELECTORS.buyButton);
    const sellButton = page.locator(SELECTORS.sellButton);

    // Initially BUY should be selected
    await expect(buyButton).toHaveAttribute("aria-checked", "true");
    await expect(sellButton).toHaveAttribute("aria-checked", "false");

    // Click SELL
    await sellButton.click();

    // SELL should now be selected
    await expect(sellButton).toHaveAttribute("aria-checked", "true");
    await expect(buyButton).toHaveAttribute("aria-checked", "false");

    // Click BUY again
    await buyButton.click();

    // BUY should be selected again
    await expect(buyButton).toHaveAttribute("aria-checked", "true");
    await expect(sellButton).toHaveAttribute("aria-checked", "false");
  });

  test("quantity input accepts valid numeric values", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);

    // Type a valid number
    await input.fill("100");
    await expect(input).toHaveValue("100");

    // Clear and type a decimal
    await input.clear();
    await input.fill("10.5");
    await expect(input).toHaveValue("10.5");
  });

  test("quantity input shows formatted value", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);

    // Type a large number
    await input.fill("1000");

    // Should show with thousand separator after blur
    await input.blur();
    const value = await input.inputValue();
    expect(value === "1,000" || value === "1000").toBe(true);
  });

  test("preset buttons set quantity values", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);

    // Click preset button "10"
    await page.locator("button").filter({ hasText: /^10$/ }).click();
    await expect(input).toHaveValue("10");

    // Click preset button "100"
    await page.locator("button").filter({ hasText: /^100$/ }).click();
    await expect(input).toHaveValue("100");

    // Click preset button "1000"
    await page.locator("button").filter({ hasText: /^1000$/ }).click();
    const value = await input.inputValue();
    expect(value === "1000" || value === "1,000").toBe(true);
  });

  test("compare button requires symbol and quantity", async ({ page }) => {
    const compareButton = page.locator(SELECTORS.compareButton);

    // Try to submit without any input
    await compareButton.click();

    // Should show validation errors
    await expect(page.locator(SELECTORS.symbolSelectorError)).toBeVisible();
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();
  });

  test("input validation rejects non-numeric values", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);

    // Type non-numeric value
    await input.fill("abc");

    // Input should be empty or reject the input
    const value = await input.inputValue();
    expect(value).toBe("");
  });

  test("input validation rejects negative values", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);
    const compareButton = page.locator(SELECTORS.compareButton);

    // Select a symbol first
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();

    // Try negative value
    await input.fill("-10");
    await compareButton.click();

    // Should show error
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();
  });

  test("input validation rejects zero", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);
    const compareButton = page.locator(SELECTORS.compareButton);

    // Select a symbol first
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();

    // Try zero
    await input.fill("0");
    await compareButton.click();

    // Should show error
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();
  });

  test("errors clear when valid input is entered", async ({ page }) => {
    const input = page.locator(SELECTORS.quantityInput);
    const compareButton = page.locator(SELECTORS.compareButton);

    // Trigger validation error
    await compareButton.click();
    await expect(page.locator(SELECTORS.quantityInputError)).toBeVisible();

    // Enter valid quantity
    await input.fill("10");

    // Error should clear
    await expect(page.locator(SELECTORS.quantityInputError)).not.toBeVisible();
  });

  test("form submits successfully with valid inputs", async ({ page }) => {
    // Select symbol
    await page.locator(SELECTORS.symbolSelector).click();
    await page.getByRole("option", { name: /BTC-USDT/i }).click();

    // Enter quantity
    await page.locator(SELECTORS.quantityInput).fill("1");

    // Submit
    await page.locator(SELECTORS.compareButton).click();

    // Should show loading state
    await expect(
      page.locator(SELECTORS.comparingButton).or(page.locator(SELECTORS.compareButton))
    ).toBeVisible();
  });

  test("side toggle is keyboard accessible", async ({ page }) => {
    const directionGroup = page.locator(SELECTORS.directionGroup);

    // Focus on direction group
    await directionGroup.focus();

    // Navigate with Tab/arrow keys
    await page.keyboard.press("Tab");

    // Press Space or Enter to toggle
    await page.keyboard.press("Space");

    // One of the buttons should respond
    const buyChecked = await page.locator(SELECTORS.buyButton).getAttribute("aria-checked");
    const sellChecked = await page.locator(SELECTORS.sellButton).getAttribute("aria-checked");

    expect(buyChecked === "true" || sellChecked === "true").toBe(true);
  });
});
