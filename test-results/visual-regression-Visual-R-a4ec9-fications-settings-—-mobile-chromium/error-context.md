# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual-regression.spec.ts >> Visual Regression — Mobile >> notifications settings — mobile
- Location: e2e/tests/visual-regression.spec.ts:392:7

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  26215 pixels (ratio 0.07 of all image pixels) are different.

  Snapshot: notifications-mobile-dark.png

Call log:
  - Expect "toHaveScreenshot(notifications-mobile-dark.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 26215 pixels (ratio 0.07 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 26215 pixels (ratio 0.07 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - link "Tirbeo Tirbeo" [ref=e5] [cursor=pointer]:
        - /url: /overview
        - img "Tirbeo" [ref=e7]
        - generic [ref=e8]: Tirbeo
      - navigation [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Workspace
          - link "Get Started" [ref=e12] [cursor=pointer]:
            - /url: /overview
          - link "Inbox 3" [ref=e17] [cursor=pointer]:
            - /url: /account/inbox
            - generic [ref=e21]: Inbox
            - generic [ref=e22]: "3"
          - link "Forms" [ref=e23] [cursor=pointer]:
            - /url: http://localhost:3004
        - generic [ref=e28]:
          - generic [ref=e29]: Account
          - link "Profile" [ref=e30] [cursor=pointer]:
            - /url: /account/profile
          - link "Preferences" [ref=e35] [cursor=pointer]:
            - /url: /account/preferences
          - link "Notifications" [ref=e38] [cursor=pointer]:
            - /url: /account/notifications
          - link "Connected Apps" [ref=e43] [cursor=pointer]:
            - /url: /account/apps
          - link "Security" [ref=e48] [cursor=pointer]:
            - /url: /account/security
          - link "Privacy" [ref=e53] [cursor=pointer]:
            - /url: /account/privacy
          - link "Sessions" [ref=e58] [cursor=pointer]:
            - /url: /account/sessions
          - link "History" [ref=e62] [cursor=pointer]:
            - /url: /activity/history
        - generic [ref=e67]:
          - generic [ref=e68]: Support
          - link "Tickets 2" [ref=e69] [cursor=pointer]:
            - /url: /support/tickets
            - generic [ref=e77]: Tickets
            - generic [ref=e78]: "2"
    - generic [ref=e79]:
      - banner [ref=e80]:
        - generic [ref=e81]:
          - button "Menu" [ref=e82] [cursor=pointer]
          - button "Search..." [ref=e84] [cursor=pointer]
        - generic [ref=e88]:
          - button "Notifications" [ref=e90] [cursor=pointer]:
            - generic: "3"
          - button "Account" [ref=e96] [cursor=pointer]:
            - generic [ref=e97]: TU
      - generic [ref=e99]:
        - generic [ref=e101]:
          - generic [ref=e102]:
            - heading "Notifications" [level=1] [ref=e103]
            - paragraph [ref=e104]: Configure how and when you receive notifications.
          - generic [ref=e105]: Changes auto-saved
        - generic [ref=e110]:
          - strong [ref=e111]: Security alerts always on
          - text: — login, 2FA, password and device changes bypass your preferences and quiet hours.
        - generic [ref=e112]:
          - generic [ref=e113]:
            - heading "Channels" [level=3] [ref=e114]
            - paragraph [ref=e117]: Where you want to be reached. Turning a channel off suppresses that delivery for every category.
          - generic [ref=e118]:
            - generic [ref=e119]:
              - generic [ref=e124]:
                - generic [ref=e125]: Email
                - generic [ref=e126]: Inbox delivery
              - button [pressed] [ref=e127] [cursor=pointer]
            - generic [ref=e129]:
              - generic [ref=e136]:
                - generic [ref=e137]: Push
                - generic [ref=e138]: Browser push
              - button [pressed] [ref=e139] [cursor=pointer]
          - generic [ref=e141]: Browser notifications are blocked — enable in site settings.
        - generic [ref=e144]:
          - generic [ref=e145]:
            - heading "Categories & delivery" [level=3] [ref=e146]
            - paragraph [ref=e150]:
              - text: Each category respects
              - strong [ref=e151]: Global channel × Category × Per-channel
              - text: . Toggles are linked — disabling a column or row instantly dims the matrix.
          - generic [ref=e152]:
            - generic [ref=e153]: Category
            - generic [ref=e154]: Email
            - generic [ref=e158]: Push
          - generic [ref=e164]:
            - generic [ref=e170]:
              - generic [ref=e171]: Forms
              - generic [ref=e172]: Form submissions and responses.
            - button [pressed] [ref=e174] [cursor=pointer]
            - generic [ref=e176]:
              - generic [ref=e177]: Delivery for Forms
              - generic [ref=e178]:
                - button [pressed] [ref=e179] [cursor=pointer]
                - generic [ref=e181]: DELIVERED
              - generic [ref=e182]:
                - button [pressed] [ref=e183] [cursor=pointer]
                - generic [ref=e185]: DELIVERED
          - generic [ref=e186]:
            - generic [ref=e194]:
              - generic [ref=e195]:
                - text: Product
                - generic [ref=e196]: "OFF"
              - generic [ref=e197]: Product updates and announcements.
            - button [ref=e199] [cursor=pointer]
            - generic [ref=e201]:
              - generic [ref=e202]: Delivery for Product
              - generic [ref=e203]:
                - button [ref=e204]
                - generic [ref=e206]: muted
              - generic [ref=e207]:
                - button [pressed] [ref=e208]
                - generic [ref=e210]: muted
          - generic [ref=e211]:
            - generic [ref=e221]:
              - generic [ref=e222]: Support
              - generic [ref=e223]: Replies to your tickets and support updates.
            - button [pressed] [ref=e225] [cursor=pointer]
            - generic [ref=e227]:
              - generic [ref=e228]: Delivery for Support
              - generic [ref=e229]:
                - button [pressed] [ref=e230] [cursor=pointer]
                - generic [ref=e232]: DELIVERED
              - generic [ref=e233]:
                - button [pressed] [ref=e234] [cursor=pointer]
                - generic [ref=e236]: DELIVERED
          - generic [ref=e240]:
            - text: "Logic:"
            - code [ref=e241]: emailOn = email && category && categoryEmail
            - text: and push analog. Security ignores this.
        - generic [ref=e242]:
          - generic [ref=e243]:
            - heading "Email summaries" [level=3] [ref=e244]
            - paragraph [ref=e245]: Bundle non-urgent updates into a digest instead of one email per event.
          - generic [ref=e246]:
            - generic [ref=e247]:
              - generic [ref=e248]: Enable digest
              - generic [ref=e249]: Replaces real-time emails for category updates
            - button [ref=e250] [cursor=pointer]
  - button "Open Next.js Dev Tools" [ref=e257] [cursor=pointer]
  - alert [ref=e261]
```

# Test source

```ts
  295 |       localStorage.setItem("tb_lang", "en");
  296 |     });
  297 |     await page.route("**/api/**", (route) => {
  298 |       return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  299 |     });
  300 |     await page.goto("/nonexistent-page", { waitUntil: "networkidle" });
  301 |     await page.waitForTimeout(2000);
  302 |     await expect(page).toHaveScreenshot("not-found-dark.png", {
  303 |       fullPage: false,
  304 |     });
  305 |   });
  306 | 
  307 |   test("blocked/banned screen", async ({ page }) => {
  308 |     await page.addInitScript(() => {
  309 |       localStorage.setItem("auth_token", "mock-jwt-token-for-testing");
  310 |       localStorage.setItem("tirbeo-theme-mode", "dark");
  311 |       localStorage.setItem("tb_lang", "en");
  312 |     });
  313 |     await page.route("**/api/users/me", (route) => {
  314 |       return route.fulfill({
  315 |         status: 403,
  316 |         contentType: "application/json",
  317 |         body: JSON.stringify({ banned: true, reason: "Terms of service violation" }),
  318 |       });
  319 |     });
  320 |     await page.route("**/api/**", (route) => {
  321 |       return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  322 |     });
  323 |     await page.goto("/overview", { waitUntil: "networkidle" });
  324 |     await page.waitForTimeout(3000);
  325 |     await expect(page).toHaveScreenshot("blocked-screen-dark.png", {
  326 |       fullPage: false,
  327 |     });
  328 |   });
  329 | });
  330 | 
  331 | test.describe("Visual Regression — Mobile", () => {
  332 |   test.use({ viewport: { width: 412, height: 915 } });
  333 | 
  334 |   test.beforeEach(async ({ page }) => {
  335 |     await page.addInitScript(() => {
  336 |       localStorage.setItem("tirbeo-theme-mode", "dark");
  337 |       localStorage.setItem("tb_lang", "en");
  338 |     });
  339 |   });
  340 | 
  341 |   test("overview — mobile", async ({ page }) => {
  342 |     await gotoAuthenticated(page, "/overview");
  343 |     await waitForStable(page);
  344 |     await expect(page).toHaveScreenshot("overview-mobile-dark.png", {
  345 |       fullPage: false,
  346 |     });
  347 |   });
  348 | 
  349 |   test("mobile sidebar — open", async ({ page }) => {
  350 |     await gotoAuthenticated(page, "/overview");
  351 |     await waitForStable(page);
  352 |     await page.locator(".tb-mobile-menu-btn").click();
  353 |     await expect(page.locator(".dashboard-sidebar")).toHaveClass(/open/, { timeout: 3000 });
  354 |     await page.waitForTimeout(500);
  355 |     await expect(page).toHaveScreenshot("mobile-sidebar-open-dark.png", {
  356 |       fullPage: false,
  357 |     });
  358 |   });
  359 | 
  360 |   test("profile — mobile", async ({ page }) => {
  361 |     await gotoAuthenticated(page, "/account/profile");
  362 |     await waitForStable(page);
  363 |     await expect(page).toHaveScreenshot("profile-mobile-dark.png", {
  364 |       fullPage: false,
  365 |     });
  366 |   });
  367 | 
  368 |   test("security — mobile", async ({ page }) => {
  369 |     await gotoAuthenticated(page, "/account/security");
  370 |     await waitForStable(page);
  371 |     await expect(page).toHaveScreenshot("security-mobile-dark.png", {
  372 |       fullPage: false,
  373 |     });
  374 |   });
  375 | 
  376 |   test("tickets — mobile", async ({ page }) => {
  377 |     await gotoAuthenticated(page, "/support/tickets");
  378 |     await waitForStable(page);
  379 |     await expect(page).toHaveScreenshot("tickets-mobile-dark.png", {
  380 |       fullPage: false,
  381 |     });
  382 |   });
  383 | 
  384 |   test("inbox — mobile", async ({ page }) => {
  385 |     await gotoAuthenticated(page, "/account/inbox");
  386 |     await waitForStable(page);
  387 |     await expect(page).toHaveScreenshot("inbox-mobile-dark.png", {
  388 |       fullPage: false,
  389 |     });
  390 |   });
  391 | 
  392 |   test("notifications settings — mobile", async ({ page }) => {
  393 |     await gotoAuthenticated(page, "/account/notifications");
  394 |     await waitForStable(page);
> 395 |     await expect(page).toHaveScreenshot("notifications-mobile-dark.png", {
      |                        ^ Error: expect(page).toHaveScreenshot(expected) failed
  396 |       fullPage: false,
  397 |     });
  398 |   });
  399 | });
  400 | 
```