import { type Page, type BrowserContext } from "@playwright/test";

/**
 * Mock API responses for the Tirbeo dashboard.
 * Uses a SINGLE catch-all route handler that inspects the URL path
 * and returns appropriate mock data. This avoids glob pattern matching issues
 * across different ports/origins.
 */
export const MOCK_USER = {
  id: "usr_test123",
  name: "Test User",
  email: "test@tirbeo.app",
  photoUrl: null,
  username: "testuser",
  bio: "Software engineer",
  occupation: "Developer",
  companyName: "Tirbeo Inc.",
  companyRole: "Frontend Lead",
  industry: "Technology",
  companySize: "11-50",
  website: "https://tirbeo.app",
  linkedin: "linkedin.com/in/testuser",
  githubUsername: "testuser",
  twitter: "@testuser",
  country: "Nepal",
  timezone: "Asia/Kathmandu",
  language: "en",
  dateFormat: "MMM D, YYYY",
  timeFormat: "12h",
  gender: "male",
  birthday: "1995-06-15T00:00:00.000Z",
  secondaryEmail: null,
  secondaryEmailVerified: null,
  recoveryEmail: "recovery@tirbeo.app",
  recoveryEmailVerified: true,
  preferences: {
    emailNotifications: true,
    pushNotifications: true,
    securityAlerts: true,
    marketingEmails: false,
    analyticsOptIn: true,
    crashReports: true,
  },
  totpEnabled: false,
  hasPassword: true,
  mustChangePassword: false,
  scheduledDeletionAt: null,
  deletionReason: null,
  loginCount: 42,
  createdAt: "2024-01-15T10:00:00.000Z",
  updatedAt: "2026-08-20T15:30:00.000Z",
  lastActiveAt: "2026-08-26T09:15:00.000Z",
};

export const MOCK_TICKETS = {
  data: [
    {
      id: "tkt_001",
      subject: "Cannot access my account",
      description: "I am locked out of my account since yesterday",
      status: "open",
      priority: "high",
      category: "account",
      source: "dashboard",
      application: null,
      assignedId: null,
      closedAt: null,
      customerId: "usr_test123",
      createdAt: "2026-08-24T10:00:00.000Z",
      updatedAt: "2026-08-25T14:00:00.000Z",
      customer: { id: "usr_test123", name: "Test User", photoUrl: null, email: "test@tirbeo.app" },
      assigned: null,
      _count: { messages: 3 },
    },
    {
      id: "tkt_002",
      subject: "Feature request: Dark mode improvements",
      description: "Would love better contrast in dark mode",
      status: "closed",
      priority: "low",
      category: "feedback",
      source: "dashboard",
      application: null,
      assignedId: "adm_001",
      closedAt: "2026-08-20T12:00:00.000Z",
      customerId: "usr_test123",
      createdAt: "2026-08-18T09:00:00.000Z",
      updatedAt: "2026-08-20T12:00:00.000Z",
      customer: { id: "usr_test123", name: "Test User", photoUrl: null, email: "test@tirbeo.app" },
      assigned: { id: "adm_001", name: "Admin", photoUrl: null },
      _count: { messages: 5 },
    },
    {
      id: "tkt_003",
      subject: "Billing question about subscription",
      description: "Need help with my plan upgrade",
      status: "open",
      priority: "medium",
      category: "billing",
      source: "dashboard",
      application: null,
      assignedId: null,
      closedAt: null,
      customerId: "usr_test123",
      createdAt: "2026-08-25T16:00:00.000Z",
      updatedAt: "2026-08-26T08:00:00.000Z",
      customer: { id: "usr_test123", name: "Test User", photoUrl: null, email: "test@tirbeo.app" },
      assigned: null,
      _count: { messages: 1 },
    },
  ],
  total: 3,
  page: 1,
  limit: 20,
};

export const MOCK_TICKET_DETAIL = {
  ...MOCK_TICKETS.data[0],
  messages: [
    {
      id: "msg_001",
      ticketId: "tkt_001",
      authorId: "usr_test123",
      content: "I am locked out of my account since yesterday. I tried resetting my password but didn't receive the email.",
      isInternal: false,
      readAt: "2026-08-24T11:00:00.000Z",
      readBy: "adm_001",
      createdAt: "2026-08-24T10:00:00.000Z",
      author: { id: "usr_test123", name: "Test User", photoUrl: null, email: "test@tirbeo.app" },
    },
    {
      id: "msg_002",
      ticketId: "tkt_001",
      authorId: "adm_001",
      content: "Hello! I can help you with that. Let me check your account status.",
      isInternal: false,
      readAt: "2026-08-24T14:00:00.000Z",
      readBy: "usr_test123",
      createdAt: "2026-08-24T13:00:00.000Z",
      author: { id: "adm_001", name: "Admin", photoUrl: null, email: "admin@tirbeo.app" },
    },
    {
      id: "msg_003",
      ticketId: "tkt_001",
      authorId: "usr_test123",
      content: "Thank you! Any update on this?",
      isInternal: false,
      readAt: null,
      readBy: null,
      createdAt: "2026-08-25T14:00:00.000Z",
      author: { id: "usr_test123", name: "Test User", photoUrl: null, email: "test@tirbeo.app" },
    },
  ],
  attachments: [],
};

export const MOCK_NOTIFICATIONS = {
  notifications: [
    {
      id: "n_001",
      title: "Welcome to Tirbeo!",
      body: "Your account has been created successfully.",
      read: true,
      link: "/home",
      type: "welcome",
      icon: "🎉",
      metadata: {},
      createdAt: "2026-08-20T10:00:00.000Z",
    },
    {
      id: "n_002",
      title: "New sign-in detected",
      body: "A new device signed into your account from Kathmandu, Nepal.",
      read: false,
      link: "/account/security",
      type: "security",
      icon: "🔐",
      metadata: { ip: "192.168.1.1", device: "Chrome on Windows" },
      createdAt: "2026-08-25T08:30:00.000Z",
    },
    {
      id: "n_003",
      title: "Support ticket updated",
      body: "Your ticket 'Cannot access my account' has a new reply.",
      read: false,
      link: "/support/tickets/tkt_001",
      type: "support",
      icon: "💬",
      metadata: { ticketId: "tkt_001" },
      createdAt: "2026-08-25T14:00:00.000Z",
    },
    {
      id: "n_004",
      title: "2FA reminder",
      body: "Enable two-factor authentication for better security.",
      read: false,
      link: "/account/security",
      type: "security",
      icon: "🛡️",
      metadata: {},
      createdAt: "2026-08-26T09:00:00.000Z",
    },
  ],
  unread: 3,
  total: 4,
};

export const MOCK_SESSIONS = [
  {
    id: "sess_001",
    isCurrent: true,
    device: "Chrome on Linux",
    ip: "127.0.0.1",
    createdAt: "2026-08-26T08:00:00.000Z",
    lastActiveAt: "2026-08-26T09:15:00.000Z",
  },
  {
    id: "sess_002",
    isCurrent: false,
    device: "Safari on macOS",
    ip: "10.0.0.1",
    createdAt: "2026-08-24T14:00:00.000Z",
    lastActiveAt: "2026-08-25T20:00:00.000Z",
  },
  {
    id: "sess_003",
    isCurrent: false,
    device: "Firefox on Windows",
    ip: "192.168.1.100",
    createdAt: "2026-08-20T10:00:00.000Z",
    lastActiveAt: "2026-08-22T15:00:00.000Z",
  },
];

export const MOCK_ACTIVITY = [
  {
    id: "act_001",
    action: "USER_LOGIN",
    targetType: "user",
    targetId: "usr_test123",
    metadata: { ip: "127.0.0.1", device: "Chrome" },
    severity: "info",
    createdAt: "2026-08-26T08:00:00.000Z",
  },
  {
    id: "act_002",
    action: "PROFILE_UPDATED",
    targetType: "user",
    targetId: "usr_test123",
    metadata: { fields: ["name", "bio"] },
    severity: "info",
    createdAt: "2026-08-25T16:30:00.000Z",
  },
  {
    id: "act_003",
    action: "PASSWORD_CHANGED",
    targetType: "user",
    targetId: "usr_test123",
    metadata: {},
    severity: "warning",
    createdAt: "2026-08-24T10:15:00.000Z",
  },
];

export const MOCK_LOGIN_HISTORY = [
  {
    id: "lh_001",
    ip: "127.0.0.1",
    userAgent: "Chrome/120.0 on Linux",
    success: true,
    createdAt: "2026-08-26T08:00:00.000Z",
  },
  {
    id: "lh_002",
    ip: "10.0.0.1",
    userAgent: "Safari/17.0 on macOS",
    success: true,
    createdAt: "2026-08-25T14:00:00.000Z",
  },
  {
    id: "lh_003",
    ip: "192.168.1.50",
    userAgent: "Firefox/121.0 on Windows",
    success: false,
    createdAt: "2026-08-24T03:00:00.000Z",
  },
];

export const MOCK_INTEGRATIONS = [
  {
    provider: "google",
    connected: true,
    email: "testuser@gmail.com",
    connectedAt: "2024-02-10T12:00:00.000Z",
  },
  {
    provider: "github",
    connected: true,
    email: "testuser@github.com",
    connectedAt: "2024-03-15T09:00:00.000Z",
  },
  {
    provider: "discord",
    connected: false,
    email: null,
    connectedAt: null,
  },
];

export const MOCK_TOTP_SETUP = {
  uri: "otpauth://totp/Tirbeo:test@tirbeo.app?secret=JBSWY3DPEHPK3PXP&issuer=Tirbeo",
  secret: "JBSWY3DPEHPK3PXP",
};

export const MOCK_TOTP_VERIFY = {
  backupCodes: ["ABCD1234", "EFGH5678", "IJKL9012", "MNOP3456"],
};

/**
 * Install a SINGLE catch-all mock API handler on a page.
 * Routes are matched by inspecting the URL path and method.
 */
