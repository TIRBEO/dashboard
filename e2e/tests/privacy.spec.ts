import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

test.describe("Privacy Page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/privacy");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays privacy page header", async ({ page }) => {
    await expect(page.getByText(/privacy|data.*protection/i).first()).toBeVisible();
  });

  test("shows analytics toggle", async ({ page }) => {
    await expect(page.getByText(/analytics|tracking/i).first()).toBeVisible();
  });

  test("shows crash reports toggle", async ({ page }) => {
    await expect(page.getByText(/crash.*report|error.*report/i).first()).toBeVisible();
  });

  test("data export section exists", async ({ page }) => {
    await expect(page.getByText(/export|download.*data|your.*data/i).first()).toBeVisible();
  });

  test("account deletion section exists", async ({ page }) => {
    await expect(page.getByText(/delete.*account|danger|permanent/i).first()).toBeVisible();
  });

  test("delete account shows confirmation flow", async ({ page }) => {
    const deleteBtn = page.getByRole("button", { name: /delete.*account|request.*deletion/i }).first();
    if (await deleteBtn.isVisible()) {
      await deleteBtn.click();
      await expect(
        page.getByText(/otp|verification|code|confirm|reason/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });
});

test.describe("Activity History Page", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/activity/history");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays activity history header", async ({ page }) => {
    await expect(page.getByText(/activity|history|audit/i).first()).toBeVisible();
  });

  test("shows activity entries or empty state", async ({ page }) => {
    // Should show either activity items or empty state
    await expect(page.locator("body")).toContainText(/login|profile|activity|no.*activity|empty/i);
  });

  test("shows timestamps for activities", async ({ page }) => {
    await expect(page.getByText(/ago|2026|Aug|just now/i).first()).toBeVisible();
  });
});
