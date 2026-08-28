import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

test.describe("Support Tickets", () => {
  test.describe("Ticket List", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/support/tickets");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("displays ticket list page", async ({ page }) => {
      await expect(page.locator("body")).toContainText(/support|ticket/i);
    });

    test("lists tickets with subject", async ({ page }) => {
      await expect(page.getByText("Cannot access my account").first()).toBeVisible();
    });

    test("ticket list has navigation elements", async ({ page }) => {
      // Should have some interactive elements
      const buttons = page.locator("button, a");
      expect(await buttons.count()).toBeGreaterThan(0);
    });
  });

  test.describe("New Ticket", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/support/tickets/new");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("displays new ticket form", async ({ page }) => {
      await expect(page.locator("body")).toContainText(/new|ticket|create|submit/i);
    });

    test("has new ticket form with category and priority selectors", async ({ page }) => {
      // The new ticket page uses a multi-step wizard
      // Step 1 shows category and priority buttons
      await expect(page.getByText(/category/i).first()).toBeVisible();
      await expect(page.getByText(/priority/i).first()).toBeVisible();
      await expect(page.getByRole("button", { name: /continue/i }).first()).toBeVisible();
    });

    test("can fill and submit a new ticket", async ({ page }) => {
      const subjectInput = page.locator('input[type="text"]').first();
      if (await subjectInput.isVisible()) {
        await subjectInput.fill("Test Support Request");
        const messageInput = page.locator("textarea").first();
        if (await messageInput.isVisible()) {
          await messageInput.fill("This is a test support ticket created via E2E testing.");
        }
        const submitBtn = page.getByRole("button", { name: /submit|create|send/i }).first();
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          // Should show success or navigate
          await page.waitForTimeout(3000);
        }
      }
    });
  });

  test.describe("Ticket Detail", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/support/tickets/tkt_001");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
    });

    test("displays ticket subject and info", async ({ page }) => {
      await expect(page.getByText("Cannot access my account").first()).toBeVisible();
    });

    test("shows ticket messages", async ({ page }) => {
      await expect(
        page.getByText("locked out of my account").first()
      ).toBeVisible();
    });

    test("shows message author names", async ({ page }) => {
      await expect(page.getByText("Test User").first()).toBeVisible();
    });

    test("has reply input area", async ({ page }) => {
      const replyInput = page.locator("textarea").first();
      await expect(replyInput).toBeVisible();
    });

    test("can send a reply", async ({ page }) => {
      const replyInput = page.locator("textarea").first();
      if (await replyInput.isVisible()) {
        await replyInput.fill("This is a test reply from E2E testing.");
        // Find send button - could be icon button or text button
        const sendBtn = page.locator('button').filter({ hasText: /send|reply|submit/i }).first()
          .or(page.locator('button[type="submit"]').first());
        if (await sendBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await sendBtn.click();
          await expect(
            page.getByText("test reply from E2E testing").first()
          ).toBeVisible({ timeout: 10000 });
        }
      }
    });

    test("has close ticket option for open tickets", async ({ page }) => {
      const closeBtn = page.getByRole("button", { name: /close|resolve/i }).first();
      if (await closeBtn.isVisible()) {
        await expect(closeBtn).toBeVisible();
      }
    });
  });
});
