import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

/**
 * Visual Regression Tests
 *
 * Captures baseline screenshots for all dashboard pages and key UI states.
 * Screenshots are stored in e2e/snapshots/ and compared on subsequent runs.
 *
 * Usage:
 *   npx playwright test e2e/tests/visual-regression.spec.ts --update-snapshots
 *   npx playwright test e2e/tests/visual-regression.spec.ts
 */

// Disable animations for deterministic screenshots
test.use({ viewport: { width: 1440, height: 900 } });

/** Wait for page to be fully rendered (no skeletons, no loading) */
async function waitForStable(page: import("@playwright/test").Page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
  // Ensure no skeleton animations are running
  await page.evaluate(() => {
    document.querySelectorAll(".skeleton, [class*=Skeleton]").forEach((el) => {
      (el as HTMLElement).style.animationPlayState = "paused";
    });
  });
}

/** The sidebar <aside> element — used as mask target in screenshots */
const sidebar = (page: import("@playwright/test").Page) => page.locator("aside").first();

test.describe("Visual Regression — Desktop (Dark Theme)", () => {
  test.beforeEach(async ({ page }) => {
    // Set dark theme
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("overview page", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("overview-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("overview page — full page", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("overview-dark-full.png", {
      fullPage: true,
      mask: [sidebar(page)],
    });
  });

  test("profile page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/profile");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("profile-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("security page — with Security Score", async ({ page }) => {
    await gotoAuthenticated(page, "/account/security");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("security-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("security page — full page with 2FA, password, recovery", async ({ page }) => {
    await gotoAuthenticated(page, "/account/security");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("security-dark-full.png", {
      fullPage: true,
      mask: [sidebar(page)],
    });
  });

  test("tickets list page", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("tickets-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("ticket detail page", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets/tkt_001");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("ticket-detail-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("inbox page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/inbox");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("inbox-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("notifications settings page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/notifications");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("notifications-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("preferences page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/preferences");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("preferences-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("sessions page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/sessions");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("sessions-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("privacy page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/privacy");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("privacy-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("activity history page", async ({ page }) => {
    await gotoAuthenticated(page, "/activity/history");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("activity-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("connected apps page", async ({ page }) => {
    await gotoAuthenticated(page, "/account/apps");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("apps-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("new ticket page", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets/new");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("new-ticket-dark.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });
});

test.describe("Visual Regression — Desktop (Light Theme)", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "light");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("overview page — light theme", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("overview-light.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("security page — light theme", async ({ page }) => {
    await gotoAuthenticated(page, "/account/security");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("security-light.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("profile page — light theme", async ({ page }) => {
    await gotoAuthenticated(page, "/account/profile");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("profile-light.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("tickets list — light theme", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("tickets-light.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });

  test("inbox — light theme", async ({ page }) => {
    await gotoAuthenticated(page, "/account/inbox");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("inbox-light.png", {
      fullPage: false,
      mask: [sidebar(page)],
    });
  });
});

test.describe("Visual Regression — UI Components", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("search overlay — empty state", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await page.keyboard.press("Control+k");
    // Search overlay is a fixed full-screen div with z-[100]
    await expect(page.locator("[class*='z-\\[100\\]']").first()).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveScreenshot("search-overlay-empty-dark.png", {
      fullPage: false,
    });
  });

  test("search overlay — filtered results", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await page.keyboard.press("Control+k");
    await expect(page.locator("[class*='z-\\[100\\]']").first()).toBeVisible({ timeout: 5000 });
    // Type in the search input inside the overlay
    await page.locator("[class*='z-\\[100\\]'] input").fill("sec");
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("search-overlay-filtered-dark.png", {
      fullPage: false,
    });
  });

  test("search overlay — no results", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await page.keyboard.press("Control+k");
    await expect(page.locator("[class*='z-\\[100\\]']").first()).toBeVisible({ timeout: 5000 });
    await page.locator("[class*='z-\\[100\\]'] input").fill("zzz_nonexistent");
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot("search-overlay-no-results-dark.png", {
      fullPage: false,
    });
  });

  test("notification panel — with notifications", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    // Open notification panel by clicking the bell button in the header
    const bellBtn = page.locator("[aria-label]").filter({ hasText: /notification|bell/i }).first();
    if (await bellBtn.isVisible().catch(() => false)) {
      await bellBtn.click();
      await page.waitForTimeout(1000);
    } else {
      // Fallback: click the second button in the header controls area
      const headerBtns = page.locator("header button, [class*='header'] button");
      if ((await headerBtns.count()) > 1) {
        await headerBtns.nth(1).click();
        await page.waitForTimeout(1000);
      }
    }
    await expect(page).toHaveScreenshot("notification-panel-dark.png", {
      fullPage: false,
    });
  });

  test("sidebar — desktop", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await expect(sidebar(page)).toHaveScreenshot("sidebar-desktop-dark.png");
  });

  test("error boundary — 404 page", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-jwt-token-for-testing");
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
    await page.route("**/api/**", (route) => {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });
    await page.goto("/nonexistent-page", { waitUntil: "networkidle" });
    await page.waitForTimeout(2000);
    await expect(page).toHaveScreenshot("not-found-dark.png", {
      fullPage: false,
    });
  });

  test("blocked/banned screen", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "mock-jwt-token-for-testing");
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
    await page.route("**/api/users/me", (route) => {
      return route.fulfill({
        status: 403,
        contentType: "application/json",
        body: JSON.stringify({ banned: true, reason: "Terms of service violation" }),
      });
    });
    await page.route("**/api/**", (route) => {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
    });
    await page.goto("/home", { waitUntil: "networkidle" });
    await page.waitForTimeout(3000);
    await expect(page).toHaveScreenshot("blocked-screen-dark.png", {
      fullPage: false,
    });
  });
});

test.describe("Visual Regression — Mobile", () => {
  test.use({ viewport: { width: 412, height: 915 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("overview — mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("overview-mobile-dark.png", {
      fullPage: false,
    });
  });

  test("mobile sidebar — open", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await waitForStable(page);
    // Click the hamburger menu button (aria-label for menu toggle)
    const menuBtn = page.getByRole("button", { name: /menu|navigation/i });
    if (await menuBtn.isVisible().catch(() => false)) {
      await menuBtn.click();
    } else {
      // Fallback: find the Menu icon button in the header
      await page.locator("header button, [class*='header'] button").first().click();
    }
    await page.waitForTimeout(500);
    await expect(page).toHaveScreenshot("mobile-sidebar-open-dark.png", {
      fullPage: false,
    });
  });

  test("profile — mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/account/profile");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("profile-mobile-dark.png", {
      fullPage: false,
    });
  });

  test("security — mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/account/security");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("security-mobile-dark.png", {
      fullPage: false,
    });
  });

  test("tickets — mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("tickets-mobile-dark.png", {
      fullPage: false,
    });
  });

  test("inbox — mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/account/inbox");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("inbox-mobile-dark.png", {
      fullPage: false,
    });
  });

  test("notifications settings — mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/account/notifications");
    await waitForStable(page);
    await expect(page).toHaveScreenshot("notifications-mobile-dark.png", {
      fullPage: false,
    });
  });
});
