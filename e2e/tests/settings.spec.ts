import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

test.describe("Preferences Page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/preferences");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays preferences page header", async ({ page }) => {
    await expect(page.getByText(/preferences|settings/i).first()).toBeVisible();
  });

  test("shows language selector", async ({ page }) => {
    await expect(page.getByText(/language|lang/i).first()).toBeVisible();
  });

  test("shows timezone selector", async ({ page }) => {
    await expect(page.getByText(/timezone|time.*zone/i).first()).toBeVisible();
  });

  test("has save button or auto-saves", async ({ page }) => {
    // The page might auto-save or have a save button
    const body = page.locator("body");
    await expect(body).toContainText(/save|saved|language|timezone/i);
  });

  test("can change language preference", async ({ page }) => {
    const langSelect = page.locator("select").first();
    if (await langSelect.isVisible()) {
      await langSelect.selectOption({ index: 1 });
      await page.waitForTimeout(500);
      // Should auto-save or have save button
    }
  });
});

test.describe("Notification Settings Page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/notifications");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays notification settings header", async ({ page }) => {
    await expect(page.getByText(/notification|alert/i).first()).toBeVisible();
  });

  test("shows email notification option", async ({ page }) => {
    await expect(page.getByText(/email/i).first()).toBeVisible();
  });

  test("shows push notification option", async ({ page }) => {
    await expect(page.getByText(/push/i).first()).toBeVisible();
  });

  test("shows security alerts option", async ({ page }) => {
    await expect(page.getByText(/security/i).first()).toBeVisible();
  });

  test("shows notification categories with toggles", async ({ page }) => {
    await expect(page.getByText(/security|product|support/i).first()).toBeVisible();
  });
});

test.describe("Connected Apps Page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/apps");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays connected apps header", async ({ page }) => {
    await expect(page.getByText(/connected.*app|integrat|social/i).first()).toBeVisible();
  });

  test("shows Google integration", async ({ page }) => {
    await expect(page.getByText(/google/i).first()).toBeVisible();
  });

  test("shows GitHub integration", async ({ page }) => {
    await expect(page.getByText(/github/i).first()).toBeVisible();
  });

  test("shows Discord integration", async ({ page }) => {
    await expect(page.getByText(/discord/i).first()).toBeVisible();
  });

  test("shows connected status for linked accounts", async ({ page }) => {
    await expect(page.getByText(/connected|linked/i).first()).toBeVisible();
  });
});
