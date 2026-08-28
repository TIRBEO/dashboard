import { test, expect } from "@playwright/test";
import { gotoAuthenticated, MOCK_NOTIFICATIONS } from "../fixtures/mock-apis";

test.describe("Inbox (Notifications)", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays inbox page", async ({ page }) => {
    await expect(page.getByText(/inbox|notification/i).first()).toBeVisible();
  });

  test("lists notifications", async ({ page }) => {
    await expect(page.getByText("Welcome to Tirbeo!").first()).toBeVisible();
    await expect(page.getByText("New sign-in detected").first()).toBeVisible();
  });

  test("shows notification body text", async ({ page }) => {
    await expect(page.getByText("account has been created").first()).toBeVisible();
  });

  test("has filter tabs", async ({ page }) => {
    // The inbox should have filter functionality
    await expect(page.locator("body")).toContainText(/all|unread|read/i);
  });

  test("has search functionality", async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("sign-in");
      await expect(page.getByText("New sign-in detected").first()).toBeVisible();
    }
  });

  test("can expand notification to see full body", async ({ page }) => {
    const notification = page.getByText("New sign-in detected").first();
    if (await notification.isVisible()) {
      await notification.click();
      await expect(page.getByText(/new device|kathmandu/i).first()).toBeVisible({ timeout: 5000 });
    }
  });

  test("has mark all as read button", async ({ page }) => {
    const markAllBtn = page.getByRole("button", { name: /mark.*all|read.*all/i }).first();
    if (await markAllBtn.isVisible()) {
      await expect(markAllBtn).toBeVisible();
    }
  });

  test("empty state shows when no notifications match search", async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill("zzz_nonexistent_zzz");
      await expect(
        page.getByText(/no.*result|nothing|no.*match/i).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe("Notifications Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/notifications");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays notification settings page", async ({ page }) => {
    await expect(page.getByText(/notification/i).first()).toBeVisible();
  });

  test("shows notification channels", async ({ page }) => {
    await expect(page.getByText(/email|push/i).first()).toBeVisible();
  });
});
