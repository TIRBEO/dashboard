export type SidebarItem = {
  id: string;
  label: string;
  icon: string;
  route: string;
  group: string;
  badge?: "new" | "future" | "beta" | "danger";
  description?: string;
  order: number;
  visible?: boolean;
  beta?: boolean;
};

export type SidebarGroup = {
  id: string;
  label: string;
  icon: string;
  order: number;
  items: SidebarItem[];
};

export type SearchEntry = {
  id: string;
  title: string;
  description: string;
  route: string;
  category: string;
  icon: string;
  keywords: string[];
};

export type WidgetConfig = {
  id: string;
  title: string;
  type: "stats" | "activity" | "sessions" | "welcome" | "quicklinks" | "chart" | "security-profile" | "notifications" | "workspace" | "billing" | "usage" | "recent-docs" | "upcoming-events";
  order: number;
  size: "sm" | "md" | "lg" | "full";
  visible: boolean;
};

export type SettingsField = {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "select" | "toggle" | "textarea" | "color" | "date" | "range" | "radio-group";
  description?: string;
  placeholder?: string;
  defaultValue?: any;
  options?: { label: string; value: string }[];
  min?: number;
  max?: number;
  step?: number;
  validation?: string;
  helpTooltip?: string;
  category?: string;
  editable?: boolean;
};

export type SettingsSection = {
  id: string;
  label: string;
  description?: string;
  icon: string;
  fields: SettingsField[];
};

export type SettingsPage = {
  id: string;
  label: string;
  route: string;
  icon: string;
  sections: SettingsSection[];
};

// ═══════════════════════════════════════════════════════════════
// SIDEBAR NAVIGATION
// ═══════════════════════════════════════════════════════════════

