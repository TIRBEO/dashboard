import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

/**
 * Search Overlay E2E Tests
 *
 * The search overlay is opened with ⌘K (Mac) or Ctrl+K (other).
 * It lists 11 pages and supports:
 *   - ArrowUp/Down keyboard navigation
 *   - Enter to open selected item
 *   - Escape to close
 *   - Text filtering
 *   - Mouse hover to select
 *   - Click to navigate
 */

/** Open the search overlay using Ctrl+K (works cross-platform in headless) */
async function openSearch(page: import("@playwright/test").Page) {
  await page.keyboard.press("Control+k");
  // Wait for the overlay to appear
  await expect(page.locator(".tb-search-overlay")).toBeVisible({ timeout: 5000 });
}

/** Close the search overlay with Escape */
async function closeSearch(page: import("@playwright/test").Page) {
  await page.keyboard.press("Escape");
  await expect(page.locator(".tb-search-overlay")).not.toBeVisible({ timeout: 3000 });
}

test.describe("Search Overlay", () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthenticated(page, "/overview");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  // ── Opening / Closing ──

  test("opens with Ctrl+K", async ({ page }) => {
    await openSearch(page);
    // Search input should be visible and focused
    const input = page.locator(".tb-search-input-row input");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test("closes with Escape", async ({ page }) => {
    await openSearch(page);
    await closeSearch(page);
  });

  test("closes when clicking the overlay backdrop", async ({ page }) => {
    await openSearch(page);
    // Click the overlay (not the panel)
    await page.locator(".tb-search-overlay").click({ position: { x: 10, y: 10 } });
    await expect(page.locator(".tb-search-overlay")).not.toBeVisible({ timeout: 3000 });
  });

  test("clicking a search item navigates and closes", async ({ page }) => {
    await openSearch(page);
    // Click on a specific search item (not the panel backdrop)
    const item = page.locator(".tb-search-item").first();
    await item.click();
    // Should navigate and close the overlay
    await expect(page.locator(".tb-search-overlay")).not.toBeVisible({ timeout: 3000 });
  });

  // ── Initial State ──

  test("shows all 11 search items initially", async ({ page }) => {
    await openSearch(page);
    const items = page.locator(".tb-search-item");
    await expect(items).toHaveCount(11, { timeout: 5000 });
  });

  test("first item is active by default", async ({ page }) => {
    await openSearch(page);
    const firstItem = page.locator(".tb-search-item").first();
    await expect(firstItem).toHaveClass(/active/);
  });

  test("search input has correct placeholder", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await expect(input).toHaveAttribute("placeholder");
  });

  test("shows keyboard hints in footer", async ({ page }) => {
    await openSearch(page);
    await expect(page.locator(".tb-search-footer")).toBeVisible();
    await expect(page.locator(".tb-search-footer")).toContainText(/↑↓|↵|ESC/);
  });

  test("shows ESC badge", async ({ page }) => {
    await openSearch(page);
    await expect(page.locator(".tb-search-kbd")).toBeVisible();
    await expect(page.locator(".tb-search-kbd")).toContainText("ESC");
  });

  // ── Keyboard Navigation: ArrowDown ──

  test("ArrowDown moves to second item", async ({ page }) => {
    await openSearch(page);
    await page.keyboard.press("ArrowDown");

    const secondItem = page.locator(".tb-search-item").nth(1);
    await expect(secondItem).toHaveClass(/active/);
  });

  test("ArrowDown moves through multiple items", async ({ page }) => {
    await openSearch(page);

    // Press ArrowDown 3 times → should be on index 3
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press("ArrowDown");
    }

    const fourthItem = page.locator(".tb-search-item").nth(3);
    await expect(fourthItem).toHaveClass(/active/);
  });

  test("ArrowDown stops at the last item", async ({ page }) => {
    await openSearch(page);

    // Press ArrowDown 20 times (more than the 11 items)
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press("ArrowDown");
    }

    // Should be on the last item (index 10)
    const lastItem = page.locator(".tb-search-item").last();
    await expect(lastItem).toHaveClass(/active/);
  });

  // ── Keyboard Navigation: ArrowUp ──

  test("ArrowUp stays at first item when already at top", async ({ page }) => {
    await openSearch(page);
    // Already at index 0, press ArrowUp
    await page.keyboard.press("ArrowUp");

    const firstItem = page.locator(".tb-search-item").first();
    await expect(firstItem).toHaveClass(/active/);
  });

  test("ArrowUp moves to previous item after ArrowDown", async ({ page }) => {
    await openSearch(page);

    // Go down 3, then up 1
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");

    // Should be on index 2
    const thirdItem = page.locator(".tb-search-item").nth(2);
    await expect(thirdItem).toHaveClass(/active/);
  });

  test("ArrowDown then ArrowUp returns to first item", async ({ page }) => {
    await openSearch(page);
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowUp");

    const firstItem = page.locator(".tb-search-item").first();
    await expect(firstItem).toHaveClass(/active/);
  });

  // ── Keyboard Navigation: Enter ──

  test("Enter navigates to the active item's page", async ({ page }) => {
    await openSearch(page);
    // First item is Overview — press Enter
    await page.keyboard.press("Enter");

    // Should navigate to /overview (already there, but overlay should close)
    await expect(page.locator(".tb-search-overlay")).not.toBeVisible({ timeout: 3000 });
  });

  test("Enter opens the second item after ArrowDown", async ({ page }) => {
    await openSearch(page);
    await page.keyboard.press("ArrowDown");

    // Second item is Inbox
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/\/account\/inbox/, { timeout: 10000 });
  });

  test("Enter opens the item at current active index", async ({ page }) => {
    await openSearch(page);

    // Navigate to index 5 (Connected Apps)
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press("ArrowDown");
    }

    const fifthItem = page.locator(".tb-search-item").nth(5);
    await expect(fifthItem).toHaveClass(/active/);

    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/account\/apps/, { timeout: 10000 });
  });

  // ── Text Filtering ──

  test("typing filters results", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await input.fill("security");

    const items = page.locator(".tb-search-item");
    const count = await items.count();
    expect(count).toBeLessThan(11);
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("typing 'inbox' shows only inbox", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await input.fill("inbox");

    const items = page.locator(".tb-search-item");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText(/inbox/i);
  });

  test("typing 'profile' shows only profile", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await input.fill("profile");

    const items = page.locator(".tb-search-item");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText(/profile/i);
  });

  test("typing non-matching text shows empty state", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await input.fill("zzz_nonexistent_zzz");

    // Should show empty state
    await expect(page.locator(".tb-search-empty")).toBeVisible();
    const items = page.locator(".tb-search-item");
    await expect(items).toHaveCount(0);
  });

  test("clearing filter restores all items", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");

    // Filter
    await input.fill("security");
    const filteredCount = await page.locator(".tb-search-item").count();
    expect(filteredCount).toBeLessThan(11);

    // Clear
    await input.clear();
    await expect(page.locator(".tb-search-item")).toHaveCount(11);
  });

  test("active index resets to 0 when query changes", async ({ page }) => {
    await openSearch(page);

    // Navigate down
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("ArrowDown");

    // Type to filter
    const input = page.locator(".tb-search-input-row input");
    await input.fill("security");

    // First (and only) item should be active
    const item = page.locator(".tb-search-item").first();
    await expect(item).toHaveClass(/active/);
  });

  // ── Mouse Interaction ──

  test("hovering an item sets it as active", async ({ page }) => {
    await openSearch(page);

    // Hover over the 4th item
    const fourthItem = page.locator(".tb-search-item").nth(3);
    await fourthItem.hover();

    await expect(fourthItem).toHaveClass(/active/);
  });

  test("clicking an item navigates to its page", async ({ page }) => {
    await openSearch(page);

    // Find the Security item and click it
    const securityItem = page.locator(".tb-search-item", { hasText: /security/i }).first();
    await securityItem.click();

    await expect(page).toHaveURL(/\/account\/security/, { timeout: 10000 });
  });

  // ── Combined Keyboard + Filter ──

  test("ArrowDown works after filtering", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await input.fill("a"); // matches: Overview, Security, Privacy, etc.

    const items = page.locator(".tb-search-item");
    const count = await items.count();
    expect(count).toBeGreaterThan(1);

    // Navigate down
    await page.keyboard.press("ArrowDown");
    await expect(items.nth(1)).toHaveClass(/active/);
  });

  test("Enter opens filtered result", async ({ page }) => {
    await openSearch(page);
    const input = page.locator(".tb-search-input-row input");
    await input.fill("tickets");

    // Press Enter on the first (and only) result
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/support\/tickets/, { timeout: 10000 });
  });

  // ── Full Navigation Flow ──

  test("can navigate through all items with keyboard", async ({ page }) => {
    await openSearch(page);

    // Navigate down through all items
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowDown");
      const item = page.locator(".tb-search-item").nth(i + 1);
      await expect(item).toHaveClass(/active/);
    }

    // Navigate back up to first
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press("ArrowUp");
    }
    await expect(page.locator(".tb-search-item").first()).toHaveClass(/active/);
  });

  test("can open each main page via search", async ({ page }) => {
    const pages = [
      { search: "inbox", expected: /\/account\/inbox/ },
      { search: "profile", expected: /\/account\/profile/ },
      { search: "security", expected: /\/account\/security/ },
      { search: "privacy", expected: /\/account\/privacy/ },
      { search: "sessions", expected: /\/account\/sessions/ },
      { search: "notifications", expected: /\/account\/notifications/ },
    ];

    for (const { search, expected } of pages) {
      // Go back to overview first
      await page.goto("/overview", { waitUntil: "networkidle" });
      await page.waitForTimeout(500);

      // Open search
      await openSearch(page);

      // Type to filter
      const input = page.locator(".tb-search-input-row input");
      await input.fill(search);

      // Press Enter
      await page.keyboard.press("Enter");

      // Verify navigation
      await expect(page).toHaveURL(expected, { timeout: 10000 });
    }
  });
});