export async function mockAllApis(page: Page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const path = url.pathname;

    // Strip query params for matching, keep for params
    const search = url.searchParams;

    // ── Auth / User ──
    if (path === "/api/users/me") {
      if (method === "PATCH") {
        const body = route.request().postDataJSON();
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...MOCK_USER, ...body }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER) });
    }

    if (path === "/api/auth/username-exists" && method === "POST") {
      const body = route.request().postDataJSON();
      const username = body?.username?.toLowerCase();
      return route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          exists: username === "takenuser" || username === "admin",
          valid: /^[a-zA-Z0-9-]{3,30}$/.test(username || ""),
          reserved: username === "admin",
        }),
      });
    }

    if (path === "/api/auth/logout") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }

    // ── Notification Prefs (per-user matrix) — must precede /api/notifications wildcard
    if (path === "/api/notifications/prefs") {
      if (method === "PUT") {
        const body = route.request().postDataJSON();
        // Echo back merged prefs so UI can assert request shape
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ...body, _echo: true }) });
      }
      // GET — default prefs (forms:true product:false support:true per PR)
      return route.fulfill({
        status: 200, contentType: "application/json",
        body: JSON.stringify({
          email: true, push: true,
          forms: true, product: false, support: true,
          formsEmail: true, formsPush: true,
          productEmail: false, productPush: true,
          supportEmail: true, supportPush: true,
          digestEnabled: false, digestFrequency: "daily",
        }),
      });
    }

    // ── Notifications ──
    if (path === "/api/notifications") {
      if (method === "PATCH") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      if (method === "DELETE") return route.fulfill({ status: 204, body: "" });
      // GET
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_NOTIFICATIONS) });
    }

    // ── Tickets ──
    if (path === "/api/support/tickets") {
      if (method === "POST") {
        const body = route.request().postDataJSON();
        return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ id: "tkt_new_001", ...body }) });
      }
      // GET list
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TICKETS) });
    }

    // Ticket detail
    const detailMatch = path.match(/^\/api\/support\/tickets\/(tkt_[^/]+)$/);
    if (detailMatch && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TICKET_DETAIL) });
    }

    // Ticket reply
    const replyMatch = path.match(/^\/api\/support\/tickets\/(tkt_[^/]+)\/messages$/);
    if (replyMatch && method === "POST") {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 201, contentType: "application/json",
        body: JSON.stringify({
          id: "msg_new_001", ticketId: replyMatch[1], authorId: "usr_test123",
          content: body?.message || "", isInternal: false, readAt: null, readBy: null,
          createdAt: new Date().toISOString(),
          author: { id: "usr_test123", name: "Test User", photoUrl: null, email: "test@tirbeo.app" },
        }),
      });
    }

    // Close/reopen ticket
    const closeMatch = path.match(/^\/api\/support\/tickets\/(tkt_[^/]+)\/close$/);
    if (closeMatch) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: closeMatch[1], status: "closed", closedAt: new Date().toISOString() }) });
    }
    const reopenMatch = path.match(/^\/api\/support\/tickets\/(tkt_[^/]+)\/reopen$/);
    if (reopenMatch) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ id: reopenMatch[1], status: "open", closedAt: null }) });
    }

    // Ticket read
    const readMatch = path.match(/^\/api\/support\/tickets\/(tkt_[^/]+)\/read$/);
    if (readMatch) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }

    // Attachments
    const attachMatch = path.match(/^\/api\/support\/tickets\/(tkt_[^/]+)\/attachments$/);
    if (attachMatch) {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ attachments: [] }) });
    }

    // ── Security ──
    if (path === "/api/security/sessions" || path.startsWith("/api/security/sessions")) {
      if (method === "DELETE") return route.fulfill({ status: 204, body: "" });
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_SESSIONS) });
    }
    if (path === "/api/security/sessions/revoke-all" && method === "DELETE") {
      return route.fulfill({ status: 204, body: "" });
    }

    if (path === "/api/security/login-history") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ logs: MOCK_LOGIN_HISTORY }) });
    }

    if (path === "/api/security/totp/setup" && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TOTP_SETUP) });
    }
    if (path === "/api/security/totp/verify" && method === "POST") {
      const body = route.request().postDataJSON();
      if (body?.code === "123456") {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_TOTP_VERIFY) });
      }
      return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: { message: "Invalid TOTP code" } }) });
    }
    if (path === "/api/security/totp/disable" && method === "DELETE") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }

    if (path === "/api/security/password" && method === "POST") {
      const body = route.request().postDataJSON();
      if (body?.newPassword && body.newPassword.length >= 8) {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      }
      return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: { message: "Password must be at least 8 characters" } }) });
    }

    if (path === "/api/security/recovery-email/send-code") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, message: "Code sent" }) });
    }
    if (path === "/api/security/recovery-email/verify") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, verified: true }) });
    }
    if (path === "/api/security/recovery-email" && method === "PUT") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }
    if (path === "/api/security/recovery-email" && method === "GET") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ email: MOCK_USER.recoveryEmail, verified: true }) });
    }

    // ── Preferences ──
    if (path === "/api/preferences") {
      if (method === "PUT" || method === "PATCH") {
        return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_USER.preferences) });
    }

    // ── Integrations ──
    if (path === "/api/integrations") {
      if (method === "DELETE") return route.fulfill({ status: 204, body: "" });
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_INTEGRATIONS) });
    }
    if (path === "/api/integrations/merge" && method === "POST") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
    }

    // ── Profile Avatar ──
    if (path === "/api/profile/avatar") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ photoUrl: "https://api.tirbeo.app/mock-avatar.jpg" }) });
    }

    // ── User Activity ──
    if (path === "/api/user/activity") {
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_ACTIVITY) });
    }

    // ── Delete Account ──
    if (path === "/api/user/delete-account") {
      if (method === "DELETE") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
      const body = route.request().postDataJSON();
      if (body?.step === "verify") {
        if (body?.code === "123456") {
          return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, scheduledAt: "2026-09-26T00:00:00.000Z" }) });
        }
        return route.fulfill({ status: 400, contentType: "application/json", body: JSON.stringify({ error: { message: "Invalid code" } }) });
      }
      return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, message: "OTP sent" }) });
    }

    // ── Fallback: return empty JSON ──
    console.warn(`[MOCK] Unhandled API route: ${method} ${path}`);
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({}) });
  });
}

/**
 * Navigate to a page with mock APIs and authenticated state.
 */
export async function gotoAuthenticated(page: Page, path: string = "/home") {
  // Set auth token and theme before navigation
  await page.addInitScript(() => {
    localStorage.setItem("auth_token", "mock-jwt-token-for-testing");
    localStorage.setItem("tirbeo-theme-mode", "dark");
    localStorage.setItem("tb_lang", "en");
  });

  // Mock all APIs before navigation
  await mockAllApis(page);

  // Navigate
  await page.goto(path, { waitUntil: "networkidle" });
}
