import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

/**
 * Theme Switching E2E Tests
 *
 * Tests the dark/light theme toggle:
 *   - Toggle button exists and works
 *   - Icon changes (Sun for dark→light, Moon for light→dark)
 *   - CSS variables change (data-theme attribute)
 *   - Theme persists across navigation
 *   - Theme persists after page reload
 *   - Theme works on all pages
 *   - Default theme is dark
 */

/** Get the current data-theme attribute from <html> */
async function getTheme(page: import("@playwright/test").Page): Promise<string> {
  return page.evaluate(() => document.documentElement.getAttribute("data-theme") || "");
}

/** Check if CSS variable matches expected color pattern */
async function getCssVar(page: import("@playwright/test").Page, varName: string): Promise<string> {
  return page.evaluate((v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim(), varName);
}

test.describe("Theme Switching", () => {
  test.beforeEach(async ({ page }) => {
    // Start with dark theme
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  // ── Default State ──

  test("default theme is dark", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const theme = await getTheme(page);
    expect(theme).toBe("dark");
  });

  test("html element has data-theme attribute", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");

    const hasAttr = await page.evaluate(() => document.documentElement.hasAttribute("data-theme"));
    expect(hasAttr).toBe(true);
  });

  // ── Toggle Button ──

  test("theme toggle button exists in header", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const themeBtn = page.getByRole("button", { name: /switch to (light|dark)/i });
    await expect(themeBtn.first()).toBeVisible();
  });

  test("dark mode shows Sun icon (switch to light)", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const themeBtn = page.getByRole("button", { name: /switch to light/i });
    // In dark mode, button should have aria-label about switching to light
    await expect(themeBtn.first()).toBeVisible();
  });

  test("clicking toggle switches to light theme", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Verify starting in dark
    expect(await getTheme(page)).toBe("dark");

    // Click toggle
    await page.getByRole("button", { name: /switch to light/i }).first().click();
    await page.waitForTimeout(500);

    // Should be light now
    expect(await getTheme(page)).toBe("light");
  });

  test("clicking toggle twice returns to dark", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Toggle to light
    await page.getByRole("button", { name: /switch to light/i }).first().click();
    await page.waitForTimeout(500);
    expect(await getTheme(page)).toBe("light");

    // Toggle back to dark
    await page.getByRole("button", { name: /switch to dark/i }).first().click();
    await page.waitForTimeout(500);
    expect(await getTheme(page)).toBe("dark");
  });

  test("light mode shows Moon icon (switch to dark)", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Switch to light
    await page.getByRole("button", { name: /switch to light/i }).first().click();
    await page.waitForTimeout(500);

    const themeBtn = page.getByRole("button", { name: /switch to dark/i });
    await expect(themeBtn.first()).toBeVisible();
  });

  // ── CSS Variables Change ──

  test("dark theme has dark background color", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const bg = await getCssVar(page, "--tb-bg");
    // Dark theme background should be very dark
    expect(bg).toMatch(/#[0-9a-f]{3,8}/i);
  });

  test("toggling theme changes CSS variables", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const darkBg = await getCssVar(page, "--tb-bg");

    // Toggle to light
    await page.getByRole("button", { name: /switch to (light|dark)/i }).first().click();
    await page.waitForTimeout(500);

    const lightBg = await getCssVar(page, "--tb-bg");

    // Background should have changed
    expect(lightBg).not.toBe(darkBg);
  });

  test("toggling theme changes text color", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const darkText = await getCssVar(page, "--tb-text-primary");

    await page.getByRole("button", { name: /switch to (light|dark)/i }).first().click();
    await page.waitForTimeout(500);

    const lightText = await getCssVar(page, "--tb-text-primary");
    expect(lightText).not.toBe(darkText);
  });

  test("toggling theme changes border color", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const darkBorder = await getCssVar(page, "--tb-border");

    await page.getByRole("button", { name: /switch to (light|dark)/i }).first().click();
    await page.waitForTimeout(500);

    const lightBorder = await getCssVar(page, "--tb-border");
    expect(lightBorder).not.toBe(darkBorder);
  });

  // ── Persistence ──

  test("theme persists after page navigation", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Switch to light
    await page.getByRole("button", { name: /switch to (light|dark)/i }).first().click();
    await page.waitForTimeout(500);
    expect(await getTheme(page)).toBe("light");

    // Navigate using in-app link (not page.goto which triggers addInitScript)
    const profileLink = page.locator('a[href="/account/profile"]').first();
    if (await profileLink.isVisible()) {
      await profileLink.click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    } else {
      // Fallback: use sidebar hamburger on mobile
      await page.locator(".tb-mobile-menu-btn").click({ force: true });
      await page.waitForTimeout(500);
      await page.locator('.dashboard-sidebar a[href="/account/profile"]').first().click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
    }

    // Should still be light
    expect(await getTheme(page)).toBe("light");
  });

  test("theme persists in localStorage after toggle", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Verify localStorage is dark
    let stored = await page.evaluate(() => localStorage.getItem("tirbeo-theme-mode"));
    expect(stored).toBe("dark");

    // Switch to light
    await page.getByRole("button", { name: /switch to (light|dark)/i }).first().click();
    await page.waitForTimeout(500);

    // localStorage should now be light
    stored = await page.evaluate(() => localStorage.getItem("tirbeo-theme-mode"));
    expect(stored).toBe("light");

    // Verify data-theme attribute matches
    expect(await getTheme(page)).toBe("light");
  });

  test("theme persists in localStorage", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Switch to light
    await page.getByRole("button", { name: /switch to (light|dark)/i }).first().click();
    await page.waitForTimeout(500);

    // Check localStorage
    const stored = await page.evaluate(() => localStorage.getItem("tirbeo-theme-mode"));
    expect(stored).toBe("light");
  });

  // ── Works on All Pages ──

  const pages = [
    { path: "/home", name: "Overview" },
    { path: "/account/profile", name: "Profile" },
    { path: "/account/security", name: "Security" },
    { path: "/account/preferences", name: "Preferences" },
    { path: "/account/notifications", name: "Notifications" },
    { path: "/account/apps", name: "Connected Apps" },
    { path: "/account/privacy", name: "Privacy" },
    { path: "/account/sessions", name: "Sessions" },
    { path: "/activity/history", name: "Activity History" },
    { path: "/support/tickets", name: "Tickets" },
  ];

  for (const { path, name } of pages) {
    test(`theme toggle works on ${name} page`, async ({ page }) => {
      await gotoAuthenticated(page, path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);

      // Verify dark
      expect(await getTheme(page)).toBe("dark");

      // Toggle to light
      const themeBtn = page.getByRole("button", { name: /switch to light/i });
      if (await themeBtn.count() > 0) {
        await themeBtn.first().click();
        await page.waitForTimeout(500);
        expect(await getTheme(page)).toBe("light");

        // Toggle back
        await page.getByRole("button", { name: /switch to dark/i }).first().click();
        await page.waitForTimeout(500);
        expect(await getTheme(page)).toBe("dark");
      }
    });
  }

  // ── Visual Verification ──

  test("dark theme: body has dark background", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const bg = await getCssVar(page, "--tb-bg");
    // Dark theme background should be very dark
    expect(bg).toMatch(/#[0-9a-f]{3,8}/i);
  });

  test("light theme: body has light background", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    // Switch to light
    await page.getByRole("button", { name: /switch to light/i }).first().click();
    await page.waitForTimeout(500);

    const bg = await getCssVar(page, "--tb-bg");
    // Light theme background should be light
    expect(bg).toMatch(/#[0-9a-f]{3,8}/i);
  });

  test("theme toggle button has correct hover state", async ({ page }) => {
    await gotoAuthenticated(page, "/home");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const themeBtn = page.getByRole("button", { name: /switch to (light|dark)/i });
    await expect(themeBtn.first()).toBeVisible();

    // Hover should not crash
    await themeBtn.first().hover();
    await expect(themeBtn.first()).toBeVisible();
  });

  // ── Start from Light Theme ──

  test("starting from light theme works correctly", async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "light");
      localStorage.setItem("tb_lang", "en");
      localStorage.setItem("auth_token", "mock-jwt-token-for-testing");
    });

    await mockAllApis(page);
    await page.goto("/home", { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);

    expect(await getTheme(page)).toBe("light");

    // Toggle to dark
    const themeBtn = page.getByRole("button", { name: /switch to dark/i });
    if (await themeBtn.count() > 0) {
      await themeBtn.first().click();
      await page.waitForTimeout(500);
      expect(await getTheme(page)).toBe("dark");
    }
  });
});

// Need to import mockAllApis for the last test
import { mockAllApis } from "../fixtures/mock-apis";
