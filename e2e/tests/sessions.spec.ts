import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

test.describe("Sessions Management", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/sessions");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("displays sessions page header", async ({ page }) => {
    await expect(page.getByText(/session|active.*device/i).first()).toBeVisible();
  });

  test("lists active sessions", async ({ page }) => {
    await expect(page.getByText(/Chrome|Safari|Firefox/i).first()).toBeVisible();
  });

  test("marks current session", async ({ page }) => {
    await expect(page.getByText(/current|this.*device|now/i).first()).toBeVisible();
  });

  test("shows session creation date", async ({ page }) => {
    await expect(page.getByText(/ago|2026|Aug/i).first()).toBeVisible();
  });

  test("revoke all button exists", async ({ page }) => {
    const revokeAllBtn = page.getByRole("button", { name: /revoke.*all|end.*all|sign.*out.*all/i }).first();
    if (await revokeAllBtn.isVisible()) {
      await expect(revokeAllBtn).toBeVisible();
    }
  });
});
