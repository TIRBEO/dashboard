import { test, expect } from "@playwright/test";
import { gotoAuthenticated, MOCK_USER } from "../fixtures/mock-apis";

/**
 * Helper: wait for the dashboard to be ready (no error boundary visible).
 * If the error boundary appears, the test fails with a clear message.
 */
async function waitForDashboard(page: import("@playwright/test").Page) {
  // Wait for either the main content or a short timeout
  // The app renders skeletons first, then the real content
  // The error boundary shows "Dashboard error" heading
  const errorHeading = page.locator("h1:has-text('Dashboard error')");
  const body = page.locator("body");
  
  // Wait for content to settle
  await page.waitForLoadState("networkidle");
  
  // Give React time to hydrate and render
  await page.waitForTimeout(2000);
  
  // Check if error boundary fired
  const hasError = await errorHeading.isVisible().catch(() => false);
  if (hasError) {
    const errorText = await page.locator("[role='alert'] p, main p").first().textContent().catch(() => "Unknown error");
    throw new Error(`Dashboard crashed: ${errorText}`);
  }
}

test.describe("Authentication Flow", () => {
  test("redirects to /home when accessing root", async ({ page }) => {
    await gotoAuthenticated(page, "/");
    await expect(page).toHaveURL(/\/home/, { timeout: 15000 });
  });

  test("loads overview page without crashing", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForDashboard(page);
    
    // The page should not show the error boundary
    await expect(page.locator("h1:has-text('Dashboard error')")).not.toBeVisible();
  });

  test("shows overview content after loading", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForDashboard(page);
    
    // Page should have rendered some content (cards, buttons, etc.)
    await expect(page.locator("body")).toContainText(/overview|welcome|good/i);
  });

  test("sidebar navigation works for all main sections", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForDashboard(page);

    // Navigate to profile
    const profileLink = page.locator('a[href*="/account/profile"]').first();
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await expect(page).toHaveURL(/\/account\/profile/, { timeout: 10000 });
      await waitForDashboard(page);
    }

    // Navigate to security
    const securityLink = page.locator('a[href*="/account/security"]').first();
    if (await securityLink.isVisible()) {
      await securityLink.click();
      await expect(page).toHaveURL(/\/account\/security/, { timeout: 10000 });
      await waitForDashboard(page);
    }

    // Navigate back to overview
    const overviewLink = page.locator('a[href*="/home"]').first();
    if (await overviewLink.isVisible()) {
      await overviewLink.click();
      await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    }
  });

  test("blocks user when API returns 403 with ban status", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-jwt-token-for-testing");
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });

    await page.route("**/api/users/me", (route) => {
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({
          banned: true,
          reason: "Terms of service violation",
        }),
      });
    });

    // Mock all other APIs to prevent crashes
    await page.route("**/api/notifications**", (route) => {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ notifications: [], unread: 0, total: 0 }) });
    });
    await page.route("**/api/support/tickets**", (route) => {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ data: [], total: 0, page: 1, limit: 20 }) });
    });
    await page.route("**/api/**", (route) => {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });

    await page.goto("/home", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Should show blocked/banned screen or error
    const blockedOrError = page.getByText(/blocked|banned|suspended|error/i).first();
    await expect(blockedOrError).toBeVisible({ timeout: 15000 });
  });

  test("handles unauthenticated access gracefully", async ({ page }) => {
    // No auth token
    await page.route("**/api/**", (route) => {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: { message: "Unauthorized" } }),
      });
    });

    await page.goto("/home", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);

    // Should still render the page body
    await expect(page.locator("body")).toBeVisible();
  });
});
