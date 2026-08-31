"use client";
import {
  AlertTriangle,
  Bell,
  Bookmark,
  CreditCard,
  Eye,
  Fingerprint,
  Globe,
  KeyRound,
  LifeBuoy,
  LogIn,
  LogOut,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  Shield,
  ShieldAlert,
  Smartphone,
  Trash2,
  User,
  UserCog,
} from "lucide-react";
import type { I18nT } from "@/lib/i18n";

export interface ActionMeta {
  icon: typeof LogIn;
  color: string;
  labelKey: string;
  category: "security" | "account" | "tickets" | "other";
}

type ActionRule = ActionMeta & { match: string[] };

const ACTIONS: ActionRule[] = [
  // ─── Security ────────────────────────────────────────────
  { match: ["login_failed", "auth.login_failed"], icon: ShieldAlert, color: "var(--tb-red)", labelKey: "history.act.loginFailed", category: "security" },
  { match: ["suspicious_login.denied", "suspicious", "blocked"], icon: ShieldAlert, color: "var(--tb-red)", labelKey: "history.act.suspiciousLoginDenied", category: "security" },
  { match: ["login_2fa", "auth.login_2fa"], icon: KeyRound, color: "#10b981", labelKey: "history.act.login2fa", category: "security" },
  { match: ["login_otp", "auth.login_otp", "suspicious_login_otp"], icon: KeyRound, color: "#10b981", labelKey: "history.act.loginOtp", category: "security" },
  { match: ["backup_code", "auth.login_recovery_2fa"], icon: KeyRound, color: "#8b5cf6", labelKey: "history.act.loginRecovery", category: "security" },
  { match: ["recovery_email", "auth.login_recovery_email"], icon: Mail, color: "var(--tb-blue)", labelKey: "history.act.loginRecovery", category: "security" },
  { match: ["magic_link", "auth.login_magic_link"], icon: Mail, color: "var(--tb-blue)", labelKey: "history.act.loginOtp", category: "security" },
  { match: ["passkey.authenticated", "passkey_authenticated", "cli_login", "cli.token"], icon: Fingerprint, color: "#8b5cf6", labelKey: "history.act.passkeyAuth", category: "security" },
  { match: ["user.login", "auth.login_success", "login_success", "auth.login_password"], icon: LogIn, color: "#10b981", labelKey: "history.act.login", category: "security" },
  { match: ["sessions.revoked_all", "sessions_revoked", "session.revoked_all"], icon: LogOut, color: "#666666", labelKey: "history.act.sessionsRevokedAll", category: "security" },
  { match: ["session.revoked"], icon: LogOut, color: "var(--tb-red)", labelKey: "history.act.sessionRevoked", category: "security" },
  { match: ["device.seen", "device_seen"], icon: MonitorSmartphone, color: "var(--tb-blue)", labelKey: "history.act.deviceSeen", category: "security" },
  { match: ["password.reset", "password_reset"], icon: KeyRound, color: "#f59e0b", labelKey: "history.act.passwordReset", category: "security" },
  { match: ["password.changed", "password_changed"], icon: KeyRound, color: "#f59e0b", labelKey: "history.act.passwordChanged", category: "security" },
  { match: ["backup_codes.regenerated", "2fa.recovery_codes_regenerated"], icon: KeyRound, color: "#f59e0b", labelKey: "history.act.backupCodesRegenerated", category: "security" },
  { match: ["2fa.enabled", "totp.enabled", "2fa_enabled"], icon: Shield, color: "#10b981", labelKey: "history.act.twofaEnabled", category: "security" },
  { match: ["2fa.disabled", "totp.disabled", "2fa_disabled"], icon: Shield, color: "var(--tb-red)", labelKey: "history.act.twofaDisabled", category: "security" },
  { match: ["passkey.registered"], icon: Fingerprint, color: "#8b5cf6", labelKey: "history.act.passkeyRegistered", category: "security" },
  { match: ["passkey.deleted"], icon: Fingerprint, color: "var(--tb-red)", labelKey: "history.act.passkeyDeleted", category: "security" },
  { match: ["user.banned"], icon: ShieldAlert, color: "var(--tb-red)", labelKey: "history.act.accountBanned", category: "security" },
  { match: ["user.suspended"], icon: ShieldAlert, color: "#f59e0b", labelKey: "history.act.accountSuspended", category: "security" },
  { match: ["user.unbanned"], icon: Shield, color: "#10b981", labelKey: "history.act.accountUnbanned", category: "security" },
  { match: ["user.unsuspended"], icon: Shield, color: "#10b981", labelKey: "history.act.accountUnsuspended", category: "security" },
  { match: ["captcha.appeal"], icon: Shield, color: "#10b981", labelKey: "history.act.accountUnbanned", category: "security" },
  { match: ["security.login", "security.password_changed", "security.deletion_cancelled"], icon: Shield, color: "var(--tb-blue)", labelKey: "history.act.securityEvent", category: "security" },

  // ─── Account ─────────────────────────────────────────────
  { match: ["recovery_email.verified"], icon: Mail, color: "#10b981", labelKey: "history.act.recoveryEmailVerified", category: "account" },
  { match: ["recovery_email.updated"], icon: Mail, color: "var(--tb-blue)", labelKey: "history.act.recoveryEmailUpdated", category: "account" },
  { match: ["recovery_email.removed"], icon: Mail, color: "var(--tb-red)", labelKey: "history.act.recoveryEmailRemoved", category: "account" },
  { match: ["phone.added"], icon: Smartphone, color: "var(--tb-blue)", labelKey: "history.act.phoneAdded", category: "account" },
  { match: ["phone.verified"], icon: Smartphone, color: "#10b981", labelKey: "history.act.phoneVerified", category: "account" },
  { match: ["phone.removed"], icon: Smartphone, color: "var(--tb-red)", labelKey: "history.act.phoneRemoved", category: "account" },
  { match: ["email_verified", "email.verified"], icon: Mail, color: "#10b981", labelKey: "history.act.emailVerified", category: "account" },
  { match: ["merge.login"], icon: Mail, color: "#8b5cf6", labelKey: "history.act.mergeLogin", category: "account" },
  { match: ["account.merge", "oauth.merge"], icon: Mail, color: "#8b5cf6", labelKey: "history.act.oauthMerged", category: "account" },
  { match: ["avatar", "photoUrl", "profile.avatar"], icon: User, color: "#8b5cf6", labelKey: "history.act.avatarUpdated", category: "account" },
  { match: ["username"], icon: UserCog, color: "#8b5cf6", labelKey: "history.act.usernameUpdated", category: "account" },
  { match: ["profile.updated", "profile_updated", "user.updated"], icon: UserCog, color: "#8b5cf6", labelKey: "history.act.profileUpdated", category: "account" },
  { match: ["consent.updated"], icon: User, color: "#666666", labelKey: "history.act.consentUpdated", category: "account" },
  { match: ["data_export", "data.export"], icon: CreditCard, color: "var(--tb-blue)", labelKey: "history.act.dataExportRequested", category: "account" },
  { match: ["account.delete-request", "account.delete_request"], icon: AlertTriangle, color: "var(--tb-red)", labelKey: "history.act.deleteAccountRequested", category: "account" },
  { match: ["account.deletion-cancelled", "account.deletion_cancelled"], icon: Shield, color: "#10b981", labelKey: "history.act.deletionCancelled", category: "account" },
  { match: ["user.deleted.scheduled", "user.deleted", "user.soft_delete"], icon: Trash2, color: "var(--tb-red)", labelKey: "history.act.deleteAccountRequested", category: "account" },
  { match: ["user.created", "signup"], icon: User, color: "#10b981", labelKey: "history.act.signup", category: "account" },
  { match: ["media.uploaded", "media.updated", "media.deleted"], icon: User, color: "#8b5cf6", labelKey: "history.act.profileUpdated", category: "account" },
  { match: ["preferences.updated", "notification_preferences"], icon: Bell, color: "var(--tb-blue)", labelKey: "history.act.preferencesUpdated", category: "account" },
  { match: ["privacy.consent", "privacy.data_request"], icon: Eye, color: "var(--tb-blue)", labelKey: "history.act.privacyAction", category: "account" },
  { match: ["bookmark", "saved"], icon: Bookmark, color: "#8b5cf6", labelKey: "history.act.bookmarkAction", category: "account" },
  { match: ["connected", "oauth.connected"], icon: Globe, color: "var(--tb-blue)", labelKey: "history.act.oauthConnected", category: "account" },

  // ─── Tickets ─────────────────────────────────────────────
  { match: ["ticket.created", "ticket_created"], icon: MessageSquare, color: "var(--tb-blue)", labelKey: "history.act.ticketCreated", category: "tickets" },
  { match: ["ticket.replied", "ticket_replied"], icon: Mail, color: "#10b981", labelKey: "history.act.ticketReplied", category: "tickets" },
  { match: ["ticket.closed", "ticket_closed"], icon: MessageSquare, color: "#666666", labelKey: "history.act.ticketClosed", category: "tickets" },
  { match: ["ticket.updated", "ticket_updated", "ticket.assigned"], icon: MessageSquare, color: "#f59e0b", labelKey: "history.act.ticketUpdated", category: "tickets" },
];