export const SIDEBAR_GROUPS: SidebarGroup[] = [
  {
    id: "home", label: "Home", icon: "LayoutDashboard", order: 0,
    items: [
      { id: "home", label: "Home", icon: "LayoutDashboard", route: "/dashboard", group: "home", order: 0 },
    ],
  },
  {
    id: "account", label: "Account", icon: "User", order: 1,
    items: [
      { id: "profile", label: "Profile", icon: "User", route: "/dashboard/profile", group: "account", order: 0, description: "Personal info, avatar, bio" },
      { id: "preferences", label: "Preferences", icon: "Settings", route: "/dashboard/preferences", group: "account", order: 1, description: "Language, timezone, date format" },
      { id: "security", label: "Security", icon: "Shield", route: "/dashboard/security", group: "account", order: 2, description: "Password, 2FA, passkeys" },
      { id: "sessions", label: "Sessions", icon: "Monitor", route: "/dashboard/sessions", group: "account", order: 3, description: "Active sessions & devices" },
      { id: "devices", label: "Devices", icon: "Smartphone", route: "/dashboard/devices", group: "account", order: 4, description: "Trusted devices" },
      { id: "privacy", label: "Privacy", icon: "Eye", route: "/dashboard/privacy", group: "account", order: 5, description: "Visibility & data sharing" },
      { id: "integrations", label: "Connected Accounts", icon: "Link2", route: "/dashboard/integrations", group: "account", order: 6, description: "Google, GitHub, OAuth" },
    ],
  },
  {
    id: "workspace", label: "Workspace", icon: "Building2", order: 2,
    items: [
      { id: "workspace-overview", label: "Overview", icon: "Building2", route: "/dashboard/workspace", group: "workspace", order: 0 },
      { id: "workspace-members", label: "Members", icon: "Users", route: "/dashboard/workspace/members", group: "workspace", order: 1 },
      { id: "workspace-roles", label: "Roles", icon: "Crown", route: "/dashboard/workspace/roles", group: "workspace", order: 2 },
      { id: "workspace-invitations", label: "Invitations", icon: "UserPlus", route: "/dashboard/workspace/invitations", group: "workspace", order: 3 },
      { id: "workspace-activity", label: "Activity", icon: "Activity", route: "/dashboard/workspace/activity", group: "workspace", order: 4 },
      { id: "workspace-storage", label: "Storage", icon: "HardDrive", route: "/dashboard/workspace/storage", group: "workspace", order: 5 },
      { id: "workspace-branding", label: "Branding", icon: "Palette", route: "/dashboard/workspace/branding", group: "workspace", order: 6 },
      { id: "workspace-domains", label: "Domains", icon: "Globe", route: "/dashboard/workspace/domains", group: "workspace", order: 7, badge: "future" },
    ],
  },
  {
    id: "appearance", label: "Appearance", icon: "Sun", order: 3,
    items: [
       { id: "themes", label: "Themes", icon: "Sun", route: "/dashboard/appearance", group: "appearance", order: 0 },
      { id: "colors", label: "Colors", icon: "Paintbrush", route: "/dashboard/appearance/colors", group: "appearance", order: 1 },
      { id: "layout", label: "Layout", icon: "Layout", route: "/dashboard/appearance/layout", group: "appearance", order: 2 },
      { id: "sidebar", label: "Sidebar", icon: "PanelLeft", route: "/dashboard/appearance/sidebar", group: "appearance", order: 3 },
      { id: "accessibility", label: "Accessibility", icon: "Accessibility", route: "/dashboard/appearance/accessibility", group: "appearance", order: 4 },
      { id: "typography", label: "Typography", icon: "Type", route: "/dashboard/appearance/typography", group: "appearance", order: 5 },
      { id: "motion", label: "Motion", icon: "Zap", route: "/dashboard/appearance/motion", group: "appearance", order: 6 },
    ],
  },
  {
    id: "notifications", label: "Notifications", icon: "Bell", order: 4,
    items: [
      { id: "notif-email", label: "Email", icon: "Mail", route: "/dashboard/notifications", group: "notifications", order: 0 },
      { id: "notif-push", label: "Push", icon: "Bell", route: "/dashboard/notifications/push", group: "notifications", order: 1 },
      { id: "notif-desktop", label: "Desktop", icon: "Monitor", route: "/dashboard/notifications/desktop", group: "notifications", order: 2 },
      { id: "notif-sms", label: "SMS", icon: "Smartphone", route: "/dashboard/notifications/sms", group: "notifications", order: 3, badge: "future" },
      { id: "notif-digest", label: "Digest", icon: "CalendarDays", route: "/dashboard/notifications/digest", group: "notifications", order: 4 },
      { id: "notif-quiet", label: "Quiet Hours", icon: "Moon", route: "/dashboard/notifications/quiet-hours", group: "notifications", order: 5 },
    ],
  },
  {
    id: "developer", label: "Developer", icon: "Terminal", order: 5,
    items: [
      { id: "dev-apikeys", label: "API Keys", icon: "Key", route: "/dashboard/developer/api-keys", group: "developer", order: 0 },
      { id: "dev-oauth", label: "OAuth Apps", icon: "AppWindow", route: "/dashboard/developer/oauth", group: "developer", order: 1 },
      { id: "dev-tokens", label: "Personal Access Tokens", icon: "Token", route: "/dashboard/developer/tokens", group: "developer", order: 2 },
      { id: "dev-webhooks", label: "Webhooks", icon: "Webhook", route: "/dashboard/developer/webhooks", group: "developer", order: 3 },
      { id: "dev-cli", label: "CLI", icon: "Terminal", route: "/dashboard/developer/cli", group: "developer", order: 4, badge: "new" },
      { id: "dev-sdks", label: "SDKs", icon: "Package", route: "/dashboard/developer/sdks", group: "developer", order: 5, badge: "new" },
      { id: "dev-logs", label: "Developer Logs", icon: "ScrollText", route: "/dashboard/developer/logs", group: "developer", order: 6 },
    ],
  },

  {
    id: "data", label: "Data", icon: "Database", order: 7,
    items: [
      { id: "data-export", label: "Export", icon: "Download", route: "/dashboard/data/export", group: "data", order: 0 },
      { id: "data-import", label: "Import", icon: "Upload", route: "/dashboard/data/import", group: "data", order: 1 },
      { id: "data-downloads", label: "Downloads", icon: "Archive", route: "/dashboard/data/downloads", group: "data", order: 2 },
      { id: "data-backups", label: "Backups", icon: "Database", route: "/dashboard/data/backups", group: "data", order: 3 },
      { id: "data-storage", label: "Connected Storage", icon: "Cloud", route: "/dashboard/data/storage", group: "data", order: 4 },
    ],
  },
  {
    id: "integrations", label: "Integrations", icon: "Puzzle", order: 8,
    items: [
      { id: "int-apps", label: "Connected Apps", icon: "Puzzle", route: "/dashboard/integrations", group: "integrations", order: 0 },
      { id: "int-github", label: "GitHub", icon: "Github", route: "/dashboard/integrations", group: "integrations", order: 1 },
      { id: "int-google", label: "Google", icon: "Chrome", route: "/dashboard/integrations", group: "integrations", order: 2 },
      { id: "int-discord", label: "Discord", icon: "MessageCircle", route: "/dashboard/integrations/discord", group: "integrations", order: 3, badge: "new" },
      { id: "int-slack", label: "Slack", icon: "Hash", route: "/dashboard/integrations/slack", group: "integrations", order: 4, badge: "new" },
      { id: "int-zapier", label: "Zapier", icon: "Zap", route: "/dashboard/integrations/zapier", group: "integrations", order: 5, badge: "new" },
      { id: "int-webhooks", label: "Webhooks", icon: "Webhook", route: "/dashboard/developer/webhooks", group: "integrations", order: 6 },
    ],
  },
  {
    id: "help", label: "Help", icon: "HelpCircle", order: 9,
    items: [
      { id: "help-center", label: "Help Center", icon: "HelpCircle", route: "/dashboard/help", group: "help", order: 0 },
      { id: "help-docs", label: "Documentation", icon: "BookOpen", route: "/dashboard/help/docs", group: "help", order: 1 },
      { id: "help-tutorials", label: "Tutorials", icon: "GraduationCap", route: "/dashboard/help/tutorials", group: "help", order: 2 },
      { id: "help-tickets", label: "Support Tickets", icon: "MessageSquare", route: "/dashboard/help/tickets", group: "help", order: 3 },
      { id: "help-feedback", label: "Feedback", icon: "MessageCircle", route: "/dashboard/help/feedback", group: "help", order: 4 },
      { id: "help-changelog", label: "Changelog", icon: "ListOrdered", route: "/dashboard/help/changelog", group: "help", order: 5 },
    ],
  },
  {
    id: "advanced", label: "Advanced", icon: "FlaskConical", order: 10,
    items: [
      { id: "adv-labs", label: "Labs", icon: "FlaskConical", route: "/dashboard/advanced/labs", group: "advanced", order: 0, badge: "beta" },
      { id: "adv-preview", label: "Feature Preview", icon: "Sparkles", route: "/dashboard/advanced/feature-preview", group: "advanced", order: 1, badge: "beta" },
      { id: "adv-devmode", label: "Developer Mode", icon: "Code", route: "/dashboard/advanced/developer-mode", group: "advanced", order: 2 },
      { id: "adv-recovery", label: "Account Recovery", icon: "LifeBuoy", route: "/dashboard/advanced/recovery", group: "advanced", order: 3 },
      { id: "adv-delete", label: "Delete Account", icon: "Trash2", route: "/dashboard/advanced/delete-account", group: "advanced", order: 4, badge: "danger" },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// SEARCH INDEX — searchable across everything
// ═══════════════════════════════════════════════════════════════

export const SEARCH_INDEX: SearchEntry[] = SIDEBAR_GROUPS.flatMap(group =>
  group.items.map(item => ({
    id: item.id,
    title: item.label,
    description: item.description || `${group.label} settings`,
    route: item.route,
    category: group.label,
    icon: item.icon,
    keywords: [
      item.label.toLowerCase(),
      item.description?.toLowerCase() || "",
      group.label.toLowerCase(),
      item.label.toLowerCase().replace(/[& ]/g, ""),
    ].filter(Boolean),
  }))
).concat([
  // Extra searchable actions
  { id: "search-theme", title: "Change Theme", description: "Switch between light, dark, and system", route: "/dashboard/appearance", category: "Appearance", icon: "Sun", keywords: ["theme", "dark", "light", "system", "mode"] },
  { id: "search-password", title: "Change Password", description: "Update your account password", route: "/dashboard/security", category: "Security", icon: "KeyRound", keywords: ["password", "change", "update", "reset"] },
  { id: "search-2fa", title: "Enable Two-Factor Auth", description: "Add TOTP authenticator to your account", route: "/dashboard/security", category: "Security", icon: "Smartphone", keywords: ["2fa", "two-factor", "totp", "authenticator", "security"] },
  { id: "search-avatar", title: "Change Avatar", description: "Upload a new profile picture", route: "/dashboard/profile", category: "Profile", icon: "Camera", keywords: ["avatar", "photo", "picture", "image"] },
  { id: "search-display", title: "Change Display Name", description: "Update how your name appears", route: "/dashboard/profile", category: "Profile", icon: "User", keywords: ["display", "name", "full name"] },
  { id: "search-bio", title: "Edit Bio", description: "Write about yourself", route: "/dashboard/profile", category: "Profile", icon: "FileText", keywords: ["bio", "about", "description"] },
  { id: "search-logout", title: "Sign Out", description: "Sign out of your account", route: "/logout", category: "Account", icon: "LogOut", keywords: ["logout", "sign out", "exit"] },
  { id: "search-delete", title: "Delete Account", description: "Permanently delete your account", route: "/dashboard/advanced/delete-account", category: "Advanced", icon: "Trash2", keywords: ["delete", "remove", "account", "destroy"] },
  { id: "search-lang", title: "Change Language", description: "Set your preferred language", route: "/dashboard/preferences", category: "Preferences", icon: "Globe", keywords: ["language", "lang", "locale", "english", "nepali"] },
  { id: "search-timezone", title: "Change Timezone", description: "Set your local timezone", route: "/dashboard/preferences", category: "Preferences", icon: "Clock", keywords: ["timezone", "time", "zone", "utc", "gmt"] },
  { id: "search-export", title: "Export Data", description: "Download your account data", route: "/dashboard/data/export", category: "Data", icon: "Download", keywords: ["export", "download", "data", "backup"] },
  { id: "search-invite", title: "Invite Member", description: "Add someone to your workspace", route: "/dashboard/workspace/invitations", category: "Workspace", icon: "UserPlus", keywords: ["invite", "member", "add", "team"] },
]);

// ═══════════════════════════════════════════════════════════════
// HOME PAGE WIDGETS
// ═══════════════════════════════════════════════════════════════

export const HOME_WIDGETS: WidgetConfig[] = [
  { id: "welcome", title: "Welcome", type: "welcome", order: 0, size: "full", visible: true },
  { id: "profile-completion", title: "Profile Completion", type: "stats", order: 1, size: "md", visible: true },
  { id: "security-score", title: "Security Score", type: "security-profile", order: 2, size: "md", visible: true },
  { id: "activity-chart", title: "Recent Activity", type: "chart", order: 3, size: "lg", visible: true },
  { id: "sessions-preview", title: "Active Sessions", type: "sessions", order: 4, size: "md", visible: true },
  { id: "quick-links", title: "Quick Actions", type: "quicklinks", order: 5, size: "md", visible: true },
  { id: "notifications-preview", title: "Notifications", type: "notifications", order: 6, size: "md", visible: true },
  { id: "workspace-info", title: "Workspace", type: "workspace", order: 7, size: "md", visible: true },
  { id: "usage", title: "Usage", type: "usage", order: 8, size: "md", visible: true },
];

// ═══════════════════════════════════════════════════════════════
// PREFERENCES SETTINGS FIELDS
// ═══════════════════════════════════════════════════════════════

export const PREFERENCES_PAGE: SettingsPage = {
  id: "preferences", label: "Preferences", route: "/dashboard/preferences", icon: "Settings",
  sections: [
    {
      id: "general", label: "General", icon: "Globe",
      fields: [
        { name: "language", label: "Language", type: "select", defaultValue: "en", options: [
          { label: "English", value: "en" }, { label: "Nepali", value: "ne" }, { label: "Hindi", value: "hi" },
          { label: "Japanese", value: "ja" }, { label: "Korean", value: "ko" }, { label: "Chinese", value: "zh" },
          { label: "Spanish", value: "es" }, { label: "French", value: "fr" }, { label: "German", value: "de" },
          { label: "Portuguese", value: "pt" }, { label: "Arabic", value: "ar" }, { label: "Russian", value: "ru" },
        ]},
        { name: "timezone", label: "Timezone", type: "select", defaultValue: "UTC", options: [
          { label: "UTC", value: "UTC" }, { label: "EST (UTC-5)", value: "America/New_York" },
          { label: "PST (UTC-8)", value: "America/Los_Angeles" }, { label: "CST (UTC+8)", value: "Asia/Shanghai" },
          { label: "IST (UTC+5:30)", value: "Asia/Kolkata" }, { label: "NPT (UTC+5:45)", value: "Asia/Kathmandu" },
          { label: "JST (UTC+9)", value: "Asia/Tokyo" }, { label: "GMT (UTC+0)", value: "Europe/London" },
          { label: "CET (UTC+1)", value: "Europe/Berlin" }, { label: "AEST (UTC+10)", value: "Australia/Sydney" },
        ]},
        { name: "dateFormat", label: "Date Format", type: "select", defaultValue: "MM/DD/YYYY", options: [
          { label: "MM/DD/YYYY", value: "MM/DD/YYYY" }, { label: "DD/MM/YYYY", value: "DD/MM/YYYY" }, { label: "YYYY-MM-DD", value: "YYYY-MM-DD" },
        ]},
        { name: "timeFormat", label: "Time Format", type: "select", defaultValue: "12h", options: [
          { label: "12-hour (1:30 PM)", value: "12h" }, { label: "24-hour (13:30)", value: "24h" },
        ]},
        { name: "weekStart", label: "Week Starts On", type: "select", defaultValue: "monday", options: [
          { label: "Monday", value: "monday" }, { label: "Sunday", value: "sunday" }, { label: "Saturday", value: "saturday" },
        ]},
        { name: "currency", label: "Currency", type: "select", defaultValue: "USD", options: [
          { label: "USD ($)", value: "USD" }, { label: "EUR (€)", value: "EUR" }, { label: "GBP (£)", value: "GBP" },
          { label: "NPR (Rs)", value: "NPR" }, { label: "INR (₹)", value: "INR" }, { label: "JPY (¥)", value: "JPY" },
        ]},
        { name: "defaultLanding", label: "Default Landing Page", type: "select", defaultValue: "/dashboard", options: [
          { label: "Home", value: "/dashboard" }, { label: "Profile", value: "/dashboard/profile" },
          { label: "Notifications", value: "/dashboard/notifications" }, { label: "Workspace", value: "/dashboard/workspace" },
        ]},
      ],
    },
    {
      id: "behavior", label: "Behavior", icon: "Zap",
      fields: [
        { name: "autosave", label: "Auto-save changes", type: "toggle", defaultValue: true, description: "Automatically save form changes" },
        { name: "compactMode", label: "Compact Mode", type: "toggle", defaultValue: false, description: "Reduce spacing throughout the UI" },
        { name: "keyboardShortcuts", label: "Keyboard Shortcuts", type: "toggle", defaultValue: true, description: "Enable keyboard shortcuts (⌘K to search)" },
        { name: "confirmations", label: "Show Confirmations", type: "toggle", defaultValue: true, description: "Confirm destructive actions before executing" },
        { name: "recentItems", label: "Show Recent Items", type: "toggle", defaultValue: true, description: "Show recently accessed items in search" },
        { name: "experimentalFeatures", label: "Experimental Features", type: "toggle", defaultValue: false, description: "Enable beta features and UI experiments" },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// APPEARANCE SETTINGS FIELDS
// ═══════════════════════════════════════════════════════════════

export const APPEARANCE_PAGE: SettingsPage = {
  id: "appearance", label: "Appearance", route: "/dashboard/appearance", icon: "Sun",
  sections: [
    {
      id: "theme", label: "Theme", icon: "Sun",
      fields: [
        { name: "theme", label: "Theme", type: "radio-group", defaultValue: "dark", options: [
          { label: "Light", value: "light" }, { label: "Dark", value: "dark" }, { label: "System", value: "system" },
        ]},
        { name: "accentColor", label: "Accent Color", type: "color", defaultValue: "#ffffff" },
        { name: "customColor", label: "Custom Accent", type: "color", defaultValue: "" },
      ],
    },
    {
      id: "layout", label: "Layout", icon: "Layout",
      fields: [
        { name: "sidebarStyle", label: "Sidebar Style", type: "select", defaultValue: "fixed", options: [
          { label: "Fixed", value: "fixed" }, { label: "Floating", value: "floating" }, { label: "Compact", value: "compact" },
        ]},
        { name: "sidebarWidth", label: "Sidebar Width", type: "select", defaultValue: "260", options: [
          { label: "Wide (280px)", value: "280" }, { label: "Default (260px)", value: "260" }, { label: "Compact (220px)", value: "220" }, { label: "Narrow (180px)", value: "180" },
        ]},
        { name: "density", label: "Density", type: "select", defaultValue: "comfortable", options: [
          { label: "Compact", value: "compact" }, { label: "Comfortable", value: "comfortable" }, { label: "Spacious", value: "spacious" },
        ]},
        { name: "glassEffect", label: "Glass Effect", type: "toggle", defaultValue: true, description: "Frosted glass panels with backdrop blur" },
        { name: "transparency", label: "Transparency", type: "toggle", defaultValue: true, description: "Transparent panel backgrounds" },
        { name: "blur", label: "Blur Intensity", type: "range", defaultValue: 40, min: 0, max: 80, step: 5 },
        { name: "roundedCorners", label: "Rounded Corners", type: "select", defaultValue: "16", options: [
          { label: "None (0px)", value: "0" }, { label: "Small (8px)", value: "8" }, { label: "Default (16px)", value: "16" }, { label: "Large (24px)", value: "24" },
        ]},
      ],
    },
    {
      id: "typography", label: "Typography", icon: "Type",
      fields: [
        { name: "fontFamily", label: "Font Family", type: "select", defaultValue: "Inter", options: [
          { label: "Inter", value: "Inter" }, { label: "System", value: "system" }, { label: "JetBrains Mono", value: "JetBrains Mono" },
          { label: "SF Pro", value: "SF Pro" }, { label: "Geist", value: "Geist" },
        ]},
        { name: "fontSize", label: "Font Size", type: "select", defaultValue: "14", options: [
          { label: "Small (13px)", value: "13" }, { label: "Default (14px)", value: "14" }, { label: "Large (15px)", value: "15" }, { label: "Extra Large (16px)", value: "16" },
        ]},
        { name: "animationSpeed", label: "Animation Speed", type: "select", defaultValue: "normal", options: [
          { label: "Instant", value: "instant" }, { label: "Fast", value: "fast" }, { label: "Normal", value: "normal" }, { label: "Slow", value: "slow" },
        ]},
        { name: "motionReduction", label: "Reduce Motion", type: "toggle", defaultValue: false, description: "Minimize animations for accessibility" },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export function getAllSidebarItems(): SidebarItem[] {
  return SIDEBAR_GROUPS.flatMap(g => g.items);
}

export function getSidebarItemByRoute(route: string): SidebarItem | undefined {
  return getAllSidebarItems().find(item => item.route === route);
}

export function getGroupByRoute(route: string): SidebarGroup | undefined {
  return SIDEBAR_GROUPS.find(group => group.items.some(item => item.route === route));
}

export function searchEverything(query: string): SearchEntry[] {
  if (!query.trim()) return SEARCH_INDEX.slice(0, 10);
  const q = query.toLowerCase().trim();
  return SEARCH_INDEX.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.keywords.some(k => k.includes(q)) ||
    item.category.toLowerCase().includes(q)
  ).slice(0, 15);
}

export function getVisibleGroups(): SidebarGroup[] {
  return SIDEBAR_GROUPS.filter(g => g.items.some(i => i.visible !== false));
}
