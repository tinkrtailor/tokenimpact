import { test, expect } from "@playwright/test";
import { SELECTORS, ROUTES } from "./fixtures";

/**
 * Test Suite 1: App Loads
 * Priority: Critical
 * Per specs/validation.md
 */
test.describe("App Loads", () => {
  test("homepage loads with correct title", async ({ page }) => {
    await page.goto(ROUTES.home);
    await expect(page).toHaveTitle(/Token Impact/);
  });

  test("homepage has no console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto(ROUTES.home);
    await page.waitForLoadState("networkidle");

    // Filter out expected third-party errors and SSL errors (external resources)
    const unexpectedErrors = errors.filter(
      (error) =>
        !error.includes("Failed to load resource") &&
        !error.includes("net::ERR_") &&
        !error.includes("SSL error") &&
        !error.includes("Content Security Policy")
    );

    expect(unexpectedErrors).toHaveLength(0);
  });

  test("homepage has no React hydration warnings", async ({ page }) => {
    const hydrationWarnings: string[] = [];

    page.on("console", (msg) => {
      const text = msg.text();
      if (
        text.includes("hydration") ||
        text.includes("Hydration") ||
        text.includes("did not match") ||
        text.includes("server rendered HTML")
      ) {
        hydrationWarnings.push(text);
      }
    });

    await page.goto(ROUTES.home);
    await page.waitForLoadState("networkidle");

    expect(hydrationWarnings).toHaveLength(0);
  });

  test("homepage LCP is under 3 seconds", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Wait for page to stabilize
    await page.waitForLoadState("networkidle");

    // Use Web Vitals API to measure LCP
    const lcp = await page.evaluate(() => {
      return new Promise<number>((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            resolve(lastEntry.startTime);
          }
        }).observe({ type: "largest-contentful-paint", buffered: true });

        // Fallback if LCP already happened
        setTimeout(() => {
          const entries = performance.getEntriesByType(
            "largest-contentful-paint"
          );
          if (entries.length > 0) {
            const lastEntry = entries[entries.length - 1];
            if (lastEntry) {
              resolve(lastEntry.startTime);
            }
          }
          resolve(0);
        }, 100);
      });
    });

    expect(lcp).toBeLessThan(3000);
  });

  test("main content area exists", async ({ page }) => {
    await page.goto(ROUTES.home);
    // Use first() since there may be nested main elements
    await expect(page.locator(SELECTORS.mainContent).first()).toBeVisible();
  });

  test("page header displays correctly", async ({ page }) => {
    await page.goto(ROUTES.home);
    // Use heading role to avoid matching other elements containing "Token Impact"
    await expect(page.getByRole("heading", { name: "Token Impact" })).toBeVisible();
    await expect(
      page.getByText("Compare price impact across exchanges")
    ).toBeVisible();
  });
});
