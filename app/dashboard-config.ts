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
      { id: "preferences", label: "Preferences", icon: "Settings", route: "/dashboard/preferences", group: "account", order: 1, description: "Theme, language, behavior" },
      { id: "security", label: "Security", icon: "Shield", route: "/dashboard/security", group: "account", order: 2, description: "Password, 2FA, backup codes" },
      { id: "privacy", label: "Privacy", icon: "Eye", route: "/dashboard/privacy", group: "account", order: 3, description: "Visibility & data sharing" },
      { id: "sessions", label: "Sessions", icon: "Monitor", route: "/dashboard/sessions", group: "account", order: 4, description: "Active sessions & devices" },
    ],
  },
  {
    id: "notifications", label: "Notifications", icon: "Bell", order: 2,
    items: [
      { id: "notif-main", label: "Notifications", icon: "Bell", route: "/dashboard/notifications", group: "notifications", order: 0, description: "All notification settings" },
    ],
  },
  {
    id: "developer", label: "Developer", icon: "Code", order: 3,
    items: [
      { id: "dev-overview", label: "Overview", icon: "Code", route: "/dashboard/developer", group: "developer", order: 0, description: "Developer dashboard" },
      { id: "dev-api-keys", label: "API Keys", icon: "Key", route: "/dashboard/developer/api-keys", group: "developer", order: 1, description: "Manage API keys" },
      { id: "dev-cli", label: "CLI", icon: "Terminal", route: "/dashboard/developer/cli", group: "developer", order: 2, description: "Command-line tool" },
      { id: "dev-logs", label: "Logs", icon: "Database", route: "/dashboard/developer/logs", group: "developer", order: 3, description: "API request logs" },
    ],
  },
];

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
  { id: "search-theme", title: "Change Theme", description: "Switch between light, dark, and system", route: "/dashboard/preferences", category: "Preferences", icon: "Sun", keywords: ["theme", "dark", "light", "system", "mode"] },
  { id: "search-password", title: "Change Password", description: "Update your account password", route: "/dashboard/security", category: "Security", icon: "Shield", keywords: ["password", "change", "update", "reset"] },
  { id: "search-2fa", title: "Enable Two-Factor Auth", description: "Add TOTP authenticator to your account", route: "/dashboard/security", category: "Security", icon: "Shield", keywords: ["2fa", "two-factor", "totp", "authenticator", "security"] },
  { id: "search-avatar", title: "Change Avatar", description: "Upload a new profile picture", route: "/dashboard/profile", category: "Profile", icon: "User", keywords: ["avatar", "photo", "picture", "image"] },
  { id: "search-logout", title: "Sign Out", description: "Sign out of your account", route: "/logout", category: "Account", icon: "LogOut", keywords: ["logout", "sign out", "exit"] },
  { id: "search-api-keys", title: "API Keys", description: "Manage developer API keys", route: "/dashboard/developer/api-keys", category: "Developer", icon: "Key", keywords: ["api", "keys", "token", "access"] },
  { id: "search-sessions", title: "Active Sessions", description: "View and manage signed-in devices", route: "/dashboard/sessions", category: "Security", icon: "Monitor", keywords: ["sessions", "devices", "signed in"] },
]);



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
          { label: "Notifications", value: "/dashboard/notifications" },
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