export function getActionMeta(action: string): ActionMeta {
  const lower = (action || "").toLowerCase();
  for (const rule of ACTIONS) {
    for (const token of rule.match) {
      if (lower.includes(token.toLowerCase())) {
        return { icon: rule.icon, color: rule.color, labelKey: rule.labelKey, category: rule.category };
      }
    }
  }
  return { icon: Bell, color: "var(--tb-text-muted)", labelKey: "history.act.unknown", category: "other" };
}

const FALLBACK_LABELS: Record<string, string> = {
  "history.act.login": "Signed in",
  "history.act.logout": "Signed out",
  "history.act.signup": "Account created",
  "history.act.passwordChanged": "Password changed",
  "history.act.profileUpdated": "Profile updated",
  "history.act.twofaEnabled": "2FA enabled",
  "history.act.twofaDisabled": "2FA disabled",
  "history.act.sessionRevoked": "Session signed out",
  "history.act.sessionsRevokedAll": "Signed out of all devices",
  "history.act.emailVerified": "Email verified",
  "history.act.accountDeleted": "Account deleted",
  "history.act.dataExported": "Data exported",
  "history.act.ticketCreated": "Ticket created",
  "history.act.ticketReplied": "Ticket replied",
  "history.act.ticketClosed": "Ticket closed",
  "history.act.ticketUpdated": "Ticket updated",
  "history.act.login2fa": "Signed in (2FA)",
  "history.act.loginOtp": "Signed in with code",
  "history.act.loginFailed": "Failed sign-in attempt",
  "history.act.deviceSeen": "New device recognized",
  "history.act.passwordReset": "Password reset",
  "history.act.oauthMerged": "Accounts merged",
  "history.act.mergeLogin": "Linked account sign-in",
  "history.act.passkeyRegistered": "Passkey created",
  "history.act.passkeyDeleted": "Passkey removed",
  "history.act.passkeyAuth": "Signed in with passkey",
  "history.act.loginRecovery": "Signed in with recovery code",
  "history.act.accountBanned": "Account banned",
  "history.act.accountSuspended": "Account suspended",
  "history.act.accountUnbanned": "Account unbanned",
  "history.act.accountUnsuspended": "Account unsuspended",
  "history.act.recoveryEmailVerified": "Recovery email verified",
  "history.act.recoveryEmailUpdated": "Recovery email updated",
  "history.act.recoveryEmailRemoved": "Recovery email removed",
  "history.act.phoneAdded": "Phone added",
  "history.act.phoneVerified": "Phone verified",
  "history.act.phoneRemoved": "Phone removed",
  "history.act.dataExportRequested": "Data export requested",
  "history.act.deleteAccountRequested": "Deletion requested",
  "history.act.deletionCancelled": "Deletion cancelled",
  "history.act.consentUpdated": "Preferences updated",
  "history.act.suspiciousLoginDenied": "Suspicious login blocked",
  "history.act.backupCodesRegenerated": "Backup codes regenerated",
  "history.act.avatarUpdated": "Photo updated",
  "history.act.usernameUpdated": "Username changed",
  "history.act.unknown": "Activity",
  "history.act.securityEvent": "Security event",
  "history.act.oauthConnected": "Connected account",
  "history.act.preferencesUpdated": "Preferences updated",
  "history.act.privacyAction": "Privacy action",
  "history.act.bookmarkAction": "Bookmark updated",
};

export function getActionLabel(action: string, t: I18nT): string {
  const meta = getActionMeta(action);
  const translated = t(meta.labelKey);
  if (translated !== meta.labelKey) return translated;
  return FALLBACK_LABELS[meta.labelKey] || (action || "Activity").replace(/_/g, " ").replace(/\./g, " · ").replace(/^./, (c: string) => c.toUpperCase());
}
