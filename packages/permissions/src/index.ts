export type PermissionCheck = {
  permission: string;
  granted: boolean;
};

export type PermissionSet = Record<string, boolean>;

export function hasPermission(
  permissions: PermissionSet,
  required: string
): boolean {
  if (permissions["*"]) return true;
  if (permissions[required]) return true;

  const parts = required.split(".");
  for (let i = parts.length - 1; i > 0; i--) {
    const wildcard = parts.slice(0, i).join(".") + ".*";
    if (permissions[wildcard]) return true;
  }

  return false;
}

export function hasAllPermissions(
  permissions: PermissionSet,
  required: string[]
): boolean {
  return required.every((p) => hasPermission(permissions, p));
}

export function hasAnyPermission(
  permissions: PermissionSet,
  required: string[]
): boolean {
  return required.some((p) => hasPermission(permissions, p));
}

export function filterPermissions(
  permissions: PermissionSet,
  items: { permission: string; [key: string]: unknown }[]
): { permission: string; [key: string]: unknown }[] {
  return items.filter((item) => hasPermission(permissions, item.permission));
}

export const PERMISSION_GROUPS = {
  identity: {
    label: "Identity",
    permissions: [
      "identity.user.read",
      "identity.user.create",
      "identity.user.update",
      "identity.user.delete",
      "identity.session.read",
      "identity.session.revoke",
    ],
  },
  directory: {
    label: "Directory",
    permissions: [
      "directory.user.read",
      "directory.user.create",
      "directory.user.update",
      "directory.user.delete",
      "directory.user.suspend",
      "directory.group.read",
      "directory.group.create",
      "directory.group.update",
      "directory.group.delete",
      "directory.ou.read",
      "directory.ou.create",
      "directory.ou.update",
      "directory.ou.delete",
    ],
  },
  security: {
    label: "Security",
    permissions: [
      "security.settings.read",
      "security.settings.update",
      "security.authentication.read",
      "security.authentication.update",
      "security.access-control.read",
      "security.access-control.update",
      "security.policies.read",
      "security.policies.update",
      "security.audit.read",
      "security.audit.export",
    ],
  },
  admin: {
    label: "Admin",
    permissions: [
      "admin.dashboard.read",
      "admin.settings.read",
      "admin.settings.update",
      "admin.billing.read",
      "admin.billing.manage",
      "admin.apps.read",
      "admin.apps.manage",
      "admin.reporting.read",
      "admin.reporting.export",
      "admin.health.read",
      "admin.alerts.read",
      "admin.alerts.manage",
    ],
  },
  forms: {
    label: "Forms",
    permissions: [
      "forms.read",
      "forms.create",
      "forms.update",
      "forms.delete",
      "forms.responses.read",
      "forms.responses.export",
      "forms.settings.read",
      "forms.settings.update",
    ],
  },
} as const;

export type PermissionGroup = keyof typeof PERMISSION_GROUPS;

export const BUILT_IN_ROLES = [
  {
    name: "Owner",
    slug: "owner",
    description: "Full access to the organization",
    permissions: ["*"],
  },
  {
    name: "Super Admin",
    slug: "super_admin",
    description: "Platform-wide administrator",
    permissions: ["users.*", "roles.*", "permissions.*", "audit.*", "settings.*"],
  },
  {
    name: "Organization Admin",
    slug: "org_admin",
    description: "Administrator of an organization",
    permissions: [
      "users.read",
      "users.create",
      "users.update",
      "users.suspend",
      "roles.read",
      "roles.assign",
      "apps.read",
      "apps.manage",
      "forms.read",
      "forms.create",
      "forms.update",
      "forms.delete",
      "audit.read",
    ],
  },
  {
    name: "Manager",
    slug: "manager",
    description: "Can manage team members and content",
    permissions: [
      "users.read",
      "users.update",
      "forms.read",
      "forms.create",
      "forms.update",
      "tickets.read",
      "tickets.create",
      "tickets.update",
    ],
  },
  {
    name: "Support Agent",
    slug: "support_agent",
    description: "Can manage support tickets",
    permissions: [
      "tickets.read",
      "tickets.update",
      "tickets.assign",
      "tickets.close",
      "tickets.reopen",
    ],
  },
  {
    name: "Analyst",
    slug: "analyst",
    description: "Read-only access to reports and analytics",
    permissions: [
      "users.read",
      "forms.read",
      "forms.responses.read",
      "forms.analytics.read",
      "audit.read",
    ],
  },
  {
    name: "Employee",
    slug: "employee",
    description: "Standard employee access",
    permissions: [
      "users.read",
      "forms.read",
      "forms.create",
      "forms.update",
      "tickets.read",
      "tickets.create",
    ],
  },
  {
    name: "Custom Role",
    slug: "custom",
    description: "Custom role with configurable permissions",
    permissions: [],
  },
] as const;

export type BuiltInRole = typeof BUILT_IN_ROLES[number];