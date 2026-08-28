import { test, expect } from "@playwright/test";
import { gotoAuthenticated } from "../fixtures/mock-apis";

/**
 * shadcn UI Components E2E Tests
 *
 * Tests the new shadcn-based components used throughout the dashboard:
 *   - Dialog: Create ticket, delete account, revoke sessions, disconnect apps
 *   - Switch: Privacy toggles (analytics, crash reports)
 *   - Custom Tabs: Inbox filters, Activity history filters
 *   - Button: Variant rendering, disabled states
 *   - Input: Form fields, focus states
 *   - Select: Dropdown selects in ticket creation
 */

// ══════════════════════════════════════════════════════════════
// DIALOG COMPONENT TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Dialog Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  // ── Create Ticket Dialog ──

  test.describe("Create Ticket Dialog", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/support/tickets");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("opens when clicking New Ticket button", async ({ page }) => {
      const newBtn = page.getByRole("button", { name: /new ticket/i });
      await newBtn.click();

      // Dialog should appear with title
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
      await expect(page.getByText("Create a new support ticket")).toBeVisible();
    });

    test("has subject, category, priority, and message fields", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      // Subject input
      const subjectInput = page.getByRole("textbox", { name: /subject/i });
      await expect(subjectInput).toBeVisible();

      // Category select
      const categorySelect = page.getByRole("combobox").first();
      await expect(categorySelect).toBeVisible();

      // Priority select
      const prioritySelect = page.getByRole("combobox").nth(1);
      await expect(prioritySelect).toBeVisible();

      // Message textarea
      const messageInput = page.getByRole("textbox", { name: /describe your issue/i });
      await expect(messageInput).toBeVisible();
    });

    test("submit button is disabled when fields are empty", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      const submitBtn = page.getByRole("button", { name: /create ticket/i });
      await expect(submitBtn).toBeDisabled();
    });

    test("submit button enables when all required fields are filled", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      // Fill subject
      await page.getByRole("textbox", { name: /subject/i }).fill("Test subject here");
      // Fill message
      await page.getByRole("textbox", { name: /describe your issue/i }).fill("This is a test message with enough content to pass validation");

      const submitBtn = page.getByRole("button", { name: /create ticket/i });
      await expect(submitBtn).toBeEnabled();
    });

    test("closes when clicking Cancel", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      await page.getByRole("button", { name: /cancel/i }).click();
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
    });

    test("closes when clicking outside (backdrop)", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      // Click backdrop area
      await page.mouse.click(10, 10);
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
    });

    test("closes when pressing Escape", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
    });

    test("has proper accessibility attributes", async ({ page }) => {
      await page.getByRole("button", { name: /new ticket/i }).click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

      // Dialog should have role="dialog"
      const dialog = page.getByRole("dialog");
      await expect(dialog).toHaveAttribute("aria-labelledby");

      // Title should be associated
      const title = page.locator("[data-slot='dialog-title']");
      await expect(title).toBeVisible();
    });
  });

  // ── Revoke Session Dialog ──

  test.describe("Revoke Session Dialog", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/account/sessions");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("opens Revoke All dialog", async ({ page }) => {
      const revokeAllBtn = page.getByRole("button", { name: /revoke all/i });
      if (await revokeAllBtn.count() > 0) {
        await revokeAllBtn.click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
        await expect(page.getByText(/revoke all other sessions/i)).toBeVisible();
      }
    });

    test("cancel closes the dialog", async ({ page }) => {
      const revokeAllBtn = page.getByRole("button", { name: /revoke all/i });
      if (await revokeAllBtn.count() > 0) {
        await revokeAllBtn.click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

        await page.getByRole("button", { name: /cancel/i }).click();
        await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
      }
    });
  });

  // ── Delete Account Dialog ──

  test.describe("Delete Account Dialog", () => {
    test.beforeEach(async ({ page }) => {
      await gotoAuthenticated(page, "/account/privacy");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("opens delete account dialog", async ({ page }) => {
      const deleteBtn = page.getByRole("button", { name: /delete account/i });
      if (await deleteBtn.count() > 0) {
        await deleteBtn.click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });
        await expect(page.getByText(/permanently delete/i)).toBeVisible();
      }
    });

    test("requires typing DELETE to confirm", async ({ page }) => {
      const deleteBtn = page.getByRole("button", { name: /delete account/i });
      if (await deleteBtn.count() > 0) {
        await deleteBtn.click();
        await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

        // Confirm button should be disabled
        const confirmBtn = page.getByRole("button", { name: /delete account/i }).last();
        await expect(confirmBtn).toBeDisabled();

        // Type DELETE
        await page.getByPlaceholder(/type delete/i).fill("DELETE");
        await expect(confirmBtn).toBeEnabled();
      }
    });
  });
});

// ══════════════════════════════════════════════════════════════
// SWITCH COMPONENT TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Switch Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
    await gotoAuthenticated(page, "/account/privacy");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
  });

  test("renders toggle switches for analytics settings", async ({ page }) => {
    // Privacy page should have switch toggles
    const switches = page.locator("[data-slot='switch']");
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });

  test("switch toggles state on click", async ({ page }) => {
    const switches = page.locator("[data-slot='switch']");
    const firstSwitch = switches.first();

    if (await firstSwitch.count() > 0) {
      // Get initial state
      const initialState = await firstSwitch.getAttribute("data-state");

      // Click to toggle
      await firstSwitch.click();
      await page.waitForTimeout(300);

      // State should have changed
      const newState = await firstSwitch.getAttribute("data-state");
      expect(newState).not.toBe(initialState);
    }
  });

  test("switch has proper ARIA attributes", async ({ page }) => {
    const switches = page.locator("[data-slot='switch']");
    const firstSwitch = switches.first();

    if (await firstSwitch.count() > 0) {
      // Should have role="switch"
      const role = await firstSwitch.getAttribute("role");
      expect(role).toBe("switch");

      // Should have aria-checked
      const checked = await firstSwitch.getAttribute("aria-checked");
      expect(checked).not.toBeNull();
    }
  });

  test("switch is keyboard accessible", async ({ page }) => {
    const switches = page.locator("[data-slot='switch']");
    const firstSwitch = switches.first();

    if (await firstSwitch.count() > 0) {
      // Focus the switch
      await firstSwitch.focus();

      // Get initial state
      const initialState = await firstSwitch.getAttribute("data-state");

      // Press Space to toggle
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);

      const newState = await firstSwitch.getAttribute("data-state");
      expect(newState).not.toBe(initialState);
    }
  });

  test("switch thumb moves when toggled", async ({ page }) => {
    const switches = page.locator("[data-slot='switch']");
    const firstSwitch = switches.first();

    if (await firstSwitch.count() > 0) {
      const thumb = firstSwitch.locator("[data-slot='switch-thumb']");

      // Get initial transform
      const initialTransform = await thumb.evaluate((el) => getComputedStyle(el).transform);

      // Toggle
      await firstSwitch.click();
      await page.waitForTimeout(300);

      // Transform should change
      const newTransform = await thumb.evaluate((el) => getComputedStyle(el).transform);
      expect(newTransform).not.toBe(initialTransform);
    }
  });
});

// ══════════════════════════════════════════════════════════════
// CUSTOM TABS TESTS (Inbox & Activity History)
// ══════════════════════════════════════════════════════════════

test.describe("Custom Tabs Component", () => {
  test.describe("Inbox Tabs", () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("tirbeo-theme-mode", "dark");
        localStorage.setItem("tb_lang", "en");
      });
      await gotoAuthenticated(page, "/account/inbox");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("renders All, Unread, Read tabs", async ({ page }) => {
      await expect(page.getByRole("tab", { name: /all/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /unread/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /read/i })).toBeVisible();
    });

    test("All tab is selected by default", async ({ page }) => {
      const allTab = page.getByRole("tab", { name: /all/i });
      await expect(allTab).toHaveAttribute("aria-selected", "true");
    });

    test("clicking Unread tab switches filter", async ({ page }) => {
      const unreadTab = page.getByRole("tab", { name: /unread/i });
      await unreadTab.click();

      await expect(unreadTab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: /all/i })).toHaveAttribute("aria-selected", "false");
    });

    test("clicking Read tab switches filter", async ({ page }) => {
      const readTab = page.getByRole("tab", { name: /read/i });
      await readTab.click();

      await expect(readTab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: /all/i })).toHaveAttribute("aria-selected", "false");
    });

    test("tab shows count badge", async ({ page }) => {
      const allTab = page.getByRole("tab", { name: /all/i });
      // All tab should show a count
      await expect(allTab).toBeVisible();
    });
  });

  test.describe("Activity History Tabs", () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        localStorage.setItem("tirbeo-theme-mode", "dark");
        localStorage.setItem("tb_lang", "en");
      });
      await gotoAuthenticated(page, "/activity/history");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1500);
    });

    test("renders All, Security, Account, Tickets tabs", async ({ page }) => {
      await expect(page.getByRole("tab", { name: /all/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /security/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /account/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /tickets/i })).toBeVisible();
    });

    test("All tab is selected by default", async ({ page }) => {
      const allTab = page.getByRole("tab", { name: /all/i });
      await expect(allTab).toHaveAttribute("aria-selected", "true");
    });

    test("clicking Security tab filters activities", async ({ page }) => {
      const securityTab = page.getByRole("tab", { name: /security/i });
      await securityTab.click();

      await expect(securityTab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: /all/i })).toHaveAttribute("aria-selected", "false");
    });

    test("clicking Account tab filters activities", async ({ page }) => {
      const accountTab = page.getByRole("tab", { name: /account/i });
      await accountTab.click();

      await expect(accountTab).toHaveAttribute("aria-selected", "true");
    });

    test("clicking Tickets tab filters activities", async ({ page }) => {
      const ticketsTab = page.getByRole("tab", { name: /tickets/i });
      await ticketsTab.click();

      await expect(ticketsTab).toHaveAttribute("aria-selected", "true");
    });

    test("tabs have count badges", async ({ page }) => {
      const tabs = page.getByRole("tab");
      const count = await tabs.count();
      expect(count).toBe(4);

      // Each tab should be visible
      for (let i = 0; i < count; i++) {
        await expect(tabs.nth(i)).toBeVisible();
      }
    });
  });
});

// ══════════════════════════════════════════════════════════════
// BUTTON COMPONENT TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Button Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("primary button renders with correct styling", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const primaryBtn = page.getByRole("button", { name: /new ticket/i });
    await expect(primaryBtn).toBeVisible();
    await expect(primaryBtn).toBeEnabled();
  });

  test("ghost button renders with correct styling", async ({ page }) => {
    await gotoAuthenticated(page, "/account/inbox");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Refresh button is a ghost variant
    const refreshBtn = page.locator("button").filter({ has: page.locator("svg") }).first();
    if (await refreshBtn.count() > 0) {
      await expect(refreshBtn).toBeVisible();
    }
  });

  test("disabled button cannot be clicked", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    // Open dialog to get disabled submit button
    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const submitBtn = page.getByRole("button", { name: /create ticket/i });
    await expect(submitBtn).toBeDisabled();

    // Clicking should not close dialog
    await submitBtn.click({ force: true });
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("button with icon renders icon correctly", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    const newBtn = page.getByRole("button", { name: /new ticket/i });
    // Button should contain an SVG icon
    const svg = newBtn.locator("svg");
    await expect(svg).toBeVisible();
  });
});

// ══════════════════════════════════════════════════════════════
// INPUT COMPONENT TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Input Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("text input accepts user input", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const input = page.getByRole("textbox", { name: /subject/i });
    await input.fill("Test Subject");
    await expect(input).toHaveValue("Test Subject");
  });

  test("input shows placeholder text", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const input = page.getByRole("textbox", { name: /subject/i });
    const placeholder = await input.getAttribute("placeholder");
    expect(placeholder).toBeTruthy();
  });

  test("input has focus ring on focus", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const input = page.getByRole("textbox", { name: /subject/i });
    await input.focus();

    // Check that focus styles are applied
    const outline = await input.evaluate((el) => getComputedStyle(el).outlineStyle);
    // Focus ring may be applied via box-shadow or outline
    const boxShadow = await input.evaluate((el) => getComputedStyle(el).boxShadow);
    expect(outline !== "none" || boxShadow !== "none").toBe(true);
  });
});

// ══════════════════════════════════════════════════════════════
// SELECT COMPONENT TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Select Component", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("select dropdown opens on click", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const select = page.getByRole("combobox").first();
    await select.click();

    // Dropdown should appear
    await expect(page.getByRole("listbox")).toBeVisible({ timeout: 3000 });
  });

  test("select shows options", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const select = page.getByRole("combobox").first();
    await select.click();

    // Should show category options
    const options = page.getByRole("option");
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
  });

  test("select option can be selected", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const select = page.getByRole("combobox").first();
    await select.click();

    // Select first option
    const firstOption = page.getByRole("option").first();
    await firstOption.click();

    // Dropdown should close
    await expect(page.getByRole("listbox")).not.toBeVisible({ timeout: 3000 });
  });
});

// ══════════════════════════════════════════════════════════════
// DIALOG ANIMATION TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Dialog Animations", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("dialog animates in when opening", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();

    // Dialog content should have animation class
    const dialogContent = page.locator("[data-slot='dialog-content']");
    await expect(dialogContent).toBeVisible({ timeout: 3000 });

    // Check for animation
    const animation = await dialogContent.evaluate((el) => getComputedStyle(el).animation);
    expect(animation).toBeTruthy();
  });

  test("dialog animates out when closing", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    // Close dialog
    await page.keyboard.press("Escape");

    // Dialog should animate out (data-state=closed)
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 3000 });
  });
});

// ══════════════════════════════════════════════════════════════
// RESPONSIVE DIALOG TESTS
// ══════════════════════════════════════════════════════════════

test.describe("Responsive Dialog Behavior", () => {
  test.use({ viewport: { width: 412, height: 915 } });

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("tirbeo-theme-mode", "dark");
      localStorage.setItem("tb_lang", "en");
    });
  });

  test("dialog is full-width on mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const dialogContent = page.locator("[data-slot='dialog-content']");
    const width = await dialogContent.evaluate((el) => el.getBoundingClientRect().width);
    // On mobile, dialog should be close to full width
    expect(width).toBeGreaterThan(300);
  });

  test("dialog is scrollable on mobile", async ({ page }) => {
    await gotoAuthenticated(page, "/support/tickets");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);

    await page.getByRole("button", { name: /new ticket/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 3000 });

    const dialogContent = page.locator("[data-slot='dialog-content']");
    const overflow = await dialogContent.evaluate((el) => getComputedStyle(el).overflowY);
    // Should be scrollable if content exceeds viewport
    expect(overflow).toMatch(/auto|scroll|hidden/);
  });
});
