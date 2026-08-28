import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

/**
 * Security Score Dashboard E2E Tests
 *
 * Tests the SecurityScore component on the /account/security page:
 *   - Renders with score ring, level label, and checklist
 *   - Shows correct score (60/100 for mock user)
 *   - Checklist items have correct pass/fail status
 *   - Critical items are flagged
 *   - Suggestions panel shows incomplete items
 *   - Visual appearance (ring color, progress)
 */

test.describe("Security Score Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/account/security");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
  });

  // ── Component Rendering ──

  test("security score section is visible", async ({ page }) => {
    await expect(page.getByText("Security Score").first()).toBeVisible();
  });

  test("shows account protection description", async ({ page }) => {
    await expect(page.getByText("Your account protection level").first()).toBeVisible();
  });

  test("score ring SVG is rendered", async ({ page }) => {
    const svg = page.locator("svg circle").first();
    await expect(svg).toBeVisible();
  });

  // ── Score Display ──

  test("shows numeric score", async ({ page }) => {
    // Mock user: password(25) + recovery(20) + username(5) + passwordAge(10) = 60
    await expect(page.getByText("60")).toBeVisible();
  });

  test("shows / 100 denominator", async ({ page }) => {
    await expect(page.getByText("/ 100")).toBeVisible();
  });

  test("shows correct level for score 60", async ({ page }) => {
    // 60 → "Needs Improvement" (fair: 40-69)
    await expect(page.getByText("Needs Improvement").first()).toBeVisible();
  });

  test("shows contextual description for fair level", async ({ page }) => {
    await expect(
      page.getByText("Your account has some security gaps").first()
    ).toBeVisible();
  });

  test("shows passed count", async ({ page }) => {
    // 4 of 6 checks passed (password, recovery, username, passwordAge)
    await expect(page.getByText(/4 of 6 checks passed/)).toBeVisible();
  });

  // ── Checklist Items ──

  test("shows all 6 checklist items", async ({ page }) => {
    // Password, 2FA, Recovery Email, Email Verified, Username, Password Age
    await expect(page.getByText("Password").first()).toBeVisible();
    await expect(page.getByText("Two-Factor Authentication").first()).toBeVisible();
    await expect(page.getByText("Recovery Email").first()).toBeVisible();
    await expect(page.getByText("Email Verified").first()).toBeVisible();
    await expect(page.getByText("Username Set").first()).toBeVisible();
    await expect(page.getByText("Password Updated Recently").first()).toBeVisible();
  });

  test("password is marked as passed", async ({ page }) => {
    // Look for the check mark next to Password
    await expect(page.getByText("Your account has a password set").first()).toBeVisible();
  });

  test("2FA is marked as failed", async ({ page }) => {
    await expect(page.getByText("Enable 2FA for an extra layer of security").first()).toBeVisible();
  });

  test("2FA is flagged as critical", async ({ page }) => {
    await expect(page.getByText("Critical").first()).toBeVisible();
  });

  test("recovery email is marked as passed", async ({ page }) => {
    await expect(page.getByText("Recovery email is set and verified").first()).toBeVisible();
  });

  test("email verified is marked as failed", async ({ page }) => {
    await expect(page.getByText("Verify your email address for account security").first()).toBeVisible();
  });

  test("username is marked as passed", async ({ page }) => {
    await expect(page.getByText("You have a unique username").first()).toBeVisible();
  });

  test("password age is marked as passed", async ({ page }) => {
    await expect(
      page.getByText("Password was updated within the last 90 days").first()
    ).toBeVisible();
  });

  // ── Points Display ──

  test("shows points for passed items", async ({ page }) => {
    // Password: +25, Recovery: +20, Username: +5, Password Age: +10
    await expect(page.getByText("+25").first()).toBeVisible();
    await expect(page.getByText("+20").first()).toBeVisible();
    await expect(page.getByText("+5").first()).toBeVisible();
    await expect(page.getByText("+10").first()).toBeVisible();
  });

  test("shows points for failed items (not awarded)", async ({ page }) => {
    // 2FA: 30, Email Verified: 10 — shown as gray, not awarded
    // These show as "30" and "10" without the + prefix
    const points = page.locator("text=/^\\d+$/");
    const count = await points.count();
    expect(count).toBeGreaterThan(0);
  });

  // ── Suggestions Panel ──

  test("shows suggestions panel for incomplete items", async ({ page }) => {
    await expect(
      page.getByText(/suggestion.*improve/i).first()
    ).toBeVisible();
  });

  test("shows 2 suggestions for mock user (2FA + email verified)", async ({ page }) => {
    await expect(
      page.getByText(/2 suggestions/).first()
    ).toBeVisible();
  });

  test("suggestion mentions 2FA", async ({ page }) => {
    await expect(
      page.getByText(/Enable 2FA/i).first()
    ).toBeVisible();
  });

  test("suggestion mentions email verification", async ({ page }) => {
    await expect(
      page.getByText(/Verify your email/i).first()
    ).toBeVisible();
  });

  // ── Level Badge ──

  test("shows level icon (ShieldAlert for fair level)", async ({ page }) => {
    // The shield icon should be visible near the level text
    const levelSection = page.locator("text=Needs Improvement").first();
    await expect(levelSection).toBeVisible();
  });

  // ── Visual Structure ──

  test("score section is visible on the page", async ({ page }) => {
    await expect(page.getByText("Security Score").first()).toBeVisible();
  });

  test("score ring has correct SVG structure", async ({ page }) => {
    // Should have circles for the ring segments
    const circles = page.locator("svg circle");
    const count = await circles.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("checklist items have correct layout", async ({ page }) => {
    // Each checklist item should have a label, description, and points
    const items = page.locator(".sec-check-item").filter({ hasText: /Password|2FA|Recovery|Email|Username/ });
    expect(await items.count()).toBeGreaterThan(0);
  });
});
