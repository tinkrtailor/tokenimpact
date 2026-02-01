import { test, expect } from "@playwright/test";
import { ROUTES } from "./fixtures";

/**
 * Test Suite 8: Static Pages
 * Priority: Medium
 * Per specs/validation.md
 */
test.describe("Static Pages", () => {
  test("/about page loads correctly", async ({ page }) => {
    await page.goto(ROUTES.about);

    // Page should load
    await expect(page).toHaveTitle(/About/i);

    // Content should render
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // No console errors
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.waitForLoadState("networkidle");

    const unexpectedErrors = errors.filter(
      (error) =>
        !error.includes("Failed to load resource") &&
        !error.includes("net::ERR_") &&
        !error.includes("SSL error") &&
        !error.includes("Content Security Policy")
    );
    expect(unexpectedErrors).toHaveLength(0);
  });

  test("/methodology page loads correctly", async ({ page }) => {
    await page.goto(ROUTES.methodology);

    // Page should load
    await expect(page).toHaveTitle(/Methodology/i);

    // Content should render
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have methodology content
    await expect(page.getByText(/orderbook|calculation|algorithm/i).first()).toBeVisible();
  });

  test("/faq page loads correctly", async ({ page }) => {
    await page.goto(ROUTES.faq);

    // Page should load
    await expect(page).toHaveTitle(/FAQ/i);

    // Content should render
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have FAQ content (questions)
    const questions = page.locator("h2, h3, dt, summary");
    const count = await questions.count();
    expect(count).toBeGreaterThan(5);
  });

  test("/privacy page loads correctly", async ({ page }) => {
    await page.goto(ROUTES.privacy);

    // Page should load
    await expect(page).toHaveTitle(/Privacy/i);

    // Content should render
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Should have privacy content
    await expect(page.getByText(/data|privacy|information/i).first()).toBeVisible();
  });

  test("footer links work correctly", async ({ page }) => {
    await page.goto(ROUTES.home);

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check About link
    const aboutLink = page.locator('footer a:has-text("About")');
    await expect(aboutLink).toBeVisible();
    await aboutLink.click();
    await expect(page).toHaveURL(/\/about/);

    // Go back and check Methodology
    await page.goto(ROUTES.home);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const methodologyLink = page.locator('footer a:has-text("Methodology")');
    await expect(methodologyLink).toBeVisible();
    await methodologyLink.click();
    await expect(page).toHaveURL(/\/methodology/);

    // Go back and check FAQ
    await page.goto(ROUTES.home);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const faqLink = page.locator('footer a:has-text("FAQ")');
    await expect(faqLink).toBeVisible();
    await faqLink.click();
    await expect(page).toHaveURL(/\/faq/);

    // Go back and check Privacy
    await page.goto(ROUTES.home);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const privacyLink = page.locator('footer a:has-text("Privacy")');
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await expect(page).toHaveURL(/\/privacy/);
  });

  test("static pages have proper heading hierarchy", async ({ page }) => {
    const pages = [ROUTES.about, ROUTES.methodology, ROUTES.faq, ROUTES.privacy];

    for (const route of pages) {
      await page.goto(route);

      // Should have exactly one h1
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);

      // First heading should be h1
      const firstHeading = page.locator("h1, h2, h3, h4, h5, h6").first();
      const tagName = await firstHeading.evaluate((el) => el.tagName.toLowerCase());
      expect(tagName).toBe("h1");
    }
  });

  test("static pages have internal navigation", async ({ page }) => {
    await page.goto(ROUTES.about);

    // Should have link back to calculator
    const calcLink = page.locator('a[href="/"]').first();
    await expect(calcLink).toBeVisible();
  });

  test("static pages have consistent footer", async ({ page }) => {
    const pages = [ROUTES.home, ROUTES.about, ROUTES.methodology, ROUTES.faq, ROUTES.privacy];

    for (const route of pages) {
      await page.goto(route);

      // Each page should have footer
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await expect(page.locator("footer")).toBeVisible();

      // Footer should have affiliate disclosure
      const disclosure = page.getByText(/earn|commission|affiliate/i).first();
      await expect(disclosure).toBeVisible();
    }
  });

  test("FAQ page has structured data", async ({ page }) => {
    await page.goto(ROUTES.faq);

    // Check for FAQPage JSON-LD
    const jsonLd = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const script of scripts) {
        try {
          const data = JSON.parse(script.textContent || "");
          if (data["@type"] === "FAQPage" || data?.["@graph"]?.some?.((item: { "@type": string }) => item["@type"] === "FAQPage")) {
            return true;
          }
        } catch {
          continue;
        }
      }
      return false;
    });

    expect(jsonLd).toBe(true);
  });

  test("static pages have meta descriptions", async ({ page }) => {
    const pages = [ROUTES.about, ROUTES.methodology, ROUTES.faq, ROUTES.privacy];

    for (const route of pages) {
      await page.goto(route);

      const metaDescription = await page.locator('meta[name="description"]').getAttribute("content");
      expect(metaDescription?.length).toBeGreaterThan(50);
    }
  });
});
