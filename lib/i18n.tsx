"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isSupportedLang } from "@/lib/locales";

export interface Dict {
  common: {
    loading: string;
    saving: string;
    saved: string;
    autoSaved: string;
    viewAll: string;
    new: string;
    close: string;
    cancel: string;
    save: string;
    delete: string;
    markRead: string;
    loadMore: string;
    noNotifications: string;
    noTickets: string;
    justNow: string;
    agoM: string;
    agoH: string;
    yesterday: string;
    total: string;
    unsavedWarn: string;
  };
  nav: {
    workspace: string;
    account: string;
    support: string;
    getStarted: string;
    inbox: string;
    profile: string;
    preferences: string;
    notifications: string;
    connectedApps: string;
    security: string;
    privacy: string;
    sessions: string;
    history: string;
    tickets: string;
  };
  header: {
    searchPlaceholder: string;
    notifications: string;
    switchToLight: string;
    switchToDark: string;
    calendar: string;
    account: string;
    signOut: string;
    menu: string;
    owner: string;
    user: string;
  };
  overview: {
    subtitle: string;
    goodMorning: string;
    goodAfternoon: string;
    goodEvening: string;
    goodNight: string;
    welcomeBack: string;
    statUnread: string;
    statOpenTickets: string;
    statTotalNotif: string;
    quickTitle: string;
    qInbox: string;
    qInboxDesc: string;
    qProfile: string;
    qProfileDesc: string;
    qSecurity: string;
    qSecurityDesc: string;
    qSupport: string;
    qSupportDesc: string;
    recentNotif: string;
    recentTickets: string;
    allSections: string;
    sPrefs: string;
    sPrefsDesc: string;
    sNotif: string;
    sNotifDesc: string;
    sApps: string;
    sAppsDesc: string;
    sPrivacy: string;
    sPrivacyDesc: string;
    sSessions: string;
    sSessionsDesc: string;
    sHistory: string;
    sHistoryDesc: string;
    openInbox: string;
    openTickets: string;
    noNotifYet: string;
    noTicketsYet: string;
  };
  prefs: {
    title: string;
    subtitle: string;
    general: string;
    language: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    h12: string;
    h24: string;
    timezoneUTC: string;
    kathmandu: string;
    eastern: string;
    central: string;
    mountain: string;
    pacific: string;
    london: string;
    berlin: string;
    tokyo: string;
    shanghai: string;
    kolkata: string;
    emailTitle: string;
    emailDesc: string;
    productEmails: string;
    productEmailsDesc: string;
    weeklySummary: string;
    weeklySummaryDesc: string;
    tipsUpdates: string;
    tipsUpdatesDesc: string;
  };
  session: {
    expired: string;
    signInAgain: string;
  };
  notif: {
    title: string;
    subtitle: string;
    retention: string;
    empty: string;
    total: string;
    channelsTitle: string;
    channelsDesc: string;
    email: string;
    push: string;
    inApp: string;
    emailDesc: string;
    pushDesc: string;
    inAppDesc: string;
    browserBlocked: string;
    categoriesTitle: string;
    categoriesDesc: string;
    catSecurity: string;
    catSecurityDesc: string;
    catForms: string;
    catFormsDesc: string;
    catProduct: string;
    catProductDesc: string;
    catSupport: string;
    catSupportDesc: string;
    perCategory: string;
    perCategoryDesc: string;
    colCategory: string;
    colEmail: string;
    colPush: string;
    colInApp: string;
    quietTitle: string;
    quietDesc: string;
    enableQuiet: string;
    enableQuietDesc: string;
    timeWindow: string;
    timeWindowDesc: string;
    to: string;
    quietActive: string;
    digestTitle: string;
    digestDesc: string;
    enableDigest: string;
    enableDigestDesc: string;
    frequency: string;
    frequencyDesc: string;
    daily: string;
    weekly: string;
    monthly: string;
  };
  search: {
    placeholder: string;
    pages: string;
    overview: string;
    notificationsSettings: string;
    activityHistory: string;
    supportTickets: string;
    navigate: string;
    open: string;
    close: string;
  };
  calendar: {
    prevMonth: string;
    nextMonth: string;
    backToToday: string;
    today: string;
    yesterday: string;
    tomorrow: string;
    daysAgo: string;
    inDays: string;
    months: string[];
  };
  inbox: {
    title: string;
    descUnread: string;
    descTotal: string;
    markAllRead: string;
    tabAll: string;
    tabUnread: string;
    tabRead: string;
    deselect: string;
    selectAll: string;
    select: string;
    read: string;
    delete: string;
    searchPlaceholder: string;
    noMatching: string;
    noMatchingDesc: string;
    allCaughtUp: string;
    allCaughtUpDesc: string;
    inboxEmpty: string;
    inboxEmptyDesc: string;
    loadMore: string;
    back: string;
    open: string;
    noContent: string;
    viewDetails: string;
    selectMessage: string;
    selectMessageDesc: string;
    typeSecurity: string;
    typeForms: string;
    typeProduct: string;
    typeSupport: string;
    typeLogin: string;
    typeNotification: string;
  };
  sessions: {
    title: string;
    subtitle: string;
    revokeAllOthers: string;
    noActive: string;
    noActiveDesc: string;
    currentDevice: string;
    current: string;
    active: string;
    unknownDevice: string;
    unknownIp: string;
    revoke: string;
    revokeAllTitle: string;
    revokeAllDesc: string;
    revokeSessionTitle: string;
    revokeSessionDesc: string;
    revoking: string;
    unknown: string;
    unknownBrowser: string;
    unknownOS: string;
    local: string;
    lastActive: string;
    on: string;
  };
  apps: {
    title: string;
    subtitle: string;
    available: string;
    disconnect: string;
    connect: string;
    googleDesc: string;
    githubDesc: string;
    discordDesc: string;
    connected: string;
    notConnected: string;
    connectedOn: string;
    disconnectConfirm: string;
    disconnectDesc: string;
    mergeTitle: string;
    mergeDesc: string;
    mergeEmail: string;
    mergeButton: string;
    cancelButton: string;
    mergeSuccess: string;
    mergeCancelled: string;
    noProviders: string;
    providerEmail: string;
  };
  security: {
    title: string;
    subtitle: string;
    twoFactor: string;
    twoFactorOn: string;
    twoFactorOff: string;
    status: string;
    enabled: string;
    notEnabled: string;
    disable2fa: string;
    enable2fa: string;
    setupLoading: string;
    setupTitle: string;
    setupDesc: string;
    key: string;
    code: string;
    copy: string;
    enter6: string;
    verifyEnable: string;
    verifying: string;
    disableTitle: string;
    disableDesc: string;
    disabling: string;
    backupTitle: string;
    backupDesc: string;
    copyAll: string;
    done: string;
    copied: string;
    password: string;
    passwordLabel: string;
    changed: string;
    change: string;
    changeTitle: string;
    changeDesc: string;
    current: string;
    new: string;
    confirm: string;
    currentPh: string;
    newPh: string;
    confirmPh: string;
    changePassword: string;
    pwdMismatch: string;
    failed: string;
    secondaryEmail: string;
    secondaryDesc: string;
    email: string;
    noSecondaryEmail: string;
    addEmail: string;
    lastActive: string;
    verified: string;
    remove: string;
    changeEmail: string;
    verifyEmail: string;
    newEmailLabel: string;
    newEmailPh: string;
    sentTo: string;
    sendCode: string;
    sending: string;
    verify: string;
    enterCode: string;
    enterValidEmail: string;
    sendFailed: string;
    enterCodeErr: string;
    invalidCode: string;
    disable2faFailed: string;
    activeSessions: string;
    noActiveSessions: string;
    unknownDevice: string;
    loginHistory: string;
    noLoginHistory: string;
    thStatus: string;
    thDate: string;
    thMethod: string;
    thIpDevice: string;
    success: string;
    failedStart: string;
  };
  privacy: {
    title: string;
    subtitle: string;
    dataAnalytics: string;
    analytics: string;
    analyticsDesc: string;
    crashReports: string;
    crashReportsDesc: string;
    personalizedRecs: string;
    personalizedRecsDesc: string;
    discoverability: string;
    discoverabilityDesc: string;
    searchEngine: string;
    searchEngineDesc: string;
    directory: string;
    directoryDesc: string;
    dataExport: string;
    dataExportDesc: string;
    preparing: string;
    exportData: string;
    exportNote: string;
    dangerZone: string;
    dangerZoneDesc: string;
    deleteAccount: string;
    irreversible: string;
    typeDelete: string;
    typeDeletePh: string;
    deleting: string;
  };
  profile: {
    title: string;
    subtitle: string;
    saveChanges: string;
    noNameSet: string;
    personal: string;
    work: string;
    links: string;
    fullName: string;
    fullNamePh: string;
    username: string;
    usernamePh: string;
    bio: string;
    bioPh: string;
    gender: string;
    selectOption: string;
    male: string;
    female: string;
    other: string;
    preferNot: string;
    birthday: string;
    country: string;
    countryPh: string;
    occupation: string;
    occupationPh: string;
    company: string;
    companyPh: string;
    role: string;
    rolePh: string;
    roleAtCompanyPh: string;
    industry: string;
    industryPh: string;
    companySize: string;
    justMe: string;

    website: string;
    websitePh: string;
    linkedin: string;
    linkedinPh: string;
    github: string;
    githubPh: string;
    twitter: string;
    twitterPh: string;
    accountInfo: string;
    email: string;
    recoveryEmail: string;
    memberSince: string;
    lastActive: string;
    connectedAccounts: string;
    noneConnected: string;
    verified: string;
    unverified: string;
  };
  history: {
    title: string;
    subtitle: string;
    noActivity: string;
    noActivityDesc: string;
    act: {
      login: string;
      logout: string;
      signup: string;
      passwordChanged: string;
      profileUpdated: string;
      twofaEnabled: string;
      twofaDisabled: string;
      sessionRevoked: string;
      emailVerified: string;
      accountDeleted: string;
      dataExported: string;
      notificationRead: string;
      ticketCreated: string;
      ticketReplied: string;
      ticketClosed: string;
      unknown: string;
    };
  };
  tickets: {
    title: string;
    countOne: string;
    countMany: string;
    newTicket: string;
    noTickets: string;
    noTicketsDesc: string;
    createTicket: string;
    subject: string;
    subjectPh: string;
    category: string;
    priority: string;
    message: string;
    messagePh: string;
    describeIssue: string;
    cancel: string;
    creating: string;
    catGeneral: string;
    catBug: string;
    catFeature: string;
    catBilling: string;
    catOther: string;
    catAccount: string;
    prioLow: string;
    prioNormal: string;
    prioHigh: string;
    prioUrgent: string;
    statusOpen: string;
    statusClosed: string;
    statusInProgress: string;
    priorityLabel: string;
  };
  ticketDetail: {
    notFound: string;
    backToTickets: string;
    noMessages: string;
    you: string;
    support: string;
    writeReply: string;
    send: string;
    supportTeam: string;
    sendHint: string;
  };
  newTicket: {
    title: string;
    subtitle: string;
    backToTickets: string;
    subject: string;
    subjectPh: string;
    category: string;
    priority: string;
    message: string;
    messagePh: string;
    countLabel: string;
    ctrlEnter: string;
    cancel: string;
    creating: string;
    submitTicket: string;
    requiredError: string;
    createFailed: string;
    catGeneral: string;
    catGeneralDesc: string;
    catBug: string;
    catBugDesc: string;
    catFeature: string;
    catFeatureDesc: string;
    catAccount: string;
    catAccountDesc: string;
    catBilling: string;
    catBillingDesc: string;
    catOther: string;
    catOtherDesc: string;
    prioLow: string;
    prioLowDesc: string;
    prioNormal: string;
    prioNormalDesc: string;
    prioHigh: string;
    prioHighDesc: string;
    prioUrgent: string;
    prioUrgentDesc: string;
  };
  notifTexts: Record<string, string>;
}

const en: Dict = {
  common: {
    loading: "Loading", saving: "Saving...", saved: "Saved", autoSaved: "Changes auto-saved",
    viewAll: "View all", new: "New", close: "Close", cancel: "Cancel", save: "Save", delete: "Delete",
    markRead: "Mark read", loadMore: "Load more", noNotifications: "No notifications", noTickets: "No tickets",
    justNow: "Just now", agoM: "{n}m ago", agoH: "{n}h ago", yesterday: "Yesterday", total: "total",
    unsavedWarn: "You have unsaved changes — save before leaving this page.",
  },
  nav: {
    workspace: "Workspace", account: "Account", support: "Support",
    getStarted: "Get Started", inbox: "Inbox", profile: "Profile", preferences: "Preferences",
    notifications: "Notifications", connectedApps: "Connected Apps", security: "Security", privacy: "Privacy",
    sessions: "Sessions", history: "History", tickets: "Tickets",
  },
  header: {
    searchPlaceholder: "Search...", notifications: "Notifications", switchToLight: "Switch to light mode",
    switchToDark: "Switch to dark mode", calendar: "Calendar", account: "Account", signOut: "Sign out", menu: "Menu", owner: "Owner", user: "User",
  },
  overview: {
    subtitle: "Your dashboard at a glance.",
    goodMorning: "Good morning", goodAfternoon: "Good afternoon", goodEvening: "Good evening", goodNight: "Good night",
    welcomeBack: "Welcome back",
    statUnread: "Unread", statOpenTickets: "Open tickets", statTotalNotif: "Total notifications",
    quickTitle: "Quick actions",
    qInbox: "Inbox", qInboxDesc: "Read your messages", qProfile: "Profile", qProfileDesc: "Edit your profile",
    qSecurity: "Security", qSecurityDesc: "2FA, passwords, sessions", qSupport: "Support", qSupportDesc: "Open a ticket",
    recentNotif: "Recent notifications", recentTickets: "Recent tickets", allSections: "All sections",
    sPrefs: "Preferences", sPrefsDesc: "Language, timezone, format", sNotif: "Notifications", sNotifDesc: "Channels, quiet hours, digest",
    sApps: "Connected Apps", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "Privacy", sPrivacyDesc: "Analytics, data export",
    sSessions: "Sessions", sSessionsDesc: "Manage active sessions", sHistory: "History", sHistoryDesc: "Activity log",
    openInbox: "Open inbox", openTickets: "Open tickets", noNotifYet: "No notifications yet.", noTicketsYet: "No tickets yet.",
  },
  prefs: {
    title: "Preferences", subtitle: "Customize your experience.", general: "General",
    language: "Language", timezone: "Timezone", dateFormat: "Date format", timeFormat: "Time format",
    h12: "12-hour (AM/PM)", h24: "24-hour",
    timezoneUTC: "UTC", kathmandu: "Asia/Kathmandu (GMT+5:45)", eastern: "Eastern Time", central: "Central Time",
    mountain: "Mountain Time", pacific: "Pacific Time", london: "London", berlin: "Berlin", tokyo: "Tokyo",
    shanghai: "Shanghai", kolkata: "Kolkata",
    emailTitle: "Email preferences", emailDesc: "Manage what emails you receive from Tirbeo.",
    productEmails: "Product emails", productEmailsDesc: "Feature updates and product news.",
    weeklySummary: "Weekly summary", weeklySummaryDesc: "Get a weekly digest of your activity.",
    tipsUpdates: "Tips & updates", tipsUpdatesDesc: "Tips to get the most out of Tirbeo.",
  },
  session: { expired: "Your session has expired. Some features may not work.", signInAgain: "Sign in again" },
  notif: {
    title: "Notifications", subtitle: "Configure how and when you receive notifications.", retention: "Notifications are automatically deleted after 30 days.", empty: "No notifications", total: "total",
    channelsTitle: "Channels", channelsDesc: "Choose where you want to receive notifications.",
    email: "Email", push: "Push", inApp: "In-app",
    emailDesc: "Get notifications in your inbox.", pushDesc: "Browser push notifications.", inAppDesc: "Show inside the app.",
    browserBlocked: "Browser notifications are blocked in your browser settings.",
    categoriesTitle: "Categories", categoriesDesc: "Choose which categories you care about.",
    catSecurity: "Security", catSecurityDesc: "Sign-ins, 2FA changes, and password activity.",
    catForms: "Forms", catFormsDesc: "Form submissions and responses.",
    catProduct: "Product", catProductDesc: "Product updates and announcements.",
    catSupport: "Support", catSupportDesc: "Replies to your tickets and support updates.",
    perCategory: "Per-category channels", perCategoryDesc: "Override channels for each category.",
    colCategory: "Category", colEmail: "Email", colPush: "Push", colInApp: "In-app",
    quietTitle: "Quiet hours", quietDesc: "Don't send notifications during these hours.",
    enableQuiet: "Enable quiet hours", enableQuietDesc: "Silence notifications during your set window.",
    timeWindow: "Time window", timeWindowDesc: "Notifications are paused between these hours.", to: "to",
    quietActive: "Quiet hours are on.",
    digestTitle: "Daily digest", digestDesc: "Get a summary of everything you missed.",
    enableDigest: "Enable digest", enableDigestDesc: "Receive a digest instead of real-time alerts.",
    frequency: "Frequency", frequencyDesc: "How often you want to receive the digest.",
    daily: "Daily", weekly: "Weekly", monthly: "Monthly",
  },
  search: {
    placeholder: "Search pages, settings, actions...", pages: "Pages", overview: "Overview",
    notificationsSettings: "Notifications Settings", activityHistory: "Activity History", supportTickets: "Support Tickets", navigate: "Navigate", open: "Open", close: "Close",
  },
  calendar: {
    prevMonth: "Previous month", nextMonth: "Next month", backToToday: "Back to today",
    today: "Today", yesterday: "Yesterday", tomorrow: "Tomorrow", daysAgo: "{n} days ago", inDays: "In {n} days",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  inbox: {
    title: "Inbox", descUnread: "{unread} unread of {total}", descTotal: "{total} messages", markAllRead: "Mark all read", tabAll: "All", tabUnread: "Unread", tabRead: "Read",
    deselect: "Deselect", selectAll: "Select all", select: "Select", read: "Read",
    searchPlaceholder: "Search notifications...", noMatching: "No matching notifications",
    noMatchingDesc: "Try a different search or clear the filter.", allCaughtUp: "You're all caught up",
    allCaughtUpDesc: "No unread notifications in this folder.", inboxEmpty: "No notifications yet",
    inboxEmptyDesc: "Notifications from Tirbeo will appear here.", loadMore: "Load more", back: "Back", open: "Open",
    noContent: "No content", viewDetails: "View details", selectMessage: "Select a message",
    selectMessageDesc: "Choose a message from the list to read it here.",
    typeSecurity: "Security", typeForms: "Forms", typeProduct: "Product", typeSupport: "Support", typeLogin: "Login", typeNotification: "Notification", delete: "Delete",
  },
  sessions: {
    title: "Sessions", subtitle: "Manage where you're signed in.", revokeAllOthers: "Sign out all other sessions",
    noActive: "No active sessions", noActiveDesc: "You're not signed in anywhere right now.",
    currentDevice: "This device", current: "Current", active: "Active", unknownDevice: "Unknown device", unknownIp: "Unknown IP",
    revoke: "Sign out", revokeAllTitle: "Sign out all other sessions?",
    revokeAllDesc: "All other sessions will be signed out. This device will stay signed in.",
    revokeSessionTitle: "Sign out this session?", revokeSessionDesc: "This device will be signed out immediately.",
    revoking: "Signing out...", unknown: "Unknown", unknownBrowser: "Unknown browser", unknownOS: "Unknown OS", local: "Local", lastActive: "Last active", on: "on",
  },
  apps: {
    title: "Connected apps", subtitle: "Connect your accounts to unlock integrations.",
    available: "Available apps", disconnect: "Disconnect", connect: "Connect",
    googleDesc: "Sync contacts, calendar, and Gmail.", githubDesc: "Sync repositories and activity.",
    discordDesc: "Get notifications in Discord.",
    connected: "Connected", notConnected: "Not connected", connectedOn: "Connected on",
    disconnectConfirm: "Disconnect provider?",
    disconnectDesc: "Are you sure you want to disconnect this provider? You can reconnect it later.",
    mergeTitle: "Merge accounts?",
    mergeDesc: "This provider's email is already linked to another account. Merging will transfer the provider to your current account.",
    mergeEmail: "Email",
    mergeButton: "Merge accounts",
    cancelButton: "Cancel",
    mergeSuccess: "Accounts merged successfully!",
    mergeCancelled: "Merge cancelled.",
    noProviders: "No providers configured.",
    providerEmail: "Email",
  },
  security: {
    title: "Security", subtitle: "Protect your account with strong security.",
    twoFactor: "Two-factor authentication",
    twoFactorOn: "Two-factor authentication is enabled for your account.",
    twoFactorOff: "Two-factor authentication is not enabled for your account.",
    status: "Status", enabled: "Enabled", notEnabled: "Not enabled", disable2fa: "Disable 2FA", enable2fa: "Enable 2FA",
    setupLoading: "Loading 2FA setup...", setupTitle: "Enable two-factor authentication",
    setupDesc: "Scan this QR code with your authenticator app, then enter the code below.",
    key: "Key", code: "Code", copy: "Copy", enter6: "Enter the 6-digit code from your authenticator app",
    verifyEnable: "Enable 2FA", verifying: "Verifying...", disableTitle: "Disable two-factor authentication?",
    disableDesc: "This will remove 2FA from your account immediately.", disabling: "Disabling...",
    backupTitle: "Backup codes", backupDesc: "Save these codes somewhere safe. You can use them to sign in if you lose access to your authenticator.",
    copyAll: "Copy all", done: "Done", copied: "Copied!", password: "Password", passwordLabel: "Current password",
    changed: "Password changed successfully.", change: "Change", changeTitle: "Change password", changeDesc: "Enter your current and new password.",
    current: "Current password", new: "New password", confirm: "Confirm new password",
    currentPh: "Enter your current password", newPh: "Enter a new password", confirmPh: "Re-enter the new password",
    changePassword: "Change password", pwdMismatch: "New passwords don't match.", failed: "Something went wrong. Try again.",
    secondaryEmail: "Recovery email", secondaryDesc: "Use this email to recover your account if you get locked out.",
    noSecondaryEmail: "No recovery email set", addEmail: "Add email", lastActive: "Last active",
    changeEmail: "Change email", verifyEmail: "Verify email", newEmailLabel: "New email", newEmailPh: "backup@example.com", sentTo: "We sent a code to {email}.",
    email: "Email", verified: "Verified", remove: "Remove", sendCode: "Send code", sending: "Sending...",
    verify: "Verify", enterCode: "Enter the code sent to your email", enterValidEmail: "Enter a valid email address.",
    sendFailed: "Failed to send code. Try again.", enterCodeErr: "Enter the code.", invalidCode: "Invalid code. Try again.",
    disable2faFailed: "Failed to disable 2FA. Try again.", activeSessions: "Active sessions",
    noActiveSessions: "No active sessions.", unknownDevice: "Unknown device", loginHistory: "Login history",
    noLoginHistory: "No recent logins.", thStatus: "Status", thDate: "Date", thMethod: "Method",
    thIpDevice: "IP / Device", success: "Success", failedStart: "Failed",
  },
  privacy: {
    title: "Privacy", subtitle: "Control how your data is used.",
    dataAnalytics: "Data & analytics", analytics: "Analytics", analyticsDesc: "Help Tirbeo improve by sharing usage data.",
    crashReports: "Crash reports", crashReportsDesc: "Automatically send error reports when something breaks.",
    personalizedRecs: "Personalized recommendations", personalizedRecsDesc: "Use activity to tailor recommendations.",
    discoverability: "Discoverability", discoverabilityDesc: "Control how others can find you.",
    searchEngine: "Search engines", searchEngineDesc: "Allow search engines to index your public profile.",
    directory: "Directory", directoryDesc: "Show your profile in the Tirbeo directory.",
    dataExport: "Data export", dataExportDesc: "Download a copy of everything stored in your account.",
    preparing: "Preparing export...", exportData: "Export data",
    exportNote: "You'll get a download link by email when it's ready.",
    dangerZone: "Danger zone", dangerZoneDesc: "Permanent actions that can't be undone.",
    deleteAccount: "Delete account", irreversible: "This action is permanent and irreversible. All data will be deleted.",
    typeDelete: "Type 'delete' to confirm.", typeDeletePh: "Type delete to confirm", deleting: "Deleting...",
  },
  profile: {
    title: "Profile", subtitle: "Tell people a bit about yourself.", saveChanges: "Save changes", noNameSet: "Name not set",
    personal: "Personal info", work: "Work", links: "Links", fullName: "Full name", fullNamePh: "Your full name",
    username: "Username", usernamePh: "your-username", bio: "Bio", bioPh: "Tell people what you do...",
    gender: "Gender", selectOption: "Select an option", male: "Male", female: "Female", other: "Other", preferNot: "Prefer not to say",
    birthday: "Birthday", country: "Country", countryPh: "Select your country", occupation: "Occupation",
    occupationPh: "e.g. Software Engineer", company: "Company", companyPh: "Your company", role: "Role", rolePh: "Your role",
    roleAtCompanyPh: "Your role at the company", industry: "Industry", industryPh: "e.g. Technology",
    companySize: "Company size", justMe: "Just me", website: "Website", websitePh: "https://yoursite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/username", github: "GitHub", githubPh: "github username", twitter: "Twitter / X", twitterPh: "@username", accountInfo: "Account info", email: "Email",
    recoveryEmail: "Recovery email", memberSince: "Member since", lastActive: "Last active",
    connectedAccounts: "Connected accounts", noneConnected: "No accounts connected.", verified: "Verified", unverified: "Not verified",
  },
  history: {
    title: "Activity history", subtitle: "A record of security and account events.",
    noActivity: "No activity yet", noActivityDesc: "Actions you take will show up here.",
    act: {
      login: "Signed in", logout: "Signed out", signup: "Account created", passwordChanged: "Password changed",
      profileUpdated: "Profile updated", twofaEnabled: "2FA enabled", twofaDisabled: "2FA disabled",
      sessionRevoked: "Sessions signed out", emailVerified: "Email verified", accountDeleted: "Account deleted",
      dataExported: "Data exported", notificationRead: "Notification read", ticketCreated: "Ticket created",
      ticketReplied: "Ticket replied", ticketClosed: "Ticket closed", unknown: "Activity",
    },
  },
  tickets: {
    title: "Tickets", countOne: "{n} ticket", countMany: "{n} tickets", newTicket: "New ticket",
    noTickets: "No tickets yet", noTicketsDesc: "Create a ticket to get help from our support team.",
    createTicket: "Create ticket", subject: "Subject", subjectPh: "Brief description of your issue",
    category: "Category", priority: "Priority", message: "Message", messagePh: "Describe your issue in detail...",
    describeIssue: "Describe your issue and we will get back to you.", cancel: "Cancel", creating: "Creating...",
    catGeneral: "General", catBug: "Bug report", catFeature: "Feature request", catBilling: "Billing",
    catOther: "Other", catAccount: "Account", prioLow: "Low", prioNormal: "Normal", prioHigh: "High", prioUrgent: "Urgent",
    statusOpen: "Open", statusClosed: "Closed", statusInProgress: "In progress", priorityLabel: "{priority} priority",
  },
  ticketDetail: {
    notFound: "Ticket not found.", backToTickets: "Back to tickets",
    noMessages: "No messages yet. Start the conversation below.", you: "You", support: "Support",
    supportTeam: "Support team", sendHint: "Enter to send · Shift+Enter for new line",
    writeReply: "Write a reply...", send: "Send",
  },
  newTicket: {
    title: "New ticket", subtitle: "Describe your issue and we will get back to you.",
    backToTickets: "Back to tickets", subject: "Subject", subjectPh: "Brief summary of your issue...",
    category: "Category", priority: "Priority", message: "Message",
    messagePh: "Describe your issue in detail. Include steps to reproduce if it's a bug, or your use case if it's a feature request...",
    countLabel: "{n} / 20,000", ctrlEnter: "⌘ + Enter to submit", cancel: "Cancel", creating: "Creating...",
    submitTicket: "Submit ticket", requiredError: "Subject and message are required.",
    createFailed: "Failed to create ticket. Try again.",
    catGeneral: "General", catGeneralDesc: "General questions or feedback", catBug: "Bug Report",
    catBugDesc: "Something isn't working correctly", catFeature: "Feature Request",
    catFeatureDesc: "Suggest a new feature or improvement", catAccount: "Account",
    catAccountDesc: "Issues with your account or profile", catBilling: "Billing",
    catBillingDesc: "Payments, invoices, or subscription", catOther: "Other", catOtherDesc: "Anything else",
    prioLow: "Low", prioLowDesc: "No rush", prioNormal: "Normal", prioNormalDesc: "Standard response time",
    prioHigh: "High", prioHighDesc: "Needs attention soon", prioUrgent: "Urgent", prioUrgentDesc: "Critical issue",
  },
  notifTexts: {
    "Sessions signed out": "Sessions signed out",
    "Signed in to your account": "Signed in to your account",
    "New login from {device}": "New login from {device}",
    "All other sessions were signed out for your account.": "All other sessions were signed out for your account.",
    "Session signed out": "Session signed out",
    "One of your sessions was signed out.": "One of your sessions was signed out.",
    "Two-step verification enabled": "Two-step verification enabled",
    "Authenticator app two-factor is now active on your account.": "Authenticator app two-factor is now active on your account.",
    "Two-step verification disabled": "Two-step verification disabled",
    "Two-factor authentication was turned off for your account.": "Two-factor authentication was turned off for your account.",
    "Recovery email verified": "Recovery email verified",
    "recoveryEmailBody": "Your recovery email ({email}) has been confirmed.",
  },
};

const es: Dict = {
  common: {
    loading: "Cargando", saving: "Guardando...", saved: "Guardado", autoSaved: "Cambios guardados automáticamente",
    viewAll: "Ver todo", new: "Nuevo", close: "Cerrar", cancel: "Cancelar", save: "Guardar", delete: "Eliminar",
    markRead: "Marcar como leído", loadMore: "Cargar más", noNotifications: "Sin notificaciones", noTickets: "Sin tickets",
    justNow: "Ahora mismo", agoM: "hace {n} min", agoH: "hace {n} h", yesterday: "Ayer", total: "en total",
    unsavedWarn: "Tienes cambios sin guardar: guárdalos antes de salir de esta página.",
  },
  nav: {
    workspace: "Espacio de trabajo", account: "Cuenta", support: "Soporte",
    getStarted: "Comenzar", inbox: "Bandeja de entrada", profile: "Perfil", preferences: "Preferencias",
    notifications: "Notificaciones", connectedApps: "Aplicaciones conectadas", security: "Seguridad", privacy: "Privacidad",
    sessions: "Sesiones", history: "Historial", tickets: "Tickets",
  },
  header: {
    searchPlaceholder: "Buscar...", notifications: "Notificaciones", switchToLight: "Cambiar a modo claro",
    switchToDark: "Cambiar a modo oscuro", calendar: "Calendario", account: "Cuenta", signOut: "Cerrar sesión", menu: "Menú", owner: "Propietario", user: "Usuario",
  },
  overview: {
    subtitle: "Tu panel de control de un vistazo.",
    goodMorning: "Buenos días", goodAfternoon: "Buenas tardes", goodEvening: "Buenas noches", goodNight: "Buenas noches",
    welcomeBack: "Bienvenido de nuevo",
    statUnread: "Sin leer", statOpenTickets: "Tickets abiertos", statTotalNotif: "Notificaciones totales",
    quickTitle: "Acciones rápidas",
    qInbox: "Bandeja de entrada", qInboxDesc: "Lee tus mensajes", qProfile: "Perfil", qProfileDesc: "Edita tu perfil",
    qSecurity: "Seguridad", qSecurityDesc: "2FA, contraseñas, sesiones", qSupport: "Soporte", qSupportDesc: "Abre un ticket",
    recentNotif: "Notificaciones recientes", recentTickets: "Tickets recientes", allSections: "Todas las secciones",
    sPrefs: "Preferencias", sPrefsDesc: "Idioma, zona horaria, formato", sNotif: "Notificaciones", sNotifDesc: "Canales, horas de silencio, resumen",
    sApps: "Aplicaciones conectadas", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "Privacidad", sPrivacyDesc: "Analítica, exportación de datos",
    sSessions: "Sesiones", sSessionsDesc: "Gestiona sesiones activas", sHistory: "Historial", sHistoryDesc: "Registro de actividad",
    openInbox: "Abrir bandeja de entrada", openTickets: "Abrir tickets", noNotifYet: "Aún no hay notificaciones.", noTicketsYet: "Aún no hay tickets.",
  },
  prefs: {
    title: "Preferencias", subtitle: "Personaliza tu experiencia.", general: "General",
    language: "Idioma", timezone: "Zona horaria", dateFormat: "Formato de fecha", timeFormat: "Formato de hora",
    h12: "12 horas (AM/PM)", h24: "24 horas",
    timezoneUTC: "UTC", kathmandu: "Asia/Kathmandu (GMT+5:45)", eastern: "Hora del Este", central: "Hora Central",
    mountain: "Hora de Montaña", pacific: "Hora del Pacífico", london: "Londres", berlin: "Berlín", tokyo: "Tokio",
    shanghai: "Shanghái", kolkata: "Calcuta",
    emailTitle: "Preferencias de correo", emailDesc: "Gestiona qué correos recibes de Tirbeo.",
    productEmails: "Correos de producto", productEmailsDesc: "Actualizaciones y noticias del producto.",
    weeklySummary: "Resumen semanal", weeklySummaryDesc: "Recibe un resumen semanal de tu actividad.",
    tipsUpdates: "Consejos y actualizaciones", tipsUpdatesDesc: "Consejos para aprovechar Tirbeo al máximo.",
  },
  session: { expired: "Tu sesión ha caducado. Es posible que algunas funciones no funcionen.", signInAgain: "Volver a iniciar sesión" },
  notif: {
    title: "Notificaciones", subtitle: "Configura cómo y cuándo recibes las notificaciones.", retention: "Las notificaciones se eliminan automáticamente después de 30 días.", empty: "Sin notificaciones", total: "en total",
    channelsTitle: "Canales", channelsDesc: "Elige dónde quieres recibir las notificaciones.",
    email: "Correo", push: "Push", inApp: "En la app",
    emailDesc: "Recibe notificaciones en tu correo.", pushDesc: "Notificaciones push del navegador.", inAppDesc: "Mostrar dentro de la aplicación.",
    browserBlocked: "Las notificaciones del navegador están bloqueadas en tu configuración del navegador.",
    categoriesTitle: "Categorías", categoriesDesc: "Elige qué categorías te interesan.",
    catSecurity: "Seguridad", catSecurityDesc: "Inicios de sesión, cambios de 2FA y actividad de contraseñas.",
    catForms: "Formularios", catFormsDesc: "Envíos y respuestas de formularios.",
    catProduct: "Producto", catProductDesc: "Actualizaciones y anuncios del producto.",
    catSupport: "Soporte", catSupportDesc: "Respuestas a tus tickets y novedades de soporte.",
    perCategory: "Canales por categoría", perCategoryDesc: "Anula los canales de cada categoría.",
    colCategory: "Categoría", colEmail: "Correo", colPush: "Push", colInApp: "En la app",
    quietTitle: "Horas de silencio", quietDesc: "No enviar notificaciones durante estas horas.",
    enableQuiet: "Activar horas de silencio", enableQuietDesc: "Silencia las notificaciones durante tu franja.",
    timeWindow: "Franja horaria", timeWindowDesc: "Las notificaciones se pausan entre estas horas.", to: "a",
    quietActive: "Las horas de silencio están activadas.",
    digestTitle: "Resumen diario", digestDesc: "Recibe un resumen de todo lo que te has perdido.",
    enableDigest: "Activar resumen", enableDigestDesc: "Recibe un resumen en lugar de alertas en tiempo real.",
    frequency: "Frecuencia", frequencyDesc: "Con qué frecuencia quieres recibir el resumen.",
    daily: "Diario", weekly: "Semanal", monthly: "Mensual",
  },
  search: {
    placeholder: "Buscar páginas, ajustes, acciones...", pages: "Páginas", overview: "Resumen",
    notificationsSettings: "Configuración de notificaciones", activityHistory: "Historial de actividad", supportTickets: "Tickets de soporte", navigate: "Navegar", open: "Abrir", close: "Cerrar",
  },
  calendar: {
    prevMonth: "Mes anterior", nextMonth: "Mes siguiente", backToToday: "Volver a hoy",
    today: "Hoy", yesterday: "Ayer", tomorrow: "Mañana", daysAgo: "hace {n} días", inDays: "en {n} días",
    months: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"],
  },
  inbox: {
    title: "Bandeja de entrada", descUnread: "{unread} sin leer de {total}", descTotal: "{total} mensajes", markAllRead: "Marcar todo como leído", tabAll: "Todas", tabUnread: "Sin leer", tabRead: "Leídas",
    deselect: "Deseleccionar", selectAll: "Seleccionar todo", select: "Seleccionar", read: "Leer",
    searchPlaceholder: "Buscar notificaciones...", noMatching: "Sin notificaciones coincidentes",
    noMatchingDesc: "Prueba otra búsqueda o borra el filtro.", allCaughtUp: "Estás al día",
    allCaughtUpDesc: "No hay notificaciones sin leer en esta carpeta.", inboxEmpty: "Aún no hay notificaciones",
    inboxEmptyDesc: "Las notificaciones de Tirbeo aparecerán aquí.", loadMore: "Cargar más", back: "Volver", open: "Abrir",
    noContent: "Sin contenido", viewDetails: "Ver detalles", selectMessage: "Selecciona un mensaje",
    selectMessageDesc: "Elige un mensaje de la lista para leerlo aquí.",
    typeSecurity: "Seguridad", typeForms: "Formularios", typeProduct: "Producto", typeSupport: "Soporte", typeLogin: "Inicio de sesión", typeNotification: "Notificación", delete: "Eliminar",
  },
  sessions: {
    title: "Sesiones", subtitle: "Gestiona dónde has iniciado sesión.", revokeAllOthers: "Cerrar todas las demás sesiones",
    noActive: "Sin sesiones activas", noActiveDesc: "Ahora mismo no tienes sesiones iniciadas.",
    currentDevice: "Este dispositivo", current: "Actual", active: "Activa", unknownDevice: "Dispositivo desconocido", unknownIp: "IP desconocida",
    revoke: "Cerrar sesión", revokeAllTitle: "¿Cerrar todas las demás sesiones?",
    revokeAllDesc: "Se cerrarán todas las demás sesiones. Este dispositivo seguirá conectado.",
    revokeSessionTitle: "¿Cerrar esta sesión?", revokeSessionDesc: "Este dispositivo cerrará la sesión inmediatamente.",
    revoking: "Cerrando sesión...", unknown: "Desconocido", unknownBrowser: "Navegador desconocido", unknownOS: "SO desconocido", local: "Local", lastActive: "Última actividad", on: "en",
  },
  apps: {
    title: "Aplicaciones conectadas", subtitle: "Conecta tus cuentas para desbloquear integraciones.",
    available: "Aplicaciones disponibles", disconnect: "Desconectar", connect: "Conectar",
    googleDesc: "Sincroniza contactos, calendario y Gmail.", githubDesc: "Sincroniza repositorios y actividad.",
    discordDesc: "Recibe notificaciones en Discord.",
    connected: "Conectado", notConnected: "No conectado", connectedOn: "Conectado el",
    disconnectConfirm: "¿Desconectar proveedor?",
    disconnectDesc: "¿Estás seguro de que quieres desconectar este proveedor? Puedes reconectarlo después.",
    mergeTitle: "¿Fusionar cuentas?",
    mergeDesc: "El email de este proveedor ya está vinculado a otra cuenta. Fusionar transferirá el proveedor a tu cuenta actual.",
    mergeEmail: "Email",
    mergeButton: "Fusionar cuentas",
    cancelButton: "Cancelar",
    mergeSuccess: "¡Cuentas fusionadas con éxito!",
    mergeCancelled: "Fusión cancelada.",
    noProviders: "No hay proveedores configurados.",
    providerEmail: "Email",
  },
  security: {
    title: "Seguridad", subtitle: "Protege tu cuenta con una seguridad sólida.",
    twoFactor: "Autenticación de dos factores",
    twoFactorOn: "La autenticación de dos factores está activada en tu cuenta.",
    twoFactorOff: "La autenticación de dos factores no está activada en tu cuenta.",
    status: "Estado", enabled: "Activada", notEnabled: "No activada", disable2fa: "Desactivar 2FA", enable2fa: "Activar 2FA",
    setupLoading: "Cargando configuración de 2FA...", setupTitle: "Activar autenticación de dos factores",
    setupDesc: "Escanea este código QR con tu app de autenticación y luego introduce el código de abajo.",
    key: "Clave", code: "Código", copy: "Copiar", enter6: "Introduce el código de 6 dígitos de tu app de autenticación",
    verifyEnable: "Activar 2FA", verifying: "Verificando...", disableTitle: "¿Desactivar la autenticación de dos factores?",
    disableDesc: "Esto eliminará la 2FA de tu cuenta de inmediato.", disabling: "Desactivando...",
    backupTitle: "Códigos de respaldo", backupDesc: "Guarda estos códigos en un lugar seguro. Puedes usarlos para iniciar sesión si pierdes acceso a tu autenticador.",
    copyAll: "Copiar todo", done: "Hecho", copied: "¡Copiado!", password: "Contraseña", passwordLabel: "Contraseña actual",
    changed: "Contraseña cambiada correctamente.", change: "Cambiar", changeTitle: "Cambiar contraseña", changeDesc: "Introduce tu contraseña actual y la nueva.",
    current: "Contraseña actual", new: "Nueva contraseña", confirm: "Confirmar nueva contraseña",
    currentPh: "Introduce tu contraseña actual", newPh: "Introduce una nueva contraseña", confirmPh: "Vuelve a introducir la nueva contraseña",
    changePassword: "Cambiar contraseña", pwdMismatch: "Las nuevas contraseñas no coinciden.", failed: "Algo salió mal. Inténtalo de nuevo.",
    secondaryEmail: "Correo de recuperación", secondaryDesc: "Usa este correo para recuperar tu cuenta si te quedas bloqueado.",
    noSecondaryEmail: "No se ha configurado correo de recuperación", addEmail: "Añadir correo", lastActive: "Última actividad",
    changeEmail: "Cambiar correo", verifyEmail: "Verificar correo", newEmailLabel: "Nuevo correo", newEmailPh: "backup@example.com", sentTo: "Enviamos un código a {email}.",
    email: "Correo", verified: "Verificado", remove: "Eliminar", sendCode: "Enviar código", sending: "Enviando...",
    verify: "Verificar", enterCode: "Introduce el código enviado a tu correo", enterValidEmail: "Introduce un correo válido.",
    sendFailed: "No se pudo enviar el código. Inténtalo de nuevo.", enterCodeErr: "Introduce el código.", invalidCode: "Código no válido. Inténtalo de nuevo.",
    disable2faFailed: "No se pudo desactivar la 2FA. Inténtalo de nuevo.", activeSessions: "Sesiones activas",
    noActiveSessions: "Sin sesiones activas.", unknownDevice: "Dispositivo desconocido", loginHistory: "Historial de inicio de sesión",
    noLoginHistory: "Sin inicios de sesión recientes.", thStatus: "Estado", thDate: "Fecha", thMethod: "Método",
    thIpDevice: "IP / Dispositivo", success: "Correcto", failedStart: "Fallido",
  },
  privacy: {
    title: "Privacidad", subtitle: "Controla cómo se usan tus datos.",
    dataAnalytics: "Datos y analítica", analytics: "Analítica", analyticsDesc: "Ayuda a Tirbeo a mejorar compartiendo datos de uso.",
    crashReports: "Informes de errores", crashReportsDesc: "Envía automáticamente informes de error cuando algo falle.",
    personalizedRecs: "Recomendaciones personalizadas", personalizedRecsDesc: "Usa la actividad para adaptar las recomendaciones.",
    discoverability: "Descubribilidad", discoverabilityDesc: "Controla cómo pueden encontrarte los demás.",
    searchEngine: "Motores de búsqueda", searchEngineDesc: "Permite que los motores de búsqueda indexen tu perfil público.",
    directory: "Directorio", directoryDesc: "Muestra tu perfil en el directorio de Tirbeo.",
    dataExport: "Exportación de datos", dataExportDesc: "Descarga una copia de todo lo que hay en tu cuenta.",
    preparing: "Preparando exportación...", exportData: "Exportar datos",
    exportNote: "Recibirás un enlace de descarga por correo cuando esté listo.",
    dangerZone: "Zona de peligro", dangerZoneDesc: "Acciones permanentes que no se pueden deshacer.",
    deleteAccount: "Eliminar cuenta", irreversible: "Esta acción es permanente e irreversible. Se eliminarán todos los datos.",
    typeDelete: "Escribe 'delete' para confirmar.", typeDeletePh: "Escribe delete para confirmar", deleting: "Eliminando...",
  },
  profile: {
    title: "Perfil", subtitle: "Cuéntale a la gente un poco sobre ti.", saveChanges: "Guardar cambios", noNameSet: "Nombre no definido",
    personal: "Información personal", work: "Trabajo", links: "Enlaces", fullName: "Nombre completo", fullNamePh: "Tu nombre completo",
    username: "Nombre de usuario", usernamePh: "tu-usuario", bio: "Biografía", bioPh: "Cuéntale a la gente a qué te dedicas...",
    gender: "Género", selectOption: "Selecciona una opción", male: "Masculino", female: "Femenino", other: "Otro", preferNot: "Prefiero no decirlo",
    birthday: "Cumpleaños", country: "País", countryPh: "Selecciona tu país", occupation: "Ocupación",
    occupationPh: "p. ej. Ingeniero de software", company: "Empresa", companyPh: "Tu empresa", role: "Rol", rolePh: "Tu rol",
    roleAtCompanyPh: "Tu rol en la empresa", industry: "Sector", industryPh: "p. ej. Tecnología",
    companySize: "Tamaño de la empresa", justMe: "Solo yo", website: "Sitio web", websitePh: "https://tusitio.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/usuario", github: "GitHub", githubPh: "usuario de github", twitter: "Twitter / X", twitterPh: "@usuario", accountInfo: "Información de la cuenta", email: "Correo",
    recoveryEmail: "Correo de recuperación", memberSince: "Miembro desde", lastActive: "Última actividad",
    connectedAccounts: "Cuentas conectadas", noneConnected: "No hay cuentas conectadas.", verified: "Verificado", unverified: "No verificado",
  },
  history: {
    title: "Historial de actividad", subtitle: "Un registro de los eventos de seguridad y cuenta.",
    noActivity: "Sin actividad aún", noActivityDesc: "Las acciones que realices aparecerán aquí.",
    act: {
      login: "Inicio de sesión", logout: "Cierre de sesión", signup: "Cuenta creada", passwordChanged: "Contraseña cambiada",
      profileUpdated: "Perfil actualizado", twofaEnabled: "2FA activada", twofaDisabled: "2FA desactivada",
      sessionRevoked: "Sesiones cerradas", emailVerified: "Correo verificado", accountDeleted: "Cuenta eliminada",
      dataExported: "Datos exportados", notificationRead: "Notificación leída", ticketCreated: "Ticket creado",
      ticketReplied: "Ticket respondido", ticketClosed: "Ticket cerrado", unknown: "Actividad",
    },
  },
  tickets: {
    title: "Tickets", countOne: "{n} ticket", countMany: "{n} tickets", newTicket: "Nuevo ticket",
    noTickets: "Aún no hay tickets", noTicketsDesc: "Crea un ticket para recibir ayuda de nuestro equipo de soporte.",
    createTicket: "Crear ticket", subject: "Asunto", subjectPh: "Breve descripción de tu problema",
    category: "Categoría", priority: "Prioridad", message: "Mensaje", messagePh: "Describe tu problema en detalle...",
    describeIssue: "Describe tu problema y te responderemos.", cancel: "Cancelar", creating: "Creando...",
    catGeneral: "General", catBug: "Informe de error", catFeature: "Solicitud de función", catBilling: "Facturación",
    catOther: "Otro", catAccount: "Cuenta", prioLow: "Baja", prioNormal: "Normal", prioHigh: "Alta", prioUrgent: "Urgente",
    statusOpen: "Abierto", statusClosed: "Cerrado", statusInProgress: "En curso", priorityLabel: "prioridad {priority}",
  },
  ticketDetail: {
    notFound: "Ticket no encontrado.", backToTickets: "Volver a tickets",
    noMessages: "Aún no hay mensajes. Comienza la conversación abajo.", you: "Tú", support: "Soporte",
    supportTeam: "Equipo de soporte", sendHint: "Enter para enviar · Shift+Enter para nueva línea",
    writeReply: "Escribe una respuesta...", send: "Enviar",
  },
  newTicket: {
    title: "Nuevo ticket", subtitle: "Describe tu problema y te responderemos.",
    backToTickets: "Volver a tickets", subject: "Asunto", subjectPh: "Breve resumen de tu problema...",
    category: "Categoría", priority: "Prioridad", message: "Mensaje",
    messagePh: "Describe tu problema en detalle. Incluye los pasos para reproducirlo si es un error, o tu caso de uso si es una solicitud de función...",
    countLabel: "{n} / 20,000", ctrlEnter: "⌘ + Enter para enviar", cancel: "Cancelar", creating: "Creando...",
    submitTicket: "Enviar ticket", requiredError: "El asunto y el mensaje son obligatorios.",
    createFailed: "No se pudo crear el ticket. Inténtalo de nuevo.",
    catGeneral: "General", catGeneralDesc: "Preguntas generales o comentarios", catBug: "Informe de error",
    catBugDesc: "Algo no funciona correctamente", catFeature: "Solicitud de función",
    catFeatureDesc: "Sugiere una nueva función o mejora", catAccount: "Cuenta",
    catAccountDesc: "Problemas con tu cuenta o perfil", catBilling: "Facturación",
    catBillingDesc: "Pagos, facturas o suscripción", catOther: "Otro", catOtherDesc: "Cualquier otra cosa",
    prioLow: "Baja", prioLowDesc: "Sin prisa", prioNormal: "Normal", prioNormalDesc: "Tiempo de respuesta estándar",
    prioHigh: "Alta", prioHighDesc: "Necesita atención pronto", prioUrgent: "Urgente", prioUrgentDesc: "Problema crítico",
  },
  notifTexts: {
    "Sessions signed out": "Sesiones cerradas",
    "Signed in to your account": "Has iniciado sesión en tu cuenta",
    "New login from {device}": "Nuevo inicio de sesión desde {device}",
    "All other sessions were signed out for your account.": "Se cerraron todas las demás sesiones de tu cuenta.",
    "Session signed out": "Sesión cerrada",
    "One of your sessions was signed out.": "Una de tus sesiones se cerró.",
    "Two-step verification enabled": "Verificación en dos pasos activada",
    "Authenticator app two-factor is now active on your account.": "La autenticación de dos factores de la app está activa en tu cuenta.",
    "Two-step verification disabled": "Verificación en dos pasos desactivada",
    "Two-factor authentication was turned off for your account.": "Se desactivó la autenticación de dos factores de tu cuenta.",
    "Recovery email verified": "Correo de recuperación verificado",
    "recoveryEmailBody": "Se ha confirmado tu correo de recuperación ({email}).",
  },
};

const fr: Dict = {
  common: {
    loading: "Chargement", saving: "Enregistrement...", saved: "Enregistré", autoSaved: "Modifications auto-enregistrées",
    viewAll: "Tout voir", new: "Nouveau", close: "Fermer", cancel: "Annuler", save: "Enregistrer", delete: "Supprimer",
    markRead: "Marquer comme lu", loadMore: "Charger plus", noNotifications: "Aucune notification", noTickets: "Aucun ticket",
    justNow: "À l'instant", agoM: "il y a {n} min", agoH: "il y a {n} h", yesterday: "Hier", total: "au total",
    unsavedWarn: "Vous avez des modifications non enregistrées — enregistrez-les avant de quitter cette page.",
  },
  nav: {
    workspace: "Espace de travail", account: "Compte", support: "Assistance",
    getStarted: "Commencer", inbox: "Boîte de réception", profile: "Profil", preferences: "Préférences",
    notifications: "Notifications", connectedApps: "Applications connectées", security: "Sécurité", privacy: "Confidentialité",
    sessions: "Sessions", history: "Historique", tickets: "Tickets",
  },
  header: {
    searchPlaceholder: "Rechercher...", notifications: "Notifications", switchToLight: "Passer en mode clair",
    switchToDark: "Passer en mode sombre", calendar: "Calendrier", account: "Compte", signOut: "Se déconnecter", menu: "Menu", owner: "Propriétaire", user: "Utilisateur",
  },
  overview: {
    subtitle: "Votre tableau de bord en un coup d'œil.",
    goodMorning: "Bonjour", goodAfternoon: "Bon après-midi", goodEvening: "Bonsoir", goodNight: "Bonne nuit",
    welcomeBack: "Bon retour",
    statUnread: "Non lus", statOpenTickets: "Tickets ouverts", statTotalNotif: "Notifications totales",
    quickTitle: "Actions rapides",
    qInbox: "Boîte de réception", qInboxDesc: "Lisez vos messages", qProfile: "Profil", qProfileDesc: "Modifiez votre profil",
    qSecurity: "Sécurité", qSecurityDesc: "2FA, mots de passe, sessions", qSupport: "Assistance", qSupportDesc: "Ouvrez un ticket",
    recentNotif: "Notifications récentes", recentTickets: "Tickets récents", allSections: "Toutes les sections",
    sPrefs: "Préférences", sPrefsDesc: "Langue, fuseau horaire, format", sNotif: "Notifications", sNotifDesc: "Canaux, heures calmes, résumé",
    sApps: "Applications connectées", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "Confidentialité", sPrivacyDesc: "Analytique, export de données",
    sSessions: "Sessions", sSessionsDesc: "Gérez vos sessions actives", sHistory: "Historique", sHistoryDesc: "Journal d'activité",
    openInbox: "Ouvrir la boîte de réception", openTickets: "Ouvrir les tickets", noNotifYet: "Aucune notification pour le moment.", noTicketsYet: "Aucun ticket pour le moment.",
  },
  prefs: {
    title: "Préférences", subtitle: "Personnalisez votre expérience.", general: "Général",
    language: "Langue", timezone: "Fuseau horaire", dateFormat: "Format de date", timeFormat: "Format d'heure",
    h12: "12 heures (AM/PM)", h24: "24 heures",
    timezoneUTC: "UTC", kathmandu: "Asie/Katmandou (GMT+5:45)", eastern: "Heure de l'Est", central: "Heure centrale",
    mountain: "Heure des Rocheuses", pacific: "Heure du Pacifique", london: "Londres", berlin: "Berlin", tokyo: "Tokyo",
    shanghai: "Shanghai", kolkata: "Kolkata",
    emailTitle: "Préférences e-mail", emailDesc: "Gérez les e-mails que vous recevez de Tirbeo.",
    productEmails: "E-mails produit", productEmailsDesc: "Mises à jour de fonctionnalités et actualités produit.",
    weeklySummary: "Résumé hebdomadaire", weeklySummaryDesc: "Recevez un résumé hebdomadaire de votre activité.",
    tipsUpdates: "Conseils et mises à jour", tipsUpdatesDesc: "Des conseils pour tirer le meilleur parti de Tirbeo.",
  },
  session: { expired: "Votre session a expiré. Certaines fonctionnalités peuvent ne pas fonctionner.", signInAgain: "Se reconnecter" },
  notif: {
    title: "Notifications", subtitle: "Configurez comment et quand vous recevez les notifications.", retention: "Les notifications sont supprimées automatiquement après 30 jours.", empty: "Aucune notification", total: "au total",
    channelsTitle: "Canaux", channelsDesc: "Choisissez où recevoir les notifications.",
    email: "E-mail", push: "Push", inApp: "Dans l'app",
    emailDesc: "Recevez des notifications dans votre boîte mail.", pushDesc: "Notifications push du navigateur.", inAppDesc: "Afficher dans l'application.",
    browserBlocked: "Les notifications du navigateur sont bloquées dans vos paramètres.",
    categoriesTitle: "Catégories", categoriesDesc: "Choisissez les catégories qui vous intéressent.",
    catSecurity: "Sécurité", catSecurityDesc: "Connexions, changements 2FA et activité des mots de passe.",
    catForms: "Formulaires", catFormsDesc: "Envois et réponses de formulaires.",
    catProduct: "Produit", catProductDesc: "Mises à jour et annonces produit.",
    catSupport: "Assistance", catSupportDesc: "Réponses à vos tickets et mises à jour d'assistance.",
    perCategory: "Canaux par catégorie", perCategoryDesc: "Remplacez les canaux de chaque catégorie.",
    colCategory: "Catégorie", colEmail: "E-mail", colPush: "Push", colInApp: "Dans l'app",
    quietTitle: "Heures calmes", quietDesc: "Ne pas envoyer de notifications pendant ces heures.",
    enableQuiet: "Activer les heures calmes", enableQuietDesc: "Silenciez les notifications pendant votre créneau.",
    timeWindow: "Créneau horaire", timeWindowDesc: "Les notifications sont mises en pause entre ces heures.", to: "à",
    quietActive: "Les heures calmes sont actives.",
    digestTitle: "Résumé quotidien", digestDesc: "Recevez un récapitulatif de tout ce que vous avez manqué.",
    enableDigest: "Activer le résumé", enableDigestDesc: "Recevez un résumé au lieu d'alertes en temps réel.",
    frequency: "Fréquence", frequencyDesc: "À quelle fréquence vous souhaitez recevoir le résumé.",
    daily: "Quotidien", weekly: "Hebdomadaire", monthly: "Mensuel",
  },
  search: {
    placeholder: "Rechercher des pages, des paramètres, des actions...", pages: "Pages", overview: "Vue d'ensemble",
    notificationsSettings: "Paramètres de notifications", activityHistory: "Historique d'activité", supportTickets: "Tickets d'assistance", navigate: "Naviguer", open: "Ouvrir", close: "Fermer",
  },
  calendar: {
    prevMonth: "Mois précédent", nextMonth: "Mois suivant", backToToday: "Revenir à aujourd'hui",
    today: "Aujourd'hui", yesterday: "Hier", tomorrow: "Demain", daysAgo: "il y a {n} jours", inDays: "dans {n} jours",
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  },
  inbox: {
    title: "Boîte de réception", descUnread: "{unread} non lus sur {total}", descTotal: "{total} messages", markAllRead: "Tout marquer comme lu", tabAll: "Toutes", tabUnread: "Non lues", tabRead: "Lues",
    deselect: "Désélectionner", selectAll: "Tout sélectionner", select: "Sélectionner", read: "Lire",
    searchPlaceholder: "Rechercher des notifications...", noMatching: "Aucune notification correspondante",
    noMatchingDesc: "Essayez une autre recherche ou effacez le filtre.", allCaughtUp: "Vous êtes à jour",
    allCaughtUpDesc: "Aucune notification non lue dans ce dossier.", inboxEmpty: "Aucune notification pour le moment",
    inboxEmptyDesc: "Les notifications de Tirbeo apparaîtront ici.", loadMore: "Charger plus", back: "Retour", open: "Ouvrir",
    noContent: "Aucun contenu", viewDetails: "Voir les détails", selectMessage: "Sélectionnez un message",
    selectMessageDesc: "Choisissez un message dans la liste pour le lire ici.",
    typeSecurity: "Sécurité", typeForms: "Formulaires", typeProduct: "Produit", typeSupport: "Assistance", typeLogin: "Connexion", typeNotification: "Notification", delete: "Supprimer",
  },
  sessions: {
    title: "Sessions", subtitle: "Gérez vos connexions.", revokeAllOthers: "Déconnecter toutes les autres sessions",
    noActive: "Aucune session active", noActiveDesc: "Vous n'êtes connecté nulle part actuellement.",
    currentDevice: "Cet appareil", current: "Actuelle", active: "Active", unknownDevice: "Appareil inconnu", unknownIp: "IP inconnue",
    revoke: "Se déconnecter", revokeAllTitle: "Déconnecter toutes les autres sessions ?",
    revokeAllDesc: "Toutes les autres sessions seront déconnectées. Cet appareil restera connecté.",
    revokeSessionTitle: "Déconnecter cette session ?", revokeSessionDesc: "Cet appareil sera déconnecté immédiatement.",
    revoking: "Déconnexion...", unknown: "Inconnu", unknownBrowser: "Navigateur inconnu", unknownOS: "OS inconnu", local: "Local", lastActive: "Dernière activité", on: "sur",
  },
  apps: {
    title: "Applications connectées", subtitle: "Connectez vos comptes pour débloquer des intégrations.",
    available: "Applications disponibles", disconnect: "Déconnecter", connect: "Connecter",
    googleDesc: "Synchronisez contacts, calendrier et Gmail.", githubDesc: "Synchronisez dépôts et activité.",
    discordDesc: "Recevez des notifications sur Discord.",
    connected: "Connecté", notConnected: "Non connecté", connectedOn: "Connecté le",
    disconnectConfirm: "Déconnecter le fournisseur ?",
    disconnectDesc: "Êtes-vous sûr de vouloir déconnecter ce fournisseur ? Vous pouvez le reconnecter plus tard.",
    mergeTitle: "Fusionner les comptes ?",
    mergeDesc: "L'e-mail de ce fournisseur est déjà lié à un autre compte. La fusion transférera le fournisseur à votre compte actuel.",
    mergeEmail: "E-mail",
    mergeButton: "Fusionner les comptes",
    cancelButton: "Annuler",
    mergeSuccess: "Comptes fusionnés avec succès !",
    mergeCancelled: "Fusion annulée.",
    noProviders: "Aucun fournisseur configuré.",
    providerEmail: "E-mail",
  },
  security: {
    title: "Sécurité", subtitle: "Protégez votre compte avec une sécurité renforcée.",
    twoFactor: "Authentification à deux facteurs",
    twoFactorOn: "L'authentification à deux facteurs est activée sur votre compte.",
    twoFactorOff: "L'authentification à deux facteurs n'est pas activée sur votre compte.",
    status: "Statut", enabled: "Activée", notEnabled: "Non activée", disable2fa: "Désactiver la 2FA", enable2fa: "Activer la 2FA",
    setupLoading: "Chargement de la configuration 2FA...", setupTitle: "Activer l'authentification à deux facteurs",
    setupDesc: "Scannez ce code QR avec votre application d'authentification, puis saisissez le code ci-dessous.",
    key: "Clé", code: "Code", copy: "Copier", enter6: "Saisissez le code à 6 chiffres de votre application d'authentification",
    verifyEnable: "Activer la 2FA", verifying: "Vérification...", disableTitle: "Désactiver l'authentification à deux facteurs ?",
    disableDesc: "Cela supprimera immédiatement la 2FA de votre compte.", disabling: "Désactivation...",
    backupTitle: "Codes de secours", backupDesc: "Conservez ces codes en lieu sûr. Vous pouvez les utiliser pour vous connecter si vous perdez l'accès à votre authentificateur.",
    copyAll: "Tout copier", done: "Terminé", copied: "Copié !", password: "Mot de passe", passwordLabel: "Mot de passe actuel",
    changed: "Mot de passe modifié avec succès.", change: "Modifier", changeTitle: "Modifier le mot de passe", changeDesc: "Saisissez votre mot de passe actuel et le nouveau.",
    current: "Mot de passe actuel", new: "Nouveau mot de passe", confirm: "Confirmer le nouveau mot de passe",
    currentPh: "Saisissez votre mot de passe actuel", newPh: "Saisissez un nouveau mot de passe", confirmPh: "Ressaisissez le nouveau mot de passe",
    changePassword: "Modifier le mot de passe", pwdMismatch: "Les nouveaux mots de passe ne correspondent pas.", failed: "Une erreur est survenue. Réessayez.",
    secondaryEmail: "E-mail de récupération", secondaryDesc: "Utilisez cet e-mail pour récupérer votre compte si vous êtes bloqué.",
    noSecondaryEmail: "Aucun e-mail de récupération défini", addEmail: "Ajouter un e-mail", lastActive: "Dernière activité",
    changeEmail: "Modifier l’e-mail", verifyEmail: "Vérifier l’e-mail", newEmailLabel: "Nouvel e-mail", newEmailPh: "backup@example.com", sentTo: "Nous avons envoyé un code à {email}.",
    email: "E-mail", verified: "Vérifié", remove: "Supprimer", sendCode: "Envoyer le code", sending: "Envoi...",
    verify: "Vérifier", enterCode: "Saisissez le code envoyé à votre e-mail", enterValidEmail: "Saisissez une adresse e-mail valide.",
    sendFailed: "Échec de l'envoi du code. Réessayez.", enterCodeErr: "Saisissez le code.", invalidCode: "Code invalide. Réessayez.",
    disable2faFailed: "Échec de la désactivation de la 2FA. Réessayez.", activeSessions: "Sessions actives",
    noActiveSessions: "Aucune session active.", unknownDevice: "Appareil inconnu", loginHistory: "Historique de connexion",
    noLoginHistory: "Aucune connexion récente.", thStatus: "Statut", thDate: "Date", thMethod: "Méthode",
    thIpDevice: "IP / Appareil", success: "Réussi", failedStart: "Échec",
  },
  privacy: {
    title: "Confidentialité", subtitle: "Contrôlez l'utilisation de vos données.",
    dataAnalytics: "Données et analytique", analytics: "Analytique", analyticsDesc: "Aidez Tirbeo à s'améliorer en partageant des données d'utilisation.",
    crashReports: "Rapports d'erreur", crashReportsDesc: "Envoyez automatiquement des rapports d'erreur en cas de panne.",
    personalizedRecs: "Recommandations personnalisées", personalizedRecsDesc: "Utilisez l'activité pour adapter les recommandations.",
    discoverability: "Découvrabilité", discoverabilityDesc: "Contrôlez comment les autres peuvent vous trouver.",
    searchEngine: "Moteurs de recherche", searchEngineDesc: "Autorisez les moteurs de recherche à indexer votre profil public.",
    directory: "Annuaire", directoryDesc: "Affichez votre profil dans l'annuaire Tirbeo.",
    dataExport: "Export de données", dataExportDesc: "Téléchargez une copie de tout ce qui est stocké sur votre compte.",
    preparing: "Préparation de l'export...", exportData: "Exporter les données",
    exportNote: "Vous recevrez un lien de téléchargement par e-mail lorsqu'il sera prêt.",
    dangerZone: "Zone dangereuse", dangerZoneDesc: "Actions permanentes irréversibles.",
    deleteAccount: "Supprimer le compte", irreversible: "Cette action est permanente et irréversible. Toutes les données seront supprimées.",
    typeDelete: "Saisissez « delete » pour confirmer.", typeDeletePh: "Saisissez delete pour confirmer", deleting: "Suppression...",
  },
  profile: {
    title: "Profil", subtitle: "Parlez un peu de vous.", saveChanges: "Enregistrer les modifications", noNameSet: "Nom non défini",
    personal: "Informations personnelles", work: "Travail", links: "Liens", fullName: "Nom complet", fullNamePh: "Votre nom complet",
    username: "Nom d'utilisateur", usernamePh: "votre-pseudo", bio: "Bio", bioPh: "Parlez de ce que vous faites...",
    gender: "Genre", selectOption: "Sélectionnez une option", male: "Homme", female: "Femme", other: "Autre", preferNot: "Préfère ne pas dire",
    birthday: "Anniversaire", country: "Pays", countryPh: "Sélectionnez votre pays", occupation: "Profession",
    occupationPh: "p. ex. Ingénieur logiciel", company: "Entreprise", companyPh: "Votre entreprise", role: "Rôle", rolePh: "Votre rôle",
    roleAtCompanyPh: "Votre rôle dans l'entreprise", industry: "Secteur", industryPh: "p. ex. Technologie",
    companySize: "Taille de l'entreprise", justMe: "Moi uniquement", website: "Site web", websitePh: "https://votresite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/utilisateur", github: "GitHub", githubPh: "nom d'utilisateur github", twitter: "Twitter / X", twitterPh: "@utilisateur", accountInfo: "Informations du compte", email: "E-mail",
    recoveryEmail: "E-mail de récupération", memberSince: "Membre depuis", lastActive: "Dernière activité",
    connectedAccounts: "Comptes connectés", noneConnected: "Aucun compte connecté.", verified: "Vérifié", unverified: "Non vérifié",
  },
  history: {
    title: "Historique d'activité", subtitle: "Un journal des événements de sécurité et de compte.",
    noActivity: "Aucune activité pour le moment", noActivityDesc: "Les actions que vous effectuez apparaîtront ici.",
    act: {
      login: "Connexion", logout: "Déconnexion", signup: "Compte créé", passwordChanged: "Mot de passe modifié",
      profileUpdated: "Profil mis à jour", twofaEnabled: "2FA activée", twofaDisabled: "2FA désactivée",
      sessionRevoked: "Sessions déconnectées", emailVerified: "E-mail vérifié", accountDeleted: "Compte supprimé",
      dataExported: "Données exportées", notificationRead: "Notification lue", ticketCreated: "Ticket créé",
      ticketReplied: "Ticket répondu", ticketClosed: "Ticket fermé", unknown: "Activité",
    },
  },
  tickets: {
    title: "Tickets", countOne: "{n} ticket", countMany: "{n} tickets", newTicket: "Nouveau ticket",
    noTickets: "Aucun ticket pour le moment", noTicketsDesc: "Créez un ticket pour obtenir de l'aide de notre équipe d'assistance.",
    createTicket: "Créer un ticket", subject: "Objet", subjectPh: "Brève description de votre problème",
    category: "Catégorie", priority: "Priorité", message: "Message", messagePh: "Décrivez votre problème en détail...",
    describeIssue: "Décrivez votre problème et nous vous répondrons.", cancel: "Annuler", creating: "Création...",
    catGeneral: "Général", catBug: "Rapport de bug", catFeature: "Demande de fonctionnalité", catBilling: "Facturation",
    catOther: "Autre", catAccount: "Compte", prioLow: "Basse", prioNormal: "Normale", prioHigh: "Haute", prioUrgent: "Urgente",
    statusOpen: "Ouvert", statusClosed: "Fermé", statusInProgress: "En cours", priorityLabel: "priorité {priority}",
  },
  ticketDetail: {
    notFound: "Ticket introuvable.", backToTickets: "Retour aux tickets",
    noMessages: "Aucun message pour le moment. Commencez la conversation ci-dessous.", you: "Vous", support: "Assistance",
    supportTeam: "Équipe d'assistance", sendHint: "Entrée pour envoyer · Maj+Entrée pour une nouvelle ligne",
    writeReply: "Rédigez une réponse...", send: "Envoyer",
  },
  newTicket: {
    title: "Nouveau ticket", subtitle: "Décrivez votre problème et nous vous répondrons.",
    backToTickets: "Retour aux tickets", subject: "Objet", subjectPh: "Brève description de votre problème...",
    category: "Catégorie", priority: "Priorité", message: "Message",
    messagePh: "Décrivez votre problème en détail. Incluez les étapes pour le reproduire s'il s'agit d'un bug, ou votre cas d'usage s'il s'agit d'une demande de fonctionnalité...",
    countLabel: "{n} / 20 000", ctrlEnter: "⌘ + Entrée pour envoyer", cancel: "Annuler", creating: "Création...",
    submitTicket: "Envoyer le ticket", requiredError: "L'objet et le message sont obligatoires.",
    createFailed: "Échec de la création du ticket. Réessayez.",
    catGeneral: "Général", catGeneralDesc: "Questions générales ou commentaires", catBug: "Rapport de bug",
    catBugDesc: "Quelque chose ne fonctionne pas correctement", catFeature: "Demande de fonctionnalité",
    catFeatureDesc: "Suggérez une nouvelle fonctionnalité ou une amélioration", catAccount: "Compte",
    catAccountDesc: "Problèmes avec votre compte ou profil", catBilling: "Facturation",
    catBillingDesc: "Paiements, factures ou abonnement", catOther: "Autre", catOtherDesc: "Autre chose",
    prioLow: "Basse", prioLowDesc: "Pas pressé", prioNormal: "Normale", prioNormalDesc: "Délai de réponse standard",
    prioHigh: "Haute", prioHighDesc: "Nécessite une attention rapide", prioUrgent: "Urgente", prioUrgentDesc: "Problème critique",
  },
  notifTexts: {
    "Sessions signed out": "Sessions déconnectées",
    "Signed in to your account": "Connexion à votre compte",
    "New login from {device}": "Nouvelle connexion depuis {device}",
    "All other sessions were signed out for your account.": "Toutes les autres sessions de votre compte ont été déconnectées.",
    "Session signed out": "Session déconnectée",
    "One of your sessions was signed out.": "L'une de vos sessions a été déconnectée.",
    "Two-step verification enabled": "Vérification en deux étapes activée",
    "Authenticator app two-factor is now active on your account.": "L'authentification à deux facteurs par application est désormais active sur votre compte.",
    "Two-step verification disabled": "Vérification en deux étapes désactivée",
    "Two-factor authentication was turned off for your account.": "L'authentification à deux facteurs a été désactivée sur votre compte.",
    "Recovery email verified": "E-mail de récupération vérifié",
    "recoveryEmailBody": "Votre e-mail de récupération ({email}) a été confirmé.",
  },
};

const de: Dict = {
  common: {
    loading: "Laden", saving: "Speichern...", saved: "Gespeichert", autoSaved: "Automatisch gespeichert",
    viewAll: "Alle ansehen", new: "Neu", close: "Schließen", cancel: "Abbrechen", save: "Speichern", delete: "Löschen",
    markRead: "Als gelesen markieren", loadMore: "Mehr laden", noNotifications: "Keine Benachrichtigungen", noTickets: "Keine Tickets",
    justNow: "Gerade eben", agoM: "vor {n} Min.", agoH: "vor {n} Std.", yesterday: "Gestern", total: "gesamt",
    unsavedWarn: "Sie haben ungespeicherte Änderungen – speichern Sie sie, bevor Sie diese Seite verlassen.",
  },
  nav: {
    workspace: "Arbeitsbereich", account: "Konto", support: "Support",
    getStarted: "Loslegen", inbox: "Posteingang", profile: "Profil", preferences: "Einstellungen",
    notifications: "Benachrichtigungen", connectedApps: "Verbundene Apps", security: "Sicherheit", privacy: "Datenschutz",
    sessions: "Sitzungen", history: "Verlauf", tickets: "Tickets",
  },
  header: {
    searchPlaceholder: "Suchen...", notifications: "Benachrichtigungen", switchToLight: "Zum hellen Modus wechseln",
    switchToDark: "Zum dunklen Modus wechseln", calendar: "Kalender", account: "Konto", signOut: "Abmelden", menu: "Menü", owner: "Inhaber", user: "Benutzer",
  },
  overview: {
    subtitle: "Ihr Dashboard auf einen Blick.",
    goodMorning: "Guten Morgen", goodAfternoon: "Guten Tag", goodEvening: "Guten Abend", goodNight: "Gute Nacht",
    welcomeBack: "Willkommen zurück",
    statUnread: "Ungelesen", statOpenTickets: "Offene Tickets", statTotalNotif: "Benachrichtigungen gesamt",
    quickTitle: "Schnellaktionen",
    qInbox: "Posteingang", qInboxDesc: "Nachrichten lesen", qProfile: "Profil", qProfileDesc: "Profil bearbeiten",
    qSecurity: "Sicherheit", qSecurityDesc: "2FA, Passwörter, Sitzungen", qSupport: "Support", qSupportDesc: "Ticket eröffnen",
    recentNotif: "Letzte Benachrichtigungen", recentTickets: "Letzte Tickets", allSections: "Alle Bereiche",
    sPrefs: "Einstellungen", sPrefsDesc: "Sprache, Zeitzone, Format", sNotif: "Benachrichtigungen", sNotifDesc: "Kanäle, Ruhezeiten, Zusammenfassung",
    sApps: "Verbundene Apps", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "Datenschutz", sPrivacyDesc: "Analysen, Datenexport",
    sSessions: "Sitzungen", sSessionsDesc: "Aktive Sitzungen verwalten", sHistory: "Verlauf", sHistoryDesc: "Aktivitätsprotokoll",
    openInbox: "Posteingang öffnen", openTickets: "Tickets öffnen", noNotifYet: "Noch keine Benachrichtigungen.", noTicketsYet: "Noch keine Tickets.",
  },
  prefs: {
    title: "Einstellungen", subtitle: "Passen Sie Ihre Erfahrung an.", general: "Allgemein",
    language: "Sprache", timezone: "Zeitzone", dateFormat: "Datumsformat", timeFormat: "Zeitformat",
    h12: "12 Stunden (AM/PM)", h24: "24 Stunden",
    timezoneUTC: "UTC", kathmandu: "Asien/Kathmandu (GMT+5:45)", eastern: "Eastern Time", central: "Central Time",
    mountain: "Mountain Time", pacific: "Pacific Time", london: "London", berlin: "Berlin", tokyo: "Tokio",
    shanghai: "Schanghai", kolkata: "Kolkata",
    emailTitle: "E-Mail-Einstellungen", emailDesc: "Verwalten Sie, welche E-Mails Sie von Tirbeo erhalten.",
    productEmails: "Produkt-E-Mails", productEmailsDesc: "Feature-Updates und Produktneuigkeiten.",
    weeklySummary: "Wochenzusammenfassung", weeklySummaryDesc: "Erhalten Sie einen wöchentlichen Überblick über Ihre Aktivität.",
    tipsUpdates: "Tipps & Updates", tipsUpdatesDesc: "Tipps, um das Beste aus Tirbeo herauszuholen.",
  },
  session: { expired: "Ihre Sitzung ist abgelaufen. Einige Funktionen funktionieren möglicherweise nicht.", signInAgain: "Erneut anmelden" },
  notif: {
    title: "Benachrichtigungen", subtitle: "Konfigurieren Sie, wie und wann Sie Benachrichtigungen erhalten.", retention: "Benachrichtigungen werden nach 30 Tagen automatisch gelöscht.", empty: "Keine Benachrichtigungen", total: "gesamt",
    channelsTitle: "Kanäle", channelsDesc: "Wählen Sie, wo Sie Benachrichtigungen erhalten möchten.",
    email: "E-Mail", push: "Push", inApp: "In-App",
    emailDesc: "Benachrichtigungen in Ihrem Posteingang.", pushDesc: "Browser-Push-Benachrichtigungen.", inAppDesc: "Innerhalb der App anzeigen.",
    browserBlocked: "Browser-Benachrichtigungen sind in Ihren Browsereinstellungen blockiert.",
    categoriesTitle: "Kategorien", categoriesDesc: "Wählen Sie, welche Kategorien Sie interessieren.",
    catSecurity: "Sicherheit", catSecurityDesc: "Anmeldungen, 2FA-Änderungen und Passwortaktivität.",
    catForms: "Formulare", catFormsDesc: "Formulareinreichungen und Antworten.",
    catProduct: "Produkt", catProductDesc: "Produktupdates und Ankündigungen.",
    catSupport: "Support", catSupportDesc: "Antworten auf Ihre Tickets und Support-Updates.",
    perCategory: "Kanäle pro Kategorie", perCategoryDesc: "Kanäle für jede Kategorie überschreiben.",
    colCategory: "Kategorie", colEmail: "E-Mail", colPush: "Push", colInApp: "In-App",
    quietTitle: "Ruhezeiten", quietDesc: "Keine Benachrichtigungen während dieser Stunden senden.",
    enableQuiet: "Ruhezeiten aktivieren", enableQuietDesc: "Benachrichtigungen während Ihres Zeitfensters stummschalten.",
    timeWindow: "Zeitfenster", timeWindowDesc: "Benachrichtigungen werden zwischen diesen Stunden pausiert.", to: "bis",
    quietActive: "Ruhezeiten sind aktiv.",
    digestTitle: "Tägliche Zusammenfassung", digestDesc: "Erhalten Sie eine Übersicht über alles, was Sie verpasst haben.",
    enableDigest: "Zusammenfassung aktivieren", enableDigestDesc: "Erhalten Sie eine Zusammenfassung statt Echtzeit-Alerts.",
    frequency: "Häufigkeit", frequencyDesc: "Wie oft Sie die Zusammenfassung erhalten möchten.",
    daily: "Täglich", weekly: "Wöchentlich", monthly: "Monatlich",
  },
  search: {
    placeholder: "Seiten, Einstellungen, Aktionen suchen...", pages: "Seiten", overview: "Übersicht",
    notificationsSettings: "Benachrichtigungseinstellungen", activityHistory: "Aktivitätsverlauf", supportTickets: "Support-Tickets", navigate: "Navigieren", open: "Öffnen", close: "Schließen",
  },
  calendar: {
    prevMonth: "Vorheriger Monat", nextMonth: "Nächster Monat", backToToday: "Zurück zu heute",
    today: "Heute", yesterday: "Gestern", tomorrow: "Morgen", daysAgo: "vor {n} Tagen", inDays: "in {n} Tagen",
    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  },
  inbox: {
    title: "Posteingang", descUnread: "{unread} ungelesen von {total}", descTotal: "{total} Nachrichten", markAllRead: "Alle als gelesen markieren", tabAll: "Alle", tabUnread: "Ungelesen", tabRead: "Gelesen",
    deselect: "Auswahl aufheben", selectAll: "Alle auswählen", select: "Auswählen", read: "Lesen",
    searchPlaceholder: "Benachrichtigungen durchsuchen...", noMatching: "Keine passenden Benachrichtigungen",
    noMatchingDesc: "Versuchen Sie eine andere Suche oder löschen Sie den Filter.", allCaughtUp: "Sie sind auf dem neuesten Stand",
    allCaughtUpDesc: "Keine ungelesenen Benachrichtigungen in diesem Ordner.", inboxEmpty: "Noch keine Benachrichtigungen",
    inboxEmptyDesc: "Benachrichtigungen von Tirbeo erscheinen hier.", loadMore: "Mehr laden", back: "Zurück", open: "Öffnen",
    noContent: "Kein Inhalt", viewDetails: "Details ansehen", selectMessage: "Wählen Sie eine Nachricht",
    selectMessageDesc: "Wählen Sie eine Nachricht aus der Liste, um sie hier zu lesen.",
    typeSecurity: "Sicherheit", typeForms: "Formulare", typeProduct: "Produkt", typeSupport: "Support", typeLogin: "Anmeldung", typeNotification: "Benachrichtigung", delete: "Löschen",
  },
  sessions: {
    title: "Sitzungen", subtitle: "Verwalten Sie, wo Sie angemeldet sind.", revokeAllOthers: "Alle anderen Sitzungen abmelden",
    noActive: "Keine aktiven Sitzungen", noActiveDesc: "Sie sind derzeit nirgendwo angemeldet.",
    currentDevice: "Dieses Gerät", current: "Aktuell", active: "Aktiv", unknownDevice: "Unbekanntes Gerät", unknownIp: "Unbekannte IP",
    revoke: "Abmelden", revokeAllTitle: "Alle anderen Sitzungen abmelden?",
    revokeAllDesc: "Alle anderen Sitzungen werden abgemeldet. Dieses Gerät bleibt angemeldet.",
    revokeSessionTitle: "Diese Sitzung abmelden?", revokeSessionDesc: "Dieses Gerät wird sofort abgemeldet.",
    revoking: "Abmelden...", unknown: "Unbekannt", unknownBrowser: "Unbekannter Browser", unknownOS: "Unbekanntes OS", local: "Lokal", lastActive: "Zuletzt aktiv", on: "auf",
  },
  apps: {
    title: "Verbundene Apps", subtitle: "Verbinden Sie Ihre Konten, um Integrationen freizuschalten.",
    available: "Verfügbare Apps", disconnect: "Trennen", connect: "Verbinden",
    googleDesc: "Synchronisieren Sie Kontakte, Kalender und Gmail.", githubDesc: "Synchronisieren Sie Repositorien und Aktivität.",
    discordDesc: "Erhalten Sie Benachrichtigungen in Discord.",
    connected: "Verbunden", notConnected: "Nicht verbunden", connectedOn: "Verbunden am",
    disconnectConfirm: "Anbieter trennen?",
    disconnectDesc: "Möchten Sie diesen Anbieter wirklich trennen? Sie können ihn später wieder verbinden.",
    mergeTitle: "Konten zusammenführen?",
    mergeDesc: "Die E-Mail dieses Anbieters ist bereits mit einem anderen Konto verknüpft. Das Zusammenführen überträgt den Anbieter auf Ihr aktuelles Konto.",
    mergeEmail: "E-Mail",
    mergeButton: "Konten zusammenführen",
    cancelButton: "Abbrechen",
    mergeSuccess: "Konten erfolgreich zusammengeführt!",
    mergeCancelled: "Zusammenführung abgebrochen.",
    noProviders: "Keine Anbieter konfiguriert.",
    providerEmail: "E-Mail",
  },
  security: {
    title: "Sicherheit", subtitle: "Schützen Sie Ihr Konto mit starker Sicherheit.",
    twoFactor: "Zwei-Faktor-Authentifizierung",
    twoFactorOn: "Die Zwei-Faktor-Authentifizierung ist für Ihr Konto aktiviert.",
    twoFactorOff: "Die Zwei-Faktor-Authentifizierung ist für Ihr Konto nicht aktiviert.",
    status: "Status", enabled: "Aktiviert", notEnabled: "Nicht aktiviert", disable2fa: "2FA deaktivieren", enable2fa: "2FA aktivieren",
    setupLoading: "2FA-Einrichtung wird geladen...", setupTitle: "Zwei-Faktor-Authentifizierung aktivieren",
    setupDesc: "Scannen Sie diesen QR-Code mit Ihrer Authenticator-App und geben Sie dann den Code unten ein.",
    key: "Schlüssel", code: "Code", copy: "Kopieren", enter6: "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein",
    verifyEnable: "2FA aktivieren", verifying: "Wird überprüft...", disableTitle: "Zwei-Faktor-Authentifizierung deaktivieren?",
    disableDesc: "Dadurch wird die 2FA sofort von Ihrem Konto entfernt.", disabling: "Wird deaktiviert...",
    backupTitle: "Backup-Codes", backupDesc: "Bewahren Sie diese Codes an einem sicheren Ort auf. Sie können sie zum Anmelden verwenden, falls Sie den Zugriff auf Ihren Authenticator verlieren.",
    copyAll: "Alle kopieren", done: "Fertig", copied: "Kopiert!", password: "Passwort", passwordLabel: "Aktuelles Passwort",
    changed: "Passwort erfolgreich geändert.", change: "Ändern", changeTitle: "Passwort ändern", changeDesc: "Geben Sie Ihr aktuelles und Ihr neues Passwort ein.",
    current: "Aktuelles Passwort", new: "Neues Passwort", confirm: "Neues Passwort bestätigen",
    currentPh: "Geben Sie Ihr aktuelles Passwort ein", newPh: "Geben Sie ein neues Passwort ein", confirmPh: "Geben Sie das neue Passwort erneut ein",
    changePassword: "Passwort ändern", pwdMismatch: "Die neuen Passwörter stimmen nicht überein.", failed: "Etwas ist schiefgelaufen. Versuchen Sie es erneut.",
    secondaryEmail: "Wiederherstellungs-E-Mail", secondaryDesc: "Verwenden Sie diese E-Mail, um Ihr Konto wiederherzustellen, falls Sie gesperrt werden.",
    noSecondaryEmail: "Keine Wiederherstellungs-E-Mail festgelegt", addEmail: "E-Mail hinzufügen", lastActive: "Zuletzt aktiv",
    changeEmail: "E-Mail ändern", verifyEmail: "E-Mail verifizieren", newEmailLabel: "Neue E-Mail", newEmailPh: "backup@example.com", sentTo: "Wir haben einen Code an {email} gesendet.",
    email: "E-Mail", verified: "Verifiziert", remove: "Entfernen", sendCode: "Code senden", sending: "Wird gesendet...",
    verify: "Verifizieren", enterCode: "Geben Sie den Code ein, der an Ihre E-Mail gesendet wurde", enterValidEmail: "Geben Sie eine gültige E-Mail-Adresse ein.",
    sendFailed: "Code konnte nicht gesendet werden. Versuchen Sie es erneut.", enterCodeErr: "Geben Sie den Code ein.", invalidCode: "Ungültiger Code. Versuchen Sie es erneut.",
    disable2faFailed: "2FA konnte nicht deaktiviert werden. Versuchen Sie es erneut.", activeSessions: "Aktive Sitzungen",
    noActiveSessions: "Keine aktiven Sitzungen.", unknownDevice: "Unbekanntes Gerät", loginHistory: "Anmeldeverlauf",
    noLoginHistory: "Keine kürzlichen Anmeldungen.", thStatus: "Status", thDate: "Datum", thMethod: "Methode",
    thIpDevice: "IP / Gerät", success: "Erfolgreich", failedStart: "Fehlgeschlagen",
  },
  privacy: {
    title: "Datenschutz", subtitle: "Kontrollieren Sie, wie Ihre Daten verwendet werden.",
    dataAnalytics: "Daten und Analysen", analytics: "Analysen", analyticsDesc: "Helfen Sie Tirbeo, sich zu verbessern, indem Sie Nutzungsdaten teilen.",
    crashReports: "Absturzberichte", crashReportsDesc: "Fehlerberichte automatisch senden, wenn etwas ausfällt.",
    personalizedRecs: "Personalisierte Empfehlungen", personalizedRecsDesc: "Aktivität verwenden, um Empfehlungen anzupassen.",
    discoverability: "Auffindbarkeit", discoverabilityDesc: "Kontrollieren Sie, wie andere Sie finden können.",
    searchEngine: "Suchmaschinen", searchEngineDesc: "Suchmaschinen erlauben, Ihr öffentliches Profil zu indexieren.",
    directory: "Verzeichnis", directoryDesc: "Ihr Profil im Tirbeo-Verzeichnis anzeigen.",
    dataExport: "Datenexport", dataExportDesc: "Laden Sie eine Kopie von allem herunter, was in Ihrem Konto gespeichert ist.",
    preparing: "Export wird vorbereitet...", exportData: "Daten exportieren",
    exportNote: "Sie erhalten einen Download-Link per E-Mail, sobald er bereit ist.",
    dangerZone: "Gefahrenzone", dangerZoneDesc: "Dauerhafte Aktionen, die nicht rückgängig gemacht werden können.",
    deleteAccount: "Konto löschen", irreversible: "Diese Aktion ist dauerhaft und unumkehrbar. Alle Daten werden gelöscht.",
    typeDelete: "Geben Sie 'delete' zur Bestätigung ein.", typeDeletePh: "Geben Sie delete zur Bestätigung ein", deleting: "Wird gelöscht...",
  },
  profile: {
    title: "Profil", subtitle: "Erzählen Sie anderen ein wenig über sich.", saveChanges: "Änderungen speichern", noNameSet: "Name nicht festgelegt",
    personal: "Persönliche Daten", work: "Arbeit", links: "Links", fullName: "Vollständiger Name", fullNamePh: "Ihr vollständiger Name",
    username: "Benutzername", usernamePh: "ihr-benutzername", bio: "Biografie", bioPh: "Erzählen Sie anderen, was Sie tun...",
    gender: "Geschlecht", selectOption: "Option auswählen", male: "Männlich", female: "Weiblich", other: "Andere", preferNot: "Keine Angabe",
    birthday: "Geburtstag", country: "Land", countryPh: "Wählen Sie Ihr Land", occupation: "Beruf",
    occupationPh: "z. B. Softwareentwickler", company: "Unternehmen", companyPh: "Ihr Unternehmen", role: "Rolle", rolePh: "Ihre Rolle",
    roleAtCompanyPh: "Ihre Rolle im Unternehmen", industry: "Branche", industryPh: "z. B. Technologie",
    companySize: "Unternehmensgröße", justMe: "Nur ich", website: "Website", websitePh: "https://deinewebsite.de", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/benutzername", github: "GitHub", githubPh: "github-benutzername", twitter: "Twitter / X", twitterPh: "@benutzername", accountInfo: "Kontoinformationen", email: "E-Mail",
    recoveryEmail: "Wiederherstellungs-E-Mail", memberSince: "Mitglied seit", lastActive: "Zuletzt aktiv",
    connectedAccounts: "Verbundene Konten", noneConnected: "Keine Konten verbunden.", verified: "Verifiziert", unverified: "Nicht verifiziert",
  },
  history: {
    title: "Aktivitätsverlauf", subtitle: "Ein Protokoll von Sicherheits- und Kontovorgängen.",
    noActivity: "Noch keine Aktivität", noActivityDesc: "Ihre Aktionen werden hier angezeigt.",
    act: {
      login: "Angemeldet", logout: "Abgemeldet", signup: "Konto erstellt", passwordChanged: "Passwort geändert",
      profileUpdated: "Profil aktualisiert", twofaEnabled: "2FA aktiviert", twofaDisabled: "2FA deaktiviert",
      sessionRevoked: "Sitzungen abgemeldet", emailVerified: "E-Mail verifiziert", accountDeleted: "Konto gelöscht",
      dataExported: "Daten exportiert", notificationRead: "Benachrichtigung gelesen", ticketCreated: "Ticket erstellt",
      ticketReplied: "Ticket beantwortet", ticketClosed: "Ticket geschlossen", unknown: "Aktivität",
    },
  },
  tickets: {
    title: "Tickets", countOne: "{n} Ticket", countMany: "{n} Tickets", newTicket: "Neues Ticket",
    noTickets: "Noch keine Tickets", noTicketsDesc: "Erstellen Sie ein Ticket, um Hilfe von unserem Support-Team zu erhalten.",
    createTicket: "Ticket erstellen", subject: "Betreff", subjectPh: "Kurze Beschreibung Ihres Problems",
    category: "Kategorie", priority: "Priorität", message: "Nachricht", messagePh: "Beschreiben Sie Ihr Problem im Detail...",
    describeIssue: "Beschreiben Sie Ihr Problem und wir melden uns bei Ihnen.", cancel: "Abbrechen", creating: "Wird erstellt...",
    catGeneral: "Allgemein", catBug: "Fehlerbericht", catFeature: "Funktionswunsch", catBilling: "Abrechnung",
    catOther: "Sonstiges", catAccount: "Konto", prioLow: "Niedrig", prioNormal: "Normal", prioHigh: "Hoch", prioUrgent: "Dringend",
    statusOpen: "Offen", statusClosed: "Geschlossen", statusInProgress: "In Bearbeitung", priorityLabel: "Priorität {priority}",
  },
  ticketDetail: {
    notFound: "Ticket nicht gefunden.", backToTickets: "Zurück zu Tickets",
    noMessages: "Noch keine Nachrichten. Starten Sie die Unterhaltung unten.", you: "Sie", support: "Support",
    supportTeam: "Support-Team", sendHint: "Enter zum Senden · Umschalt+Enter für neue Zeile",
    writeReply: "Antwort schreiben...", send: "Senden",
  },
  newTicket: {
    title: "Neues Ticket", subtitle: "Beschreiben Sie Ihr Problem und wir melden uns bei Ihnen.",
    backToTickets: "Zurück zu Tickets", subject: "Betreff", subjectPh: "Kurze Zusammenfassung Ihres Problems...",
    category: "Kategorie", priority: "Priorität", message: "Nachricht",
    messagePh: "Beschreiben Sie Ihr Problem im Detail. Fügen Sie Schritte zur Reproduktion hinzu, wenn es ein Fehler ist, oder Ihren Anwendungsfall bei einem Funktionswunsch...",
    countLabel: "{n} / 20.000", ctrlEnter: "⌘ + Eingabe zum Senden", cancel: "Abbrechen", creating: "Wird erstellt...",
    submitTicket: "Ticket senden", requiredError: "Betreff und Nachricht sind erforderlich.",
    createFailed: "Ticket konnte nicht erstellt werden. Versuchen Sie es erneut.",
    catGeneral: "Allgemein", catGeneralDesc: "Allgemeine Fragen oder Feedback", catBug: "Fehlerbericht",
    catBugDesc: "Etwas funktioniert nicht richtig", catFeature: "Funktionswunsch",
    catFeatureDesc: "Neue Funktion oder Verbesserung vorschlagen", catAccount: "Konto",
    catAccountDesc: "Probleme mit Ihrem Konto oder Profil", catBilling: "Abrechnung",
    catBillingDesc: "Zahlungen, Rechnungen oder Abonnement", catOther: "Sonstiges", catOtherDesc: "Etwas anderes",
    prioLow: "Niedrig", prioLowDesc: "Keine Eile", prioNormal: "Normal", prioNormalDesc: "Standard-Antwortzeit",
    prioHigh: "Hoch", prioHighDesc: "Benötigt bald Aufmerksamkeit", prioUrgent: "Dringend", prioUrgentDesc: "Kritisches Problem",
  },
  notifTexts: {
    "Sessions signed out": "Sitzungen abgemeldet",
    "Signed in to your account": "Bei Ihrem Konto angemeldet",
    "New login from {device}": "Neue Anmeldung von {device}",
    "All other sessions were signed out for your account.": "Alle anderen Sitzungen Ihres Kontos wurden abgemeldet.",
    "Session signed out": "Sitzung abgemeldet",
    "One of your sessions was signed out.": "Eine Ihrer Sitzungen wurde abgemeldet.",
    "Two-step verification enabled": "Zwei-Schritte-Verifizierung aktiviert",
    "Authenticator app two-factor is now active on your account.": "Die Zwei-Faktor-Authentifizierung über die Authenticator-App ist jetzt für Ihr Konto aktiv.",
    "Two-step verification disabled": "Zwei-Schritte-Verifizierung deaktiviert",
    "Two-factor authentication was turned off for your account.": "Die Zwei-Faktor-Authentifizierung wurde für Ihr Konto deaktiviert.",
    "Recovery email verified": "Wiederherstellungs-E-Mail verifiziert",
    "recoveryEmailBody": "Ihre Wiederherstellungs-E-Mail ({email}) wurde bestätigt.",
  },
};

const ja: Dict = {
  common: {
    loading: "読み込み中", saving: "保存中...", saved: "保存済み", autoSaved: "変更は自動保存されます",
    viewAll: "すべて見る", new: "新規", close: "閉じる", cancel: "キャンセル", save: "保存", delete: "削除",
    markRead: "既読にする", loadMore: "もっと読み込む", noNotifications: "通知はありません", noTickets: "チケットはありません",
    justNow: "たった今", agoM: "{n}分前", agoH: "{n}時間前", yesterday: "昨日", total: "合計",
    unsavedWarn: "未保存の変更があります。このページを離れる前に保存してください。",
  },
  nav: {
    workspace: "ワークスペース", account: "アカウント", support: "サポート",
    getStarted: "はじめに", inbox: "受信トレイ", profile: "プロフィール", preferences: "設定",
    notifications: "通知", connectedApps: "連携アプリ", security: "セキュリティ", privacy: "プライバシー",
    sessions: "セッション", history: "履歴", tickets: "チケット",
  },
  header: {
    searchPlaceholder: "検索...", notifications: "通知", switchToLight: "ライトモードに切り替え",
    switchToDark: "ダークモードに切り替え", calendar: "カレンダー", account: "アカウント", signOut: "サインアウト", menu: "メニュー", owner: "所有者", user: "ユーザー",
  },
  overview: {
    subtitle: "ダッシュボードをひと目で確認できます。",
    goodMorning: "おはようございます", goodAfternoon: "こんにちは", goodEvening: "こんばんは", goodNight: "おやすみなさい",
    welcomeBack: "おかえりなさい",
    statUnread: "未読", statOpenTickets: "未処理チケット", statTotalNotif: "通知の合計",
    quickTitle: "クイックアクション",
    qInbox: "受信トレイ", qInboxDesc: "メッセージを読む", qProfile: "プロフィール", qProfileDesc: "プロフィールを編集",
    qSecurity: "セキュリティ", qSecurityDesc: "2FA、パスワード、セッション", qSupport: "サポート", qSupportDesc: "チケットを開く",
    recentNotif: "最近の通知", recentTickets: "最近のチケット", allSections: "すべてのセクション",
    sPrefs: "設定", sPrefsDesc: "言語、タイムゾーン、形式", sNotif: "通知", sNotifDesc: "チャンネル、静音時間、ダイジェスト",
    sApps: "連携アプリ", sAppsDesc: "Google、GitHub、Discord", sPrivacy: "プライバシー", sPrivacyDesc: "分析、データエクスポート",
    sSessions: "セッション", sSessionsDesc: "アクティブなセッションを管理", sHistory: "履歴", sHistoryDesc: "アクティビティログ",
    openInbox: "受信トレイを開く", openTickets: "チケットを開く", noNotifYet: "通知はまだありません。", noTicketsYet: "チケットはまだありません。",
  },
  prefs: {
    title: "設定", subtitle: "エクスペリエンスをカスタマイズします。", general: "一般",
    language: "言語", timezone: "タイムゾーン", dateFormat: "日付形式", timeFormat: "時刻形式",
    h12: "12時間 (AM/PM)", h24: "24時間",
    timezoneUTC: "UTC", kathmandu: "アジア/カトマンズ (GMT+5:45)", eastern: "東部標準時", central: "中部標準時",
    mountain: "山岳部標準時", pacific: "太平洋標準時", london: "ロンドン", berlin: "ベルリン", tokyo: "東京",
    shanghai: "上海", kolkata: "コルカタ",
    emailTitle: "メール設定", emailDesc: "Tirbeoから受け取るメールを管理します。",
    productEmails: "製品メール", productEmailsDesc: "機能更新と製品ニュース。",
    weeklySummary: "週間サマリー", weeklySummaryDesc: "毎週のアクティビティダイジェストを受け取ります。",
    tipsUpdates: "ヒントと更新", tipsUpdatesDesc: "Tirbeoを最大限に活用するためのヒント。",
  },
  session: { expired: "セッションが期限切れになりました。一部の機能が動作しない場合があります。", signInAgain: "再サインイン" },
  notif: {
    title: "通知", subtitle: "通知を受け取る方法とタイミングを設定します。", retention: "通知は30日後に自動的に削除されます。", empty: "通知はありません", total: "合計",
    channelsTitle: "チャンネル", channelsDesc: "通知を受け取る場所を選択します。",
    email: "メール", push: "プッシュ", inApp: "アプリ内",
    emailDesc: "受信トレイで通知を受け取ります。", pushDesc: "ブラウザーのプッシュ通知。", inAppDesc: "アプリ内に表示します。",
    browserBlocked: "ブラウザー設定でブラウザー通知がブロックされています。",
    categoriesTitle: "カテゴリ", categoriesDesc: "関心のあるカテゴリを選択します。",
    catSecurity: "セキュリティ", catSecurityDesc: "サインイン、2FAの変更、パスワードのアクティビティ。",
    catForms: "フォーム", catFormsDesc: "フォームの送信と回答。",
    catProduct: "プロダクト", catProductDesc: "プロダクトのアップデートとお知らせ。",
    catSupport: "サポート", catSupportDesc: "チケットへの返信とサポートの更新。",
    perCategory: "カテゴリごとのチャンネル", perCategoryDesc: "各カテゴリのチャンネルを上書きします。",
    colCategory: "カテゴリ", colEmail: "メール", colPush: "プッシュ", colInApp: "アプリ内",
    quietTitle: "静音時間", quietDesc: "この時間帯は通知を送信しません。",
    enableQuiet: "静音時間を有効化", enableQuietDesc: "設定した時間帯は通知をミュートします。",
    timeWindow: "時間帯", timeWindowDesc: "この時間帯の間は通知が一時停止されます。", to: "〜",
    quietActive: "静音時間がオンです。",
    digestTitle: "デイリーダイジェスト", digestDesc: "見逃したすべての概要を受け取ります。",
    enableDigest: "ダイジェストを有効化", enableDigestDesc: "リアルタイムのアラートの代わりにダイジェストを受け取ります。",
    frequency: "頻度", frequencyDesc: "ダイジェストを受け取る頻度。",
    daily: "毎日", weekly: "毎週", monthly: "毎月",
  },
  search: {
    placeholder: "ページ、設定、操作を検索...", pages: "ページ", overview: "概要",
    notificationsSettings: "通知設定", activityHistory: "アクティビティ履歴", supportTickets: "サポートチケット", navigate: "移動", open: "開く", close: "閉じる",
  },
  calendar: {
    prevMonth: "前の月", nextMonth: "次の月", backToToday: "今日に戻る",
    today: "今日", yesterday: "昨日", tomorrow: "明日", daysAgo: "{n}日前", inDays: "{n}日後",
    months: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"],
  },
  inbox: {
    title: "受信トレイ", descUnread: "{total}件中{unread}件未読", descTotal: "{total}件のメッセージ", markAllRead: "すべて既読にする", tabAll: "すべて", tabUnread: "未読", tabRead: "既読",
    deselect: "選択解除", selectAll: "すべて選択", select: "選択", read: "既読",
    searchPlaceholder: "通知を検索...", noMatching: "一致する通知はありません",
    noMatchingDesc: "別の検索を試すか、フィルターをクリアしてください。", allCaughtUp: "すべて確認しました",
    allCaughtUpDesc: "このフォルダーに未読の通知はありません。", inboxEmpty: "まだ通知はありません",
    inboxEmptyDesc: "Tirbeoからの通知がここに表示されます。", loadMore: "もっと読み込む", back: "戻る", open: "開く",
    noContent: "コンテンツなし", viewDetails: "詳細を見る", selectMessage: "メッセージを選択",
    selectMessageDesc: "リストからメッセージを選んで、ここで読みましょう。",
    typeSecurity: "セキュリティ", typeForms: "フォーム", typeProduct: "プロダクト", typeSupport: "サポート", typeLogin: "ログイン", typeNotification: "通知", delete: "削除",
  },
  sessions: {
    title: "セッション", subtitle: "サインインしている場所を管理します。", revokeAllOthers: "他のすべてのセッションをサインアウト",
    noActive: "アクティブなセッションなし", noActiveDesc: "現在どこにもサインインしていません。",
    currentDevice: "このデバイス", current: "現在", active: "アクティブ", unknownDevice: "不明なデバイス", unknownIp: "不明なIP",
    revoke: "サインアウト", revokeAllTitle: "他のすべてのセッションをサインアウトしますか？",
    revokeAllDesc: "他のすべてのセッションがサインアウトされます。このデバイスはサインインしたままです。",
    revokeSessionTitle: "このセッションをサインアウトしますか？", revokeSessionDesc: "このデバイスは直ちにサインアウトされます。",
    revoking: "サインアウト中...", unknown: "不明", unknownBrowser: "不明なブラウザー", unknownOS: "不明なOS", local: "ローカル", lastActive: "最終アクティビティ", on: "上で",
  },
  apps: {
    title: "連携アプリ", subtitle: "アカウントを連携して統合を有効にします。",
    available: "利用可能なアプリ", disconnect: "連携解除", connect: "連携",
    googleDesc: "連絡先、カレンダー、Gmailを同期します。", githubDesc: "リポジトリとアクティビティを同期します。",
    discordDesc: "Discordで通知を受け取ります。",
    connected: "接続済み", notConnected: "未接続", connectedOn: "接続日",
    disconnectConfirm: "プロバイダーを切断しますか？",
    disconnectDesc: "このプロバイダーを切断してもよろしいですか？後で再接続できます。",
    mergeTitle: "アカウントを統合しますか？",
    mergeDesc: "このプロバイダーのメールは既に別のアカウントにリンクされています。統合すると、現在のアカウントにプロバイダーが移動します。",
    mergeEmail: "メール",
    mergeButton: "アカウントを統合",
    cancelButton: "キャンセル",
    mergeSuccess: "アカウントの統合が完了しました！",
    mergeCancelled: "統合がキャンセルされました。",
    noProviders: "プロバイダーが設定されていません。",
    providerEmail: "メール",
  },
  security: {
    title: "セキュリティ", subtitle: "強力なセキュリティでアカウントを保護します。",
    twoFactor: "2段階認証",
    twoFactorOn: "お使いのアカウントで2段階認証が有効になっています。",
    twoFactorOff: "お使いのアカウントで2段階認証は有効になっていません。",
    status: "ステータス", enabled: "有効", notEnabled: "無効", disable2fa: "2FAを無効化", enable2fa: "2FAを有効化",
    setupLoading: "2FAの設定を読み込んでいます...", setupTitle: "2段階認証を有効化",
    setupDesc: "このQRコードを認証アプリでスキャンし、下のコードを入力してください。",
    key: "キー", code: "コード", copy: "コピー", enter6: "認証アプリの6桁のコードを入力してください",
    verifyEnable: "2FAを有効化", verifying: "確認中...", disableTitle: "2段階認証を無効化しますか？",
    disableDesc: "アカウントから2FAが直ちに削除されます。", disabling: "無効化中...",
    backupTitle: "バックアップコード", backupDesc: "これらのコードは安全な場所に保存してください。認証アプリにアクセスできなくなった場合のサインインに使用できます。",
    copyAll: "すべてコピー", done: "完了", copied: "コピーしました！", password: "パスワード", passwordLabel: "現在のパスワード",
    changed: "パスワードを変更しました。", change: "変更", changeTitle: "パスワードを変更", changeDesc: "現在のパスワードと新しいパスワードを入力してください。",
    current: "現在のパスワード", new: "新しいパスワード", confirm: "新しいパスワードを確認",
    currentPh: "現在のパスワードを入力", newPh: "新しいパスワードを入力", confirmPh: "新しいパスワードを再入力",
    changePassword: "パスワードを変更", pwdMismatch: "新しいパスワードが一致しません。", failed: "問題が発生しました。もう一度お試しください。",
    secondaryEmail: "回復用メール", secondaryDesc: "ロックアウトされた場合にアカウントを回復するために使用します。",
    noSecondaryEmail: "回復用メールが設定されていません", addEmail: "メールを追加", lastActive: "最終アクティビティ",
    changeEmail: "メールを変更", verifyEmail: "メールを確認", newEmailLabel: "新しいメール", newEmailPh: "backup@example.com", sentTo: "{email} にコードを送信しました。",
    email: "メール", verified: "確認済み", remove: "削除", sendCode: "コードを送信", sending: "送信中...",
    verify: "確認", enterCode: "メールに送信されたコードを入力してください", enterValidEmail: "有効なメールアドレスを入力してください。",
    sendFailed: "コードを送信できませんでした。もう一度お試しください。", enterCodeErr: "コードを入力してください。", invalidCode: "コードが無効です。もう一度お試しください。",
    disable2faFailed: "2FAを無効化できませんでした。もう一度お試しください。", activeSessions: "アクティブなセッション",
    noActiveSessions: "アクティブなセッションはありません。", unknownDevice: "不明なデバイス", loginHistory: "ログイン履歴",
    noLoginHistory: "最近のログインはありません。", thStatus: "ステータス", thDate: "日付", thMethod: "方法",
    thIpDevice: "IP / デバイス", success: "成功", failedStart: "失敗",
  },
  privacy: {
    title: "プライバシー", subtitle: "データの使用方法を管理します。",
    dataAnalytics: "データと分析", analytics: "分析", analyticsDesc: "利用状況データを共有してTirbeoの改善に協力します。",
    crashReports: "クラッシュレポート", crashReportsDesc: "問題が発生したときにエラーレポートを自動送信します。",
    personalizedRecs: "パーソナライズされたおすすめ", personalizedRecsDesc: "アクティビティを使用しておすすめを調整します。",
    discoverability: "発見可能性", discoverabilityDesc: "他の人があなたを見つける方法を管理します。",
    searchEngine: "検索エンジン", searchEngineDesc: "検索エンジンがあなたの公開プロフィールをインデックスすることを許可します。",
    directory: "ディレクトリ", directoryDesc: "Tirbeoのディレクトリにプロフィールを表示します。",
    dataExport: "データのエクスポート", dataExportDesc: "アカウントに保存されているすべてのコピーをダウンロードします。",
    preparing: "エクスポートを準備中...", exportData: "データをエクスポート",
    exportNote: "準備ができるとダウンロードリンクをメールでお送りします。",
    dangerZone: "危険ゾーン", dangerZoneDesc: "元に戻せない恒久的な操作です。",
    deleteAccount: "アカウントを削除", irreversible: "この操作は恒久的で元に戻せません。すべてのデータが削除されます。",
    typeDelete: "確認のため「delete」と入力してください。", typeDeletePh: "確認のためdeleteと入力", deleting: "削除中...",
  },
  profile: {
    title: "プロフィール", subtitle: "あなたについて少し伝えましょう。", saveChanges: "変更を保存", noNameSet: "名前が設定されていません",
    personal: "個人情報", work: "仕事", links: "リンク", fullName: "氏名", fullNamePh: "あなたの氏名",
    username: "ユーザー名", usernamePh: "あなたのユーザー名", bio: "自己紹介", bioPh: "あなたのことを伝えましょう...",
    gender: "性別", selectOption: "選択してください", male: "男性", female: "女性", other: "その他", preferNot: "回答しない",
    birthday: "生年月日", country: "国", countryPh: "国を選択", occupation: "職業",
    occupationPh: "例：ソフトウェアエンジニア", company: "会社", companyPh: "あなたの会社", role: "役割", rolePh: "あなたの役割",
    roleAtCompanyPh: "会社での役割", industry: "業界", industryPh: "例：テクノロジー",
    companySize: "会社の規模", justMe: "個人のみ", website: "ウェブサイト", websitePh: "https://yoursite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/username", github: "GitHub", githubPh: "github ユーザー名", twitter: "Twitter / X", twitterPh: "@ユーザー名", accountInfo: "アカウント情報", email: "メール",
    recoveryEmail: "回復用メール", memberSince: "登録日", lastActive: "最終アクティブ",
    connectedAccounts: "連携アカウント", noneConnected: "連携されたアカウントはありません。", verified: "確認済み", unverified: "未確認",
  },
  history: {
    title: "アクティビティ履歴", subtitle: "セキュリティとアカウントのイベントの記録です。",
    noActivity: "まだアクティビティはありません", noActivityDesc: "実行した操作がここに表示されます。",
    act: {
      login: "サインイン", logout: "サインアウト", signup: "アカウント作成", passwordChanged: "パスワード変更",
      profileUpdated: "プロフィール更新", twofaEnabled: "2FA有効化", twofaDisabled: "2FA無効化",
      sessionRevoked: "セッションのサインアウト", emailVerified: "メール確認", accountDeleted: "アカウント削除",
      dataExported: "データエクスポート", notificationRead: "通知を既読", ticketCreated: "チケット作成",
      ticketReplied: "チケット返信", ticketClosed: "チケット終了", unknown: "アクティビティ",
    },
  },
  tickets: {
    title: "チケット", countOne: "{n}件のチケット", countMany: "{n}件のチケット", newTicket: "新しいチケット",
    noTickets: "まだチケットはありません", noTicketsDesc: "チケットを作成してサポートチームの支援を受けましょう。",
    createTicket: "チケットを作成", subject: "件名", subjectPh: "問題の簡単な説明",
    category: "カテゴリ", priority: "優先度", message: "メッセージ", messagePh: "問題を詳しく説明してください...",
    describeIssue: "問題を説明してください。折り返しご連絡します。", cancel: "キャンセル", creating: "作成中...",
    catGeneral: "一般", catBug: "バグ報告", catFeature: "機能リクエスト", catBilling: "請求",
    catOther: "その他", catAccount: "アカウント", prioLow: "低", prioNormal: "通常", prioHigh: "高", prioUrgent: "緊急",
    statusOpen: "開いています", statusClosed: "終了", statusInProgress: "進行中", priorityLabel: "優先度 {priority}",
  },
  ticketDetail: {
    notFound: "チケットが見つかりません。", backToTickets: "チケットに戻る",
    noMessages: "まだメッセージはありません。下から会話を始めましょう。", you: "あなた", support: "サポート",
    supportTeam: "サポートチーム", sendHint: "Enter で送信 · Shift+Enter で改行",
    writeReply: "返信を入力...", send: "送信",
  },
  newTicket: {
    title: "新しいチケット", subtitle: "問題を説明してください。折り返しご連絡します。",
    backToTickets: "チケットに戻る", subject: "件名", subjectPh: "問題の簡単な要約...",
    category: "カテゴリ", priority: "優先度", message: "メッセージ",
    messagePh: "問題を詳しく説明してください。バグの場合は再現手順、機能リクエストの場合はユースケースを記載してください...",
    countLabel: "{n} / 20,000", ctrlEnter: "⌘ + Enterで送信", cancel: "キャンセル", creating: "作成中...",
    submitTicket: "チケットを送信", requiredError: "件名とメッセージは必須です。",
    createFailed: "チケットを作成できませんでした。もう一度お試しください。",
    catGeneral: "一般", catGeneralDesc: "一般的な質問やフィードバック", catBug: "バグ報告",
    catBugDesc: "何かが正しく動作していません", catFeature: "機能リクエスト",
    catFeatureDesc: "新しい機能や改善を提案", catAccount: "アカウント",
    catAccountDesc: "アカウントやプロフィールの問題", catBilling: "請求",
    catBillingDesc: "支払い、請求書、サブスクリプション", catOther: "その他", catOtherDesc: "その他の事項",
    prioLow: "低", prioLowDesc: "急ぎません", prioNormal: "通常", prioNormalDesc: "標準的な応答時間",
    prioHigh: "高", prioHighDesc: "早めの対応が必要", prioUrgent: "緊急", prioUrgentDesc: "重大な問題",
  },
  notifTexts: {
    "Sessions signed out": "セッションのサインアウト",
    "Signed in to your account": "アカウントにログインしました",
    "New login from {device}": "{device} から新しくログインしました",
    "All other sessions were signed out for your account.": "お使いのアカウントの他のすべてのセッションがサインアウトされました。",
    "Session signed out": "セッションのサインアウト",
    "One of your sessions was signed out.": "いずれかのセッションがサインアウトされました。",
    "Two-step verification enabled": "2段階認証が有効になりました",
    "Authenticator app two-factor is now active on your account.": "お使いのアカウントで認証アプリによる2段階認証が有効になりました。",
    "Two-step verification disabled": "2段階認証が無効になりました",
    "Two-factor authentication was turned off for your account.": "お使いのアカウントの2段階認証が無効になりました。",
    "Recovery email verified": "回復用メールを確認しました",
    "recoveryEmailBody": "回復用メール({email})が確認されました。",
  },
};

const ko: Dict = {
  common: {
    loading: "로딩 중", saving: "저장 중...", saved: "저장됨", autoSaved: "변경사항이 자동 저장됩니다",
    viewAll: "모두 보기", new: "새로 만들기", close: "닫기", cancel: "취소", save: "저장", delete: "삭제",
    markRead: "읽음 표시", loadMore: "더 보기", noNotifications: "알림 없음", noTickets: "티켓 없음",
    justNow: "방금 전", agoM: "{n}분 전", agoH: "{n}시간 전", yesterday: "어제", total: "총",
    unsavedWarn: "저장하지 않은 변경 사항이 있습니다. 이 페이지를 떠나기 전에 저장하세요.",
  },
  nav: {
    workspace: "워크스페이스", account: "계정", support: "지원",
    getStarted: "시작하기", inbox: "받은편지함", profile: "프로필", preferences: "환경설정",
    notifications: "알림", connectedApps: "연결된 앱", security: "보안", privacy: "개인정보",
    sessions: "세션", history: "기록", tickets: "티켓",
  },
  header: {
    searchPlaceholder: "검색...", notifications: "알림", switchToLight: "라이트 모드로 전환",
    switchToDark: "다크 모드로 전환", calendar: "달력", account: "계정", signOut: "로그아웃", menu: "메뉴", owner: "소유자", user: "사용자",
  },
  overview: {
    subtitle: "대시보드를 한눈에 확인하세요.",
    goodMorning: "좋은 아침", goodAfternoon: "좋은 오후", goodEvening: "좋은 저녁", goodNight: "좋은 밤",
    welcomeBack: "다시 오신 것을 환영합니다",
    statUnread: "읽지 않음", statOpenTickets: "열린 티켓", statTotalNotif: "전체 알림",
    quickTitle: "빠른 작업",
    qInbox: "받은편지함", qInboxDesc: "메시지 읽기", qProfile: "프로필", qProfileDesc: "프로필 수정",
    qSecurity: "보안", qSecurityDesc: "2FA, 비밀번호, 세션", qSupport: "지원", qSupportDesc: "티켓 열기",
    recentNotif: "최근 알림", recentTickets: "최근 티켓", allSections: "모든 섹션",
    sPrefs: "환경설정", sPrefsDesc: "언어, 시간대, 형식", sNotif: "알림", sNotifDesc: "채널, 방해금지 시간, 요약",
    sApps: "연결된 앱", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "개인정보", sPrivacyDesc: "분석, 데이터 내보내기",
    sSessions: "세션", sSessionsDesc: "활성 세션 관리", sHistory: "기록", sHistoryDesc: "활동 기록",
    openInbox: "받은편지함 열기", openTickets: "티켓 열기", noNotifYet: "아직 알림이 없습니다.", noTicketsYet: "아직 티켓이 없습니다.",
  },
  prefs: {
    title: "환경설정", subtitle: "환경을 맞춤화하세요.", general: "일반",
    language: "언어", timezone: "시간대", dateFormat: "날짜 형식", timeFormat: "시간 형식",
    h12: "12시간 (오전/오후)", h24: "24시간",
    timezoneUTC: "UTC", kathmandu: "아시아/카트만두 (GMT+5:45)", eastern: "동부 표준시", central: "중부 표준시",
    mountain: "산악 표준시", pacific: "태평양 표준시", london: "런던", berlin: "베를린", tokyo: "도쿄",
    shanghai: "상하이", kolkata: "콜카타",
    emailTitle: "이메일 환경설정", emailDesc: "Tirbeo에서 받는 이메일을 관리하세요.",
    productEmails: "제품 이메일", productEmailsDesc: "기능 업데이트 및 제품 소식.",
    weeklySummary: "주간 요약", weeklySummaryDesc: "주간 활동 요약을 받아보세요.",
    tipsUpdates: "팁 및 업데이트", tipsUpdatesDesc: "Tirbeo를 최대한 활용하는 팁.",
  },
  session: { expired: "세션이 만료되었습니다. 일부 기능이 작동하지 않을 수 있습니다.", signInAgain: "다시 로그인" },
  notif: {
    title: "알림", subtitle: "알림을 받을 방법과 시기를 구성하세요.", retention: "알림은 30일 후 자동으로 삭제됩니다.", empty: "알림 없음", total: "총",
    channelsTitle: "채널", channelsDesc: "알림을 받을 위치를 선택하세요.",
    email: "이메일", push: "푸시", inApp: "앱 내",
    emailDesc: "받은편지함에서 알림을 받습니다.", pushDesc: "브라우저 푸시 알림.", inAppDesc: "앱 내부에 표시합니다.",
    browserBlocked: "브라우저 설정에서 브라우저 알림이 차단되어 있습니다.",
    categoriesTitle: "카테고리", categoriesDesc: "관심 있는 카테고리를 선택하세요.",
    catSecurity: "보안", catSecurityDesc: "로그인, 2FA 변경, 비밀번호 활동.",
    catForms: "양식", catFormsDesc: "양식 제출 및 응답.",
    catProduct: "제품", catProductDesc: "제품 업데이트 및 공지.",
    catSupport: "지원", catSupportDesc: "티켓에 대한 답변과 지원 업데이트.",
    perCategory: "카테고리별 채널", perCategoryDesc: "각 카테고리의 채널을 재정의합니다.",
    colCategory: "카테고리", colEmail: "이메일", colPush: "푸시", colInApp: "앱 내",
    quietTitle: "방해금지 시간", quietDesc: "이 시간에는 알림을 보내지 않습니다.",
    enableQuiet: "방해금지 시간 활성화", enableQuietDesc: "설정한 시간 동안 알림을 음소거합니다.",
    timeWindow: "시간 범위", timeWindowDesc: "이 시간 사이에는 알림이 일시 중지됩니다.", to: "부터",
    quietActive: "방해금지 시간이 켜져 있습니다.",
    digestTitle: "일일 요약", digestDesc: "놓친 모든 것의 요약을 받아보세요.",
    enableDigest: "요약 활성화", enableDigestDesc: "실시간 알림 대신 요약을 받습니다.",
    frequency: "빈도", frequencyDesc: "요약을 받을 빈도.",
    daily: "매일", weekly: "매주", monthly: "매월",
  },
  search: {
    placeholder: "페이지, 설정, 작업 검색...", pages: "페이지", overview: "개요",
    notificationsSettings: "알림 설정", activityHistory: "활동 기록", supportTickets: "지원 티켓", navigate: "이동", open: "열기", close: "닫기",
  },
  calendar: {
    prevMonth: "이전 달", nextMonth: "다음 달", backToToday: "오늘로 돌아가기",
    today: "오늘", yesterday: "어제", tomorrow: "내일", daysAgo: "{n}일 전", inDays: "{n}일 후",
    months: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
  },
  inbox: {
    title: "받은편지함", descUnread: "총 {total}개 중 {unread}개 읽지 않음", descTotal: "메시지 {total}개", markAllRead: "모두 읽음 표시", tabAll: "전체", tabUnread: "읽지 않음", tabRead: "읽음",
    deselect: "선택 해제", selectAll: "전체 선택", select: "선택", read: "읽음",
    searchPlaceholder: "알림 검색...", noMatching: "일치하는 알림이 없습니다",
    noMatchingDesc: "다른 검색어를 시도하거나 필터를 지우세요.", allCaughtUp: "모두 확인했습니다",
    allCaughtUpDesc: "이 폴더에 읽지 않은 알림이 없습니다.", inboxEmpty: "아직 알림이 없습니다",
    inboxEmptyDesc: "Tirbeo의 알림이 여기에 표시됩니다.", loadMore: "더 보기", back: "뒤로", open: "열기",
    noContent: "내용 없음", viewDetails: "세부정보 보기", selectMessage: "메시지 선택",
    selectMessageDesc: "목록에서 메시지를 선택하여 여기에서 읽으세요.",
    typeSecurity: "보안", typeForms: "양식", typeProduct: "제품", typeSupport: "지원", typeLogin: "로그인", typeNotification: "알림", delete: "삭제",
  },
  sessions: {
    title: "세션", subtitle: "로그인한 위치를 관리하세요.", revokeAllOthers: "다른 모든 세션 로그아웃",
    noActive: "활성 세션 없음", noActiveDesc: "현재 어디에도 로그인되어 있지 않습니다.",
    currentDevice: "이 기기", current: "현재", active: "활성", unknownDevice: "알 수 없는 기기", unknownIp: "알 수 없는 IP",
    revoke: "로그아웃", revokeAllTitle: "다른 모든 세션을 로그아웃할까요?",
    revokeAllDesc: "다른 모든 세션이 로그아웃됩니다. 이 기기는 계속 로그인 상태입니다.",
    revokeSessionTitle: "이 세션을 로그아웃할까요?", revokeSessionDesc: "이 기기가 즉시 로그아웃됩니다.",
    revoking: "로그아웃 중...", unknown: "알 수 없음", unknownBrowser: "알 수 없는 브라우저", unknownOS: "알 수 없는 OS", local: "로컬", lastActive: "마지막 활동", on: "에서",
  },
  apps: {
    title: "연결된 앱", subtitle: "계정을 연결하여 통합 기능을 사용하세요.",
    available: "사용 가능한 앱", disconnect: "연결 해제", connect: "연결",
    googleDesc: "연락처, 캘린더, Gmail을 동기화합니다.", githubDesc: "저장소와 활동을 동기화합니다.",
    discordDesc: "Discord에서 알림을 받습니다.",
    connected: "연결됨", notConnected: "연결 안 됨", connectedOn: "연결일",
    disconnectConfirm: "공급자를 연결 해제하시겠습니까?",
    disconnectDesc: "이 공급자의 연결을 해제하시겠습니까? 나중에 다시 연결할 수 있습니다.",
    mergeTitle: "계정을 병합하시겠습니까?",
    mergeDesc: "이 공급자의 이메일이 이미 다른 계정에 연결되어 있습니다. 병합하면 현재 계정으로 공급자가 이동합니다.",
    mergeEmail: "이메일",
    mergeButton: "계정 병합",
    cancelButton: "취소",
    mergeSuccess: "계정이 성공적으로 병합되었습니다!",
    mergeCancelled: "병합이 취소되었습니다.",
    noProviders: "구성된 공급자가 없습니다.",
    providerEmail: "이메일",
  },
  security: {
    title: "보안", subtitle: "강력한 보안으로 계정을 보호하세요.",
    twoFactor: "2단계 인증",
    twoFactorOn: "계정에 2단계 인증이 활성화되어 있습니다.",
    twoFactorOff: "계정에 2단계 인증이 활성화되어 있지 않습니다.",
    status: "상태", enabled: "활성화됨", notEnabled: "비활성화됨", disable2fa: "2FA 비활성화", enable2fa: "2FA 활성화",
    setupLoading: "2FA 설정을 불러오는 중...", setupTitle: "2단계 인증 활성화",
    setupDesc: "인증 앱으로 이 QR 코드를 스캔한 후 아래 코드를 입력하세요.",
    key: "키", code: "코드", copy: "복사", enter6: "인증 앱의 6자리 코드를 입력하세요",
    verifyEnable: "2FA 활성화", verifying: "확인 중...", disableTitle: "2단계 인증을 비활성화할까요?",
    disableDesc: "계정에서 2FA가 즉시 제거됩니다.", disabling: "비활성화 중...",
    backupTitle: "백업 코드", backupDesc: "이 코드를 안전한 곳에 보관하세요. 인증 앱에 접근할 수 없을 때 로그인에 사용할 수 있습니다.",
    copyAll: "모두 복사", done: "완료", copied: "복사되었습니다!", password: "비밀번호", passwordLabel: "현재 비밀번호",
    changed: "비밀번호가 변경되었습니다.", change: "변경", changeTitle: "비밀번호 변경", changeDesc: "현재 비밀번호와 새 비밀번호를 입력하세요.",
    current: "현재 비밀번호", new: "새 비밀번호", confirm: "새 비밀번호 확인",
    currentPh: "현재 비밀번호를 입력하세요", newPh: "새 비밀번호를 입력하세요", confirmPh: "새 비밀번호를 다시 입력하세요",
    changePassword: "비밀번호 변경", pwdMismatch: "새 비밀번호가 일치하지 않습니다.", failed: "문제가 발생했습니다. 다시 시도하세요.",
    secondaryEmail: "복구 이메일", secondaryDesc: "잠긴 경우 계정을 복구하는 데 사용하는 이메일입니다.",
    noSecondaryEmail: "복구 이메일이 설정되지 않음", addEmail: "이메일 추가", lastActive: "마지막 활동",
    changeEmail: "이메일 변경", verifyEmail: "이메일 확인", newEmailLabel: "새 이메일", newEmailPh: "backup@example.com", sentTo: "{email}로 코드를 보냈습니다.",
    email: "이메일", verified: "확인됨", remove: "제거", sendCode: "코드 보내기", sending: "보내는 중...",
    verify: "확인", enterCode: "이메일로 전송된 코드를 입력하세요", enterValidEmail: "유효한 이메일 주소를 입력하세요.",
    sendFailed: "코드를 보내지 못했습니다. 다시 시도하세요.", enterCodeErr: "코드를 입력하세요.", invalidCode: "잘못된 코드입니다. 다시 시도하세요.",
    disable2faFailed: "2FA를 비활성화하지 못했습니다. 다시 시도하세요.", activeSessions: "활성 세션",
    noActiveSessions: "활성 세션이 없습니다.", unknownDevice: "알 수 없는 기기", loginHistory: "로그인 기록",
    noLoginHistory: "최근 로그인이 없습니다.", thStatus: "상태", thDate: "날짜", thMethod: "방법",
    thIpDevice: "IP / 기기", success: "성공", failedStart: "실패",
  },
  privacy: {
    title: "개인정보", subtitle: "데이터 사용 방식을 관리하세요.",
    dataAnalytics: "데이터 및 분석", analytics: "분석", analyticsDesc: "사용 데이터를 공유하여 Tirbeo 개선에 도움을 주세요.",
    crashReports: "충돌 보고서", crashReportsDesc: "문제 발생 시 오류 보고서를 자동으로 보냅니다.",
    personalizedRecs: "맞춤 추천", personalizedRecsDesc: "활동을 사용하여 추천을 조정합니다.",
    discoverability: "검색 가능성", discoverabilityDesc: "다른 사람이 당신을 찾는 방식을 관리하세요.",
    searchEngine: "검색 엔진", searchEngineDesc: "검색 엔진이 공개 프로필을 색인하도록 허용합니다.",
    directory: "디렉터리", directoryDesc: "Tirbeo 디렉터리에 프로필을 표시합니다.",
    dataExport: "데이터 내보내기", dataExportDesc: "계정에 저장된 모든 데이터의 사본을 다운로드합니다.",
    preparing: "내보내기 준비 중...", exportData: "데이터 내보내기",
    exportNote: "준비되면 다운로드 링크를 이메일로 보내드립니다.",
    dangerZone: "위험 구역", dangerZoneDesc: "되돌릴 수 없는 영구 작업입니다.",
    deleteAccount: "계정 삭제", irreversible: "이 작업은 영구적이며 되돌릴 수 없습니다. 모든 데이터가 삭제됩니다.",
    typeDelete: "확인하려면 'delete'를 입력하세요.", typeDeletePh: "확인을 위해 delete 입력", deleting: "삭제 중...",
  },
  profile: {
    title: "프로필", subtitle: "다른 사람에게 자신을 소개하세요.", saveChanges: "변경사항 저장", noNameSet: "이름이 설정되지 않음",
    personal: "개인 정보", work: "직장", links: "링크", fullName: "전체 이름", fullNamePh: "당신의 전체 이름",
    username: "사용자 이름", usernamePh: "당신의-사용자이름", bio: "소개", bioPh: "당신이 하는 일을 알려주세요...",
    gender: "성별", selectOption: "옵션 선택", male: "남성", female: "여성", other: "기타", preferNot: "말하고 싶지 않음",
    birthday: "생일", country: "국가", countryPh: "국가 선택", occupation: "직업",
    occupationPh: "예: 소프트웨어 엔지니어", company: "회사", companyPh: "당신의 회사", role: "역할", rolePh: "당신의 역할",
    roleAtCompanyPh: "회사에서의 역할", industry: "업계", industryPh: "예: 기술",
    companySize: "회사 규모", justMe: "나만", website: "웹사이트", websitePh: "https://yoursite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/username", github: "GitHub", githubPh: "github 사용자명", twitter: "Twitter / X", twitterPh: "@사용자명", accountInfo: "계정 정보", email: "이메일",
    recoveryEmail: "복구 이메일", memberSince: "가입일", lastActive: "마지막 활동",
    connectedAccounts: "연결된 계정", noneConnected: "연결된 계정이 없습니다.", verified: "확인됨", unverified: "미확인",
  },
  history: {
    title: "활동 기록", subtitle: "보안 및 계정 이벤트 기록입니다.",
    noActivity: "아직 활동이 없습니다", noActivityDesc: "수행한 작업이 여기에 표시됩니다.",
    act: {
      login: "로그인", logout: "로그아웃", signup: "계정 생성", passwordChanged: "비밀번호 변경",
      profileUpdated: "프로필 업데이트", twofaEnabled: "2FA 활성화", twofaDisabled: "2FA 비활성화",
      sessionRevoked: "세션 로그아웃", emailVerified: "이메일 확인", accountDeleted: "계정 삭제",
      dataExported: "데이터 내보내기", notificationRead: "알림 읽음", ticketCreated: "티켓 생성",
      ticketReplied: "티켓 답변", ticketClosed: "티켓 종료", unknown: "활동",
    },
  },
  tickets: {
    title: "티켓", countOne: "티켓 {n}개", countMany: "티켓 {n}개", newTicket: "새 티켓",
    noTickets: "아직 티켓이 없습니다", noTicketsDesc: "티켓을 만들어 지원팀의 도움을 받으세요.",
    createTicket: "티켓 만들기", subject: "제목", subjectPh: "문제에 대한 간단한 설명",
    category: "카테고리", priority: "우선순위", message: "메시지", messagePh: "문제를 자세히 설명하세요...",
    describeIssue: "문제를 설명해 주시면 답변드리겠습니다.", cancel: "취소", creating: "만드는 중...",
    catGeneral: "일반", catBug: "버그 보고", catFeature: "기능 요청", catBilling: "결제",
    catOther: "기타", catAccount: "계정", prioLow: "낮음", prioNormal: "보통", prioHigh: "높음", prioUrgent: "긴급",
    statusOpen: "열림", statusClosed: "닫힘", statusInProgress: "진행 중", priorityLabel: "{priority} 우선순위",
  },
  ticketDetail: {
    notFound: "티켓을 찾을 수 없습니다.", backToTickets: "티켓으로 돌아가기",
    noMessages: "아직 메시지가 없습니다. 아래에서 대화를 시작하세요.", you: "나", support: "지원",
    supportTeam: "지원팀", sendHint: "Enter 전송 · Shift+Enter 줄바꿈",
    writeReply: "답장 작성...", send: "보내기",
  },
  newTicket: {
    title: "새 티켓", subtitle: "문제를 설명해 주시면 답변드리겠습니다.",
    backToTickets: "티켓으로 돌아가기", subject: "제목", subjectPh: "문제에 대한 간단한 요약...",
    category: "카테고리", priority: "우선순위", message: "메시지",
    messagePh: "문제를 자세히 설명하세요. 버그인 경우 재현 단계, 기능 요청인 경우 사용 사례를 포함하세요...",
    countLabel: "{n} / 20,000", ctrlEnter: "⌘ + Enter로 제출", cancel: "취소", creating: "만드는 중...",
    submitTicket: "티켓 제출", requiredError: "제목과 메시지는 필수입니다.",
    createFailed: "티켓을 만들지 못했습니다. 다시 시도하세요.",
    catGeneral: "일반", catGeneralDesc: "일반적인 질문 또는 피드백", catBug: "버그 보고",
    catBugDesc: "무언가가 올바르게 작동하지 않습니다", catFeature: "기능 요청",
    catFeatureDesc: "새 기능 또는 개선 사항 제안", catAccount: "계정",
    catAccountDesc: "계정 또는 프로필 문제", catBilling: "결제",
    catBillingDesc: "결제, 청구서 또는 구독", catOther: "기타", catOtherDesc: "그 밖의 사항",
    prioLow: "낮음", prioLowDesc: "긴급하지 않음", prioNormal: "보통", prioNormalDesc: "표준 응답 시간",
    prioHigh: "높음", prioHighDesc: "곧 주의 필요", prioUrgent: "긴급", prioUrgentDesc: "심각한 문제",
  },
  notifTexts: {
    "Sessions signed out": "세션 로그아웃",
    "Signed in to your account": "계정에 로그인했습니다",
    "New login from {device}": "{device}에서 새로 로그인했습니다",
    "All other sessions were signed out for your account.": "계정의 다른 모든 세션이 로그아웃되었습니다.",
    "Session signed out": "세션 로그아웃",
    "One of your sessions was signed out.": "세션 중 하나가 로그아웃되었습니다.",
    "Two-step verification enabled": "2단계 인증 활성화됨",
    "Authenticator app two-factor is now active on your account.": "계정에 인증 앱 2단계 인증이 활성화되었습니다.",
    "Two-step verification disabled": "2단계 인증 비활성화됨",
    "Two-factor authentication was turned off for your account.": "계정의 2단계 인증이 비활성화되었습니다.",
    "Recovery email verified": "복구 이메일 확인됨",
    "recoveryEmailBody": "복구 이메일({email})이 확인되었습니다.",
  },
};

const zh: Dict = {
  common: {
    loading: "加载中", saving: "保存中...", saved: "已保存", autoSaved: "更改已自动保存",
    viewAll: "查看全部", new: "新建", close: "关闭", cancel: "取消", save: "保存", delete: "删除",
    markRead: "标记为已读", loadMore: "加载更多", noNotifications: "暂无通知", noTickets: "暂无工单",
    justNow: "刚刚", agoM: "{n}分钟前", agoH: "{n}小时前", yesterday: "昨天", total: "共",
    unsavedWarn: "您有未保存的更改——离开此页面之前请先保存。",
  },
  nav: {
    workspace: "工作区", account: "账户", support: "支持",
    getStarted: "开始", inbox: "收件箱", profile: "个人资料", preferences: "偏好设置",
    notifications: "通知", connectedApps: "已连接的应用", security: "安全", privacy: "隐私",
    sessions: "会话", history: "历史记录", tickets: "工单",
  },
  header: {
    searchPlaceholder: "搜索...", notifications: "通知", switchToLight: "切换到浅色模式",
    switchToDark: "切换到深色模式", calendar: "日历", account: "账户", signOut: "退出登录", menu: "菜单", owner: "所有者", user: "用户",
  },
  overview: {
    subtitle: "您的仪表盘一目了然。",
    goodMorning: "早上好", goodAfternoon: "下午好", goodEvening: "晚上好", goodNight: "晚安",
    welcomeBack: "欢迎回来",
    statUnread: "未读", statOpenTickets: "未处理工单", statTotalNotif: "通知总数",
    quickTitle: "快捷操作",
    qInbox: "收件箱", qInboxDesc: "阅读消息", qProfile: "个人资料", qProfileDesc: "编辑个人资料",
    qSecurity: "安全", qSecurityDesc: "双重验证、密码、会话", qSupport: "支持", qSupportDesc: "打开工单",
    recentNotif: "最近的通知", recentTickets: "最近的工单", allSections: "所有板块",
    sPrefs: "偏好设置", sPrefsDesc: "语言、时区、格式", sNotif: "通知", sNotifDesc: "渠道、免打扰时段、摘要",
    sApps: "已连接的应用", sAppsDesc: "Google、GitHub、Discord", sPrivacy: "隐私", sPrivacyDesc: "分析、数据导出",
    sSessions: "会话", sSessionsDesc: "管理活跃会话", sHistory: "历史记录", sHistoryDesc: "活动日志",
    openInbox: "打开收件箱", openTickets: "打开工单", noNotifYet: "暂无通知。", noTicketsYet: "暂无工单。",
  },
  prefs: {
    title: "偏好设置", subtitle: "个性化您的体验。", general: "常规",
    language: "语言", timezone: "时区", dateFormat: "日期格式", timeFormat: "时间格式",
    h12: "12小时制 (AM/PM)", h24: "24小时制",
    timezoneUTC: "UTC", kathmandu: "亚洲/加德满都 (GMT+5:45)", eastern: "东部时间", central: "中部时间",
    mountain: "山地时间", pacific: "太平洋时间", london: "伦敦", berlin: "柏林", tokyo: "东京",
    shanghai: "上海", kolkata: "加尔各答",
    emailTitle: "电子邮件偏好", emailDesc: "管理您从 Tirbeo 收到的邮件。",
    productEmails: "产品邮件", productEmailsDesc: "功能更新和产品新闻。",
    weeklySummary: "每周摘要", weeklySummaryDesc: "每周获取您的活动摘要。",
    tipsUpdates: "提示与更新", tipsUpdatesDesc: "充分利用 Tirbeo 的提示。",
  },
  session: { expired: "您的会话已过期。某些功能可能无法使用。", signInAgain: "重新登录" },
  notif: {
    title: "通知", subtitle: "配置接收通知的方式和时间。", retention: "通知将在30天后自动删除。", empty: "暂无通知", total: "共",
    channelsTitle: "渠道", channelsDesc: "选择您希望接收通知的方式。",
    email: "邮件", push: "推送", inApp: "应用内",
    emailDesc: "在收件箱中接收通知。", pushDesc: "浏览器推送通知。", inAppDesc: "在应用内显示。",
    browserBlocked: "您的浏览器设置中已阻止浏览器通知。",
    categoriesTitle: "分类", categoriesDesc: "选择您关心的分类。",
    catSecurity: "安全", catSecurityDesc: "登录、双重验证更改和密码活动。",
    catForms: "表单", catFormsDesc: "表单提交和回复。",
    catProduct: "产品", catProductDesc: "产品更新和公告。",
    catSupport: "支持", catSupportDesc: "工单回复和支持更新。",
    perCategory: "按分类设置渠道", perCategoryDesc: "覆盖每个分类的渠道。",
    colCategory: "分类", colEmail: "邮件", colPush: "推送", colInApp: "应用内",
    quietTitle: "免打扰时段", quietDesc: "在此期间不发送通知。",
    enableQuiet: "启用免打扰时段", enableQuietDesc: "在您设定的时段内静默通知。",
    timeWindow: "时间范围", timeWindowDesc: "通知将在此期间暂停。", to: "至",
    quietActive: "免打扰时段已开启。",
    digestTitle: "每日摘要", digestDesc: "获取您错过的所有内容的摘要。",
    enableDigest: "启用摘要", enableDigestDesc: "接收摘要而非实时提醒。",
    frequency: "频率", frequencyDesc: "您希望接收摘要的频率。",
    daily: "每日", weekly: "每周", monthly: "每月",
  },
  search: {
    placeholder: "搜索页面、设置、操作...", pages: "页面", overview: "概览",
    notificationsSettings: "通知设置", activityHistory: "活动历史", supportTickets: "支持工单", navigate: "导航", open: "打开", close: "关闭",
  },
  calendar: {
    prevMonth: "上个月", nextMonth: "下个月", backToToday: "回到今天",
    today: "今天", yesterday: "昨天", tomorrow: "明天", daysAgo: "{n}天前", inDays: "{n}天后",
    months: ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"],
  },
  inbox: {
    title: "收件箱", descUnread: "{total}条中{unread}条未读", descTotal: "{total}条消息", markAllRead: "全部标为已读", tabAll: "全部", tabUnread: "未读", tabRead: "已读",
    deselect: "取消选择", selectAll: "全选", select: "选择", read: "已读",
    searchPlaceholder: "搜索通知...", noMatching: "没有匹配的通知",
    noMatchingDesc: "尝试其他搜索词或清除筛选器。", allCaughtUp: "您已全部处理",
    allCaughtUpDesc: "此文件夹中没有未读通知。", inboxEmpty: "暂无通知",
    inboxEmptyDesc: "来自 Tirbeo 的通知将显示在这里。", loadMore: "加载更多", back: "返回", open: "打开",
    noContent: "无内容", viewDetails: "查看详情", selectMessage: "选择一条消息",
    selectMessageDesc: "从列表中选择一条消息在此处阅读。",
    typeSecurity: "安全", typeForms: "表单", typeProduct: "产品", typeSupport: "支持", typeLogin: "登录", typeNotification: "通知", delete: "删除",
  },
  sessions: {
    title: "会话", subtitle: "管理您的登录位置。", revokeAllOthers: "退出其他所有会话",
    noActive: "没有活跃会话", noActiveDesc: "您当前未在任何地方登录。",
    currentDevice: "此设备", current: "当前", active: "活跃", unknownDevice: "未知设备", unknownIp: "未知 IP",
    revoke: "退出登录", revokeAllTitle: "退出其他所有会话？",
    revokeAllDesc: "其他所有会话将退出登录。此设备保持登录。",
    revokeSessionTitle: "退出此会话？", revokeSessionDesc: "此设备将立即退出登录。",
    revoking: "正在退出...", unknown: "未知", unknownBrowser: "未知浏览器", unknownOS: "未知操作系统", local: "本地", lastActive: "上次活动", on: "在",
  },
  apps: {
    title: "已连接的应用", subtitle: "连接您的账户以解锁集成功能。",
    available: "可用应用", disconnect: "断开连接", connect: "连接",
    googleDesc: "同步联系人、日历和 Gmail。", githubDesc: "同步代码仓库和活动。",
    discordDesc: "在 Discord 中接收通知。",
    connected: "已连接", notConnected: "未连接", connectedOn: "连接日期",
    disconnectConfirm: "断开提供者连接？",
    disconnectDesc: "确定要断开此提供者的连接吗？您可以稍后重新连接。",
    mergeTitle: "合并账户？",
    mergeDesc: "此提供者的邮箱已链接到另一个账户。合并将把提供者转移到您当前的账户。",
    mergeEmail: "邮箱",
    mergeButton: "合并账户",
    cancelButton: "取消",
    mergeSuccess: "账户合并成功！",
    mergeCancelled: "合并已取消。",
    noProviders: "未配置提供者。",
    providerEmail: "邮箱",
  },
  security: {
    title: "安全", subtitle: "以强大的安全措施保护您的账户。",
    twoFactor: "双重身份验证",
    twoFactorOn: "您的账户已启用双重身份验证。",
    twoFactorOff: "您的账户未启用双重身份验证。",
    status: "状态", enabled: "已启用", notEnabled: "未启用", disable2fa: "禁用 2FA", enable2fa: "启用 2FA",
    setupLoading: "正在加载 2FA 设置...", setupTitle: "启用双重身份验证",
    setupDesc: "使用身份验证器应用扫描此二维码，然后输入下方代码。",
    key: "密钥", code: "验证码", copy: "复制", enter6: "输入身份验证器应用中的 6 位验证码",
    verifyEnable: "启用 2FA", verifying: "正在验证...", disableTitle: "禁用双重身份验证？",
    disableDesc: "这将立即从您的账户中移除 2FA。", disabling: "正在禁用...",
    backupTitle: "备用验证码", backupDesc: "请将这些代码保存在安全的地方。如果您无法访问身份验证器，可以使用它们登录。",
    copyAll: "全部复制", done: "完成", copied: "已复制！", password: "密码", passwordLabel: "当前密码",
    changed: "密码更改成功。", change: "更改", changeTitle: "更改密码", changeDesc: "请输入当前密码和新密码。",
    current: "当前密码", new: "新密码", confirm: "确认新密码",
    currentPh: "输入当前密码", newPh: "输入新密码", confirmPh: "再次输入新密码",
    changePassword: "更改密码", pwdMismatch: "新密码不匹配。", failed: "出错了。请重试。",
    secondaryEmail: "恢复邮箱", secondaryDesc: "如果被锁定，请使用此邮箱恢复您的账户。",
    noSecondaryEmail: "未设置恢复邮箱", addEmail: "添加邮箱", lastActive: "上次活动",
    changeEmail: "更改邮箱", verifyEmail: "验证邮箱", newEmailLabel: "新邮箱", newEmailPh: "backup@example.com", sentTo: "我们已向{email}发送验证码。",
    email: "邮箱", verified: "已验证", remove: "移除", sendCode: "发送验证码", sending: "正在发送...",
    verify: "验证", enterCode: "输入发送到您邮箱的验证码", enterValidEmail: "请输入有效的邮箱地址。",
    sendFailed: "无法发送验证码。请重试。", enterCodeErr: "请输入验证码。", invalidCode: "验证码无效。请重试。",
    disable2faFailed: "无法禁用 2FA。请重试。", activeSessions: "活跃会话",
    noActiveSessions: "没有活跃会话。", unknownDevice: "未知设备", loginHistory: "登录历史",
    noLoginHistory: "没有最近的登录。", thStatus: "状态", thDate: "日期", thMethod: "方式",
    thIpDevice: "IP / 设备", success: "成功", failedStart: "失败",
  },
  privacy: {
    title: "隐私", subtitle: "控制您的数据使用方式。",
    dataAnalytics: "数据与分析", analytics: "分析", analyticsDesc: "通过分享使用数据帮助 Tirbeo 改进。",
    crashReports: "崩溃报告", crashReportsDesc: "发生问题时自动发送错误报告。",
    personalizedRecs: "个性化推荐", personalizedRecsDesc: "使用活动数据来定制推荐。",
    discoverability: "可发现性", discoverabilityDesc: "控制他人如何找到您。",
    searchEngine: "搜索引擎", searchEngineDesc: "允许搜索引擎索引您的公开个人资料。",
    directory: "目录", directoryDesc: "在 Tirbeo 目录中显示您的个人资料。",
    dataExport: "数据导出", dataExportDesc: "下载您账户中存储的所有内容的副本。",
    preparing: "正在准备导出...", exportData: "导出数据",
    exportNote: "准备就绪后，我们将通过邮件发送下载链接。",
    dangerZone: "危险区域", dangerZoneDesc: "无法撤销的永久性操作。",
    deleteAccount: "删除账户", irreversible: "此操作是永久性的且不可撤销。所有数据将被删除。",
    typeDelete: "输入“delete”进行确认。", typeDeletePh: "输入 delete 以确认", deleting: "正在删除...",
  },
  profile: {
    title: "个人资料", subtitle: "向大家介绍一下您自己。", saveChanges: "保存更改", noNameSet: "未设置姓名",
    personal: "个人信息", work: "工作", links: "链接", fullName: "姓名", fullNamePh: "您的姓名",
    username: "用户名", usernamePh: "您的用户名", bio: "个人简介", bioPh: "介绍一下您的工作...",
    gender: "性别", selectOption: "选择一个选项", male: "男", female: "女", other: "其他", preferNot: "不愿透露",
    birthday: "生日", country: "国家/地区", countryPh: "选择您的国家/地区", occupation: "职业",
    occupationPh: "例如：软件工程师", company: "公司", companyPh: "您的公司", role: "职位", rolePh: "您的职位",
    roleAtCompanyPh: "您在公司中的职位", industry: "行业", industryPh: "例如：科技",
    companySize: "公司规模", justMe: "仅我自己", website: "网站", websitePh: "https://yoursite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/username", github: "GitHub", githubPh: "github 用户名", twitter: "Twitter / X", twitterPh: "@用户名", accountInfo: "账户信息", email: "邮箱",
    recoveryEmail: "恢复邮箱", memberSince: "加入日期", lastActive: "最近活跃",
    connectedAccounts: "已连接的账户", noneConnected: "未连接任何账户。", verified: "已验证", unverified: "未验证",
  },
  history: {
    title: "活动历史", subtitle: "安全和账户事件的记录。",
    noActivity: "暂无活动", noActivityDesc: "您执行的操作将显示在这里。",
    act: {
      login: "已登录", logout: "已退出", signup: "账户已创建", passwordChanged: "密码已更改",
      profileUpdated: "个人资料已更新", twofaEnabled: "已启用 2FA", twofaDisabled: "已禁用 2FA",
      sessionRevoked: "会话已退出", emailVerified: "邮箱已验证", accountDeleted: "账户已删除",
      dataExported: "数据已导出", notificationRead: "通知已读", ticketCreated: "工单已创建",
      ticketReplied: "工单已回复", ticketClosed: "工单已关闭", unknown: "活动",
    },
  },
  tickets: {
    title: "工单", countOne: "{n} 个工单", countMany: "{n} 个工单", newTicket: "新建工单",
    noTickets: "暂无工单", noTicketsDesc: "创建工单以获取我们支持团队的帮助。",
    createTicket: "创建工单", subject: "主题", subjectPh: "问题的简要描述",
    category: "分类", priority: "优先级", message: "消息", messagePh: "请详细描述您的问题...",
    describeIssue: "描述您的问题，我们会回复您。", cancel: "取消", creating: "正在创建...",
    catGeneral: "常规", catBug: "错误报告", catFeature: "功能请求", catBilling: "账单",
    catOther: "其他", catAccount: "账户", prioLow: "低", prioNormal: "普通", prioHigh: "高", prioUrgent: "紧急",
    statusOpen: "已开启", statusClosed: "已关闭", statusInProgress: "进行中", priorityLabel: "{priority} 优先级",
  },
  ticketDetail: {
    notFound: "未找到工单。", backToTickets: "返回工单",
    noMessages: "暂无消息。请在下方开始对话。", you: "您", support: "支持",
    supportTeam: "支持团队", sendHint: "Enter 发送 · Shift+Enter 换行",
    writeReply: "输入回复...", send: "发送",
  },
  newTicket: {
    title: "新建工单", subtitle: "描述您的问题，我们会回复您。",
    backToTickets: "返回工单", subject: "主题", subjectPh: "问题的简要摘要...",
    category: "分类", priority: "优先级", message: "消息",
    messagePh: "请详细描述您的问题。如果是错误，请包含复现步骤；如果是功能请求，请说明您的使用场景...",
    countLabel: "{n} / 20,000", ctrlEnter: "按 ⌘ + Enter 提交", cancel: "取消", creating: "正在创建...",
    submitTicket: "提交工单", requiredError: "主题和消息为必填项。",
    createFailed: "创建工单失败。请重试。",
    catGeneral: "常规", catGeneralDesc: "一般问题或反馈", catBug: "错误报告",
    catBugDesc: "某些功能无法正常工作", catFeature: "功能请求",
    catFeatureDesc: "建议新功能或改进", catAccount: "账户",
    catAccountDesc: "账户或个人资料问题", catBilling: "账单",
    catBillingDesc: "付款、发票或订阅", catOther: "其他", catOtherDesc: "其他事项",
    prioLow: "低", prioLowDesc: "不急", prioNormal: "普通", prioNormalDesc: "标准响应时间",
    prioHigh: "高", prioHighDesc: "需要尽快处理", prioUrgent: "紧急", prioUrgentDesc: "严重问题",
  },
  notifTexts: {
    "Sessions signed out": "会话已退出",
    "Signed in to your account": "已登录到您的账户",
    "New login from {device}": "从 {device} 进行了新的登录",
    "All other sessions were signed out for your account.": "您账户的其他所有会话都已退出登录。",
    "Session signed out": "会话已退出",
    "One of your sessions was signed out.": "您的其中一个会话已退出登录。",
    "Two-step verification enabled": "双重验证已启用",
    "Authenticator app two-factor is now active on your account.": "身份验证器应用双重验证现已在您的账户上启用。",
    "Two-step verification disabled": "双重验证已禁用",
    "Two-factor authentication was turned off for your account.": "您的账户已关闭双重身份验证。",
    "Recovery email verified": "恢复邮箱已验证",
    "recoveryEmailBody": "您的恢复邮箱({email})已确认。",
  },
};

const hi: Dict = {
  common: {
    loading: "लोड हो रहा है", saving: "सेव हो रहा है...", saved: "सेव हो गया", autoSaved: "परिवर्तन स्वतः सेव हो गए",
    viewAll: "सब देखें", new: "नया", close: "बंद करें", cancel: "रद्द करें", save: "सेव करें", delete: "हटाएं",
    markRead: "पढ़ा हुआ चिह्नित करें", loadMore: "और लोड करें", noNotifications: "कोई सूचना नहीं", noTickets: "कोई टिकट नहीं",
    justNow: "अभी", agoM: "{n} मिनट पहले", agoH: "{n} घंटे पहले", yesterday: "कल", total: "कुल",
    unsavedWarn: "आपके पास असहेज किए गए बदलाव हैं — इस पृष्ठ से बाहर जाने से पहले सेव करें।",
  },
  nav: {
    workspace: "कार्यक्षेत्र", account: "खाता", support: "सहायता",
    getStarted: "शुरू करें", inbox: "इनबॉक्स", profile: "प्रोफ़ाइल", preferences: "प्राथमिकताएं",
    notifications: "सूचनाएं", connectedApps: "कनेक्टेड ऐप्स", security: "सुरक्षा", privacy: "गोपनीयता",
    sessions: "सत्र", history: "इतिहास", tickets: "टिकट",
  },
  header: {
    searchPlaceholder: "खोजें...", notifications: "सूचनाएं", switchToLight: "लाइट मोड पर जाएं",
    switchToDark: "डार्क मोड पर जाएं", calendar: "कैलेंडर", account: "खाता", signOut: "साइन आउट", menu: "मेनू", owner: "मालिक", user: "उपयोगकर्ता",
  },
  overview: {
    subtitle: "आपका डैशबोर्ड एक नज़र में।",
    goodMorning: "सुप्रभात", goodAfternoon: "नमस्ते", goodEvening: "शुभ संध्या", goodNight: "शुभ रात्रि",
    welcomeBack: "वापस स्वागत है",
    statUnread: "न पढ़े गए", statOpenTickets: "खुले टिकट", statTotalNotif: "कुल सूचनाएं",
    quickTitle: "त्वरित कार्य",
    qInbox: "इनबॉक्स", qInboxDesc: "अपने संदेश पढ़ें", qProfile: "प्रोफ़ाइल", qProfileDesc: "अपनी प्रोफ़ाइल संपादित करें",
    qSecurity: "सुरक्षा", qSecurityDesc: "2FA, पासवर्ड, सत्र", qSupport: "सहायता", qSupportDesc: "टिकट खोलें",
    recentNotif: "हाल की सूचनाएं", recentTickets: "हाल के टिकट", allSections: "सभी अनुभाग",
    sPrefs: "प्राथमिकताएं", sPrefsDesc: "भाषा, समयक्षेत्र, प्रारूप", sNotif: "सूचनाएं", sNotifDesc: "चैनल, शांत समय, डाइजेस्ट",
    sApps: "कनेक्टेड ऐप्स", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "गोपनीयता", sPrivacyDesc: "विश्लेषण, डेटा निर्यात",
    sSessions: "सत्र", sSessionsDesc: "सक्रिय सत्र प्रबंधित करें", sHistory: "इतिहास", sHistoryDesc: "गतिविधि लॉग",
    openInbox: "इनबॉक्स खोलें", openTickets: "टिकट खोलें", noNotifYet: "अभी कोई सूचना नहीं है।", noTicketsYet: "अभी कोई टिकट नहीं है।",
  },
  prefs: {
    title: "प्राथमिकताएं", subtitle: "अपने अनुभव को अनुकूलित करें।", general: "सामान्य",
    language: "भाषा", timezone: "समयक्षेत्र", dateFormat: "दिनांक प्रारूप", timeFormat: "समय प्रारूप",
    h12: "12 घंटे (AM/PM)", h24: "24 घंटे",
    timezoneUTC: "UTC", kathmandu: "एशिया/काठमांडू (GMT+5:45)", eastern: "पूर्वी समय", central: "केंद्रीय समय",
    mountain: "पर्वतीय समय", pacific: "प्रशांत समय", london: "लंदन", berlin: "बर्लिन", tokyo: "टोक्यो",
    shanghai: "शंघाई", kolkata: "कोलकाता",
    emailTitle: "ईमेल प्राथमिकताएं", emailDesc: "Tirbeo से प्राप्त होने वाले ईमेल प्रबंधित करें।",
    productEmails: "उत्पाद ईमेल", productEmailsDesc: "सुविधा अपडेट और उत्पाद समाचार।",
    weeklySummary: "साप्ताहिक सारांश", weeklySummaryDesc: "अपनी गतिविधि का साप्ताहिक सारांश प्राप्त करें।",
    tipsUpdates: "सुझाव और अपडेट", tipsUpdatesDesc: "Tirbeo का अधिकतम लाभ उठाने के सुझाव।",
  },
  session: { expired: "आपका सत्र समाप्त हो गया है। कुछ सुविधाएं काम नहीं कर सकती हैं।", signInAgain: "फिर से साइन इन करें" },
  notif: {
    title: "सूचनाएं", subtitle: "सूचनाएं कैसे और कब प्राप्त करें, यह कॉन्फ़िगर करें।", retention: "30 दिनों के बाद सूचनाएं स्वतः हटा दी जाती हैं।", empty: "कोई सूचना नहीं", total: "कुल",
    channelsTitle: "चैनल", channelsDesc: "चुनें कि आप सूचनाएं कहां प्राप्त करना चाहते हैं।",
    email: "ईमेल", push: "पुश", inApp: "इन-ऐप",
    emailDesc: "अपने इनबॉक्स में सूचनाएं प्राप्त करें।", pushDesc: "ब्राउज़र पुश सूचनाएं।", inAppDesc: "ऐप के भीतर दिखाएं।",
    browserBlocked: "आपकी ब्राउज़र सेटिंग में ब्राउज़र सूचनाएं अवरुद्ध हैं।",
    categoriesTitle: "श्रेणियां", categoriesDesc: "चुनें कि आपको किन श्रेणियों की परवाह है।",
    catSecurity: "सुरक्षा", catSecurityDesc: "साइन-इन, 2FA बदलाव और पासवर्ड गतिविधि।",
    catForms: "फ़ॉर्म", catFormsDesc: "फ़ॉर्म सबमिशन और प्रतिक्रियाएं।",
    catProduct: "उत्पाद", catProductDesc: "उत्पाद अपडेट और घोषणाएं।",
    catSupport: "सहायता", catSupportDesc: "आपके टिकटों के उत्तर और सहायता अपडेट।",
    perCategory: "प्रति श्रेणी चैनल", perCategoryDesc: "प्रत्येक श्रेणी के चैनल ओवरराइड करें।",
    colCategory: "श्रेणी", colEmail: "ईमेल", colPush: "पुश", colInApp: "इन-ऐप",
    quietTitle: "शांत समय", quietDesc: "इन घंटों के दौरान सूचनाएं न भेजें।",
    enableQuiet: "शांत समय सक्षम करें", enableQuietDesc: "अपने निर्धारित समय के दौरान सूचनाएं म्यूट करें।",
    timeWindow: "समय सीमा", timeWindowDesc: "इन घंटों के बीच सूचनाएं रुक जाती हैं।", to: "से",
    quietActive: "शांत समय चालू है।",
    digestTitle: "दैनिक डाइजेस्ट", digestDesc: "जो कुछ आपने मिस किया उसका सारांश प्राप्त करें।",
    enableDigest: "डाइजेस्ट सक्षम करें", enableDigestDesc: "रियल-टाइम अलर्ट के बजाय डाइजेस्ट प्राप्त करें।",
    frequency: "आवृत्ति", frequencyDesc: "आप डाइजेस्ट कितनी बार प्राप्त करना चाहते हैं।",
    daily: "दैनिक", weekly: "साप्ताहिक", monthly: "मासिक",
  },
  search: {
    placeholder: "पेज, सेटिंग्स, क्रियाएं खोजें...", pages: "पेज", overview: "अवलोकन",
    notificationsSettings: "सूचना सेटिंग्स", activityHistory: "गतिविधि इतिहास", supportTickets: "सहायता टिकट", navigate: "नेविगेट करें", open: "खोलें", close: "बंद करें",
  },
  calendar: {
    prevMonth: "पिछला महीना", nextMonth: "अगला महीना", backToToday: "आज पर वापस जाएं",
    today: "आज", yesterday: "कल", tomorrow: "कल", daysAgo: "{n} दिन पहले", inDays: "{n} दिन में",
    months: ["जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून", "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"],
  },
  inbox: {
    title: "इनबॉक्स", descUnread: "{total} में से {unread} अपठित", descTotal: "{total} संदेश", markAllRead: "सभी पढ़ा हुआ चिह्नित करें", tabAll: "सभी", tabUnread: "न पढ़े गए", tabRead: "पढ़े गए",
    deselect: "चयन हटाएं", selectAll: "सभी चुनें", select: "चुनें", read: "पढ़ा हुआ",
    searchPlaceholder: "सूचनाएं खोजें...", noMatching: "कोई मेल खाती सूचना नहीं",
    noMatchingDesc: "अलग खोज आज़माएं या फ़िल्टर साफ़ करें।", allCaughtUp: "आप पूरी तरह अपडेट हैं",
    allCaughtUpDesc: "इस फ़ोल्डर में कोई न पढ़ी सूचना नहीं है।", inboxEmpty: "अभी कोई सूचना नहीं है",
    inboxEmptyDesc: "Tirbeo की सूचनाएं यहां दिखाई देंगी।", loadMore: "और लोड करें", back: "वापस", open: "खोलें",
    noContent: "कोई सामग्री नहीं", viewDetails: "विवरण देखें", selectMessage: "एक संदेश चुनें",
    selectMessageDesc: "इसे यहां पढ़ने के लिए सूची में से एक संदेश चुनें।",
    typeSecurity: "सुरक्षा", typeForms: "फ़ॉर्म", typeProduct: "उत्पाद", typeSupport: "सहायता", typeLogin: "लॉगिन", typeNotification: "सूचना", delete: "हटाएं",
  },
  sessions: {
    title: "सत्र", subtitle: "जहां आपने साइन इन किया है उसे प्रबंधित करें।", revokeAllOthers: "अन्य सभी सत्रों को साइन आउट करें",
    noActive: "कोई सक्रिय सत्र नहीं", noActiveDesc: "आप अभी कहीं साइन इन नहीं हैं।",
    currentDevice: "यह डिवाइस", current: "वर्तमान", active: "सक्रिय", unknownDevice: "अज्ञात डिवाइस", unknownIp: "अज्ञात IP",
    revoke: "साइन आउट", revokeAllTitle: "अन्य सभी सत्रों को साइन आउट करें?",
    revokeAllDesc: "अन्य सभी सत्र साइन आउट हो जाएंगे। यह डिवाइस साइन इन रहेगा।",
    revokeSessionTitle: "इस सत्र को साइन आउट करें?", revokeSessionDesc: "यह डिवाइस तुरंत साइन आउट हो जाएगा।",
    revoking: "साइन आउट हो रहा है...", unknown: "अज्ञात", unknownBrowser: "अज्ञात ब्राउज़र", unknownOS: "अज्ञात OS", local: "स्थानीय", lastActive: "अंतिम गतिविधि", on: "पर",
  },
  apps: {
    title: "कनेक्टेड ऐप्स", subtitle: "इंटीग्रेशन अनलॉक करने के लिए अपने खाते कनेक्ट करें।",
    available: "उपलब्ध ऐप्स", disconnect: "डिस्कनेक्ट", connect: "कनेक्ट",
    googleDesc: "संपर्क, कैलेंडर और Gmail सिंक करें।", githubDesc: "रिपॉजिटरी और गतिविधि सिंक करें।",
    discordDesc: "Discord में सूचनाएं प्राप्त करें।",
    connected: "जुड़ा हुआ", notConnected: "जुड़ा नहीं", connectedOn: "जुड़ने की तिथि",
    disconnectConfirm: "प्रदाता डिस्कनेक्ट करें?",
    disconnectDesc: "क्या आप वाकई इस प्रदाता को डिस्कनेक्ट करना चाहते हैं? आप इसे बाद में फिर से जोड़ सकते हैं।",
    mergeTitle: "खाते मर्ज करें?",
    mergeDesc: "इस प्रदाता का ईमेल पहले से किसी अन्य खाते से जुड़ा है। मर्ज करने से प्रदाता आपके वर्तमान खाते में स्थानांतरित हो जाएगा।",
    mergeEmail: "ईमेल",
    mergeButton: "खाते मर्ज करें",
    cancelButton: "रद्द करें",
    mergeSuccess: "खाते सफलतापूर्वक मर्ज हो गए!",
    mergeCancelled: "मर्ज रद्द कर दिया गया।",
    noProviders: "कोई प्रदाता कॉन्फ़िगर नहीं।",
    providerEmail: "ईमेल",
  },
  security: {
    title: "सुरक्षा", subtitle: "मजबूत सुरक्षा से अपने खाते की रक्षा करें।",
    twoFactor: "दो-कारक प्रमाणीकरण",
    twoFactorOn: "आपके खाते के लिए दो-कारक प्रमाणीकरण सक्षम है।",
    twoFactorOff: "आपके खाते के लिए दो-कारक प्रमाणीकरण सक्षम नहीं है।",
    status: "स्थिति", enabled: "सक्षम", notEnabled: "सक्षम नहीं", disable2fa: "2FA अक्षम करें", enable2fa: "2FA सक्षम करें",
    setupLoading: "2FA सेटअप लोड हो रहा है...", setupTitle: "दो-कारक प्रमाणीकरण सक्षम करें",
    setupDesc: "इस QR कोड को अपने ऑथेंटिकेटर ऐप से स्कैन करें, फिर नीचे कोड दर्ज करें।",
    key: "कुंजी", code: "कोड", copy: "कॉपी", enter6: "अपने ऑथेंटिकेटर ऐप से 6 अंकों का कोड दर्ज करें",
    verifyEnable: "2FA सक्षम करें", verifying: "सत्यापित हो रहा है...", disableTitle: "दो-कारक प्रमाणीकरण अक्षम करें?",
    disableDesc: "यह आपके खाते से 2FA तुरंत हटा देगा।", disabling: "अक्षम हो रहा है...",
    backupTitle: "बैकअप कोड", backupDesc: "इन कोडों को सुरक्षित स्थान पर रखें। ऑथेंटिकेटर तक पहुंच खोने पर आप इनसे साइन इन कर सकते हैं।",
    copyAll: "सभी कॉपी करें", done: "हो गया", copied: "कॉपी हो गया!", password: "पासवर्ड", passwordLabel: "वर्तमान पासवर्ड",
    changed: "पासवर्ड सफलतापूर्वक बदल गया।", change: "बदलें", changeTitle: "पासवर्ड बदलें", changeDesc: "अपना वर्तमान और नया पासवर्ड दर्ज करें।",
    current: "वर्तमान पासवर्ड", new: "नया पासवर्ड", confirm: "नए पासवर्ड की पुष्टि करें",
    currentPh: "अपना वर्तमान पासवर्ड दर्ज करें", newPh: "नया पासवर्ड दर्ज करें", confirmPh: "नया पासवर्ड दोबारा दर्ज करें",
    changePassword: "पासवर्ड बदलें", pwdMismatch: "नए पासवर्ड मेल नहीं खाते।", failed: "कुछ गलत हो गया। फिर से कोशिश करें।",
    secondaryEmail: "रिकवरी ईमेल", secondaryDesc: "लॉक आउट होने पर खाता रिकवर करने के लिए इस ईमेल का उपयोग करें।",
    noSecondaryEmail: "रिकवरी ईमेल सेट नहीं है", addEmail: "ईमेल जोड़ें", lastActive: "अंतिम गतिविधि",
    changeEmail: "ईमेल बदलें", verifyEmail: "ईमेल सत्यापित करें", newEmailLabel: "नया ईमेल", newEmailPh: "backup@example.com", sentTo: "हमने {email} पर कोड भेजा है।",
    email: "ईमेल", verified: "सत्यापित", remove: "हटाएं", sendCode: "कोड भेजें", sending: "भेजा जा रहा है...",
    verify: "सत्यापित करें", enterCode: "अपने ईमेल पर भेजा गया कोड दर्ज करें", enterValidEmail: "एक मान्य ईमेल पता दर्ज करें।",
    sendFailed: "कोड भेजने में विफल। फिर से कोशिश करें।", enterCodeErr: "कोड दर्ज करें।", invalidCode: "अमान्य कोड। फिर से कोशिश करें।",
    disable2faFailed: "2FA अक्षम करने में विफल। फिर से कोशिश करें।", activeSessions: "सक्रिय सत्र",
    noActiveSessions: "कोई सक्रिय सत्र नहीं।", unknownDevice: "अज्ञात डिवाइस", loginHistory: "लॉगिन इतिहास",
    noLoginHistory: "कोई हालिया लॉगिन नहीं।", thStatus: "स्थिति", thDate: "दिनांक", thMethod: "विधि",
    thIpDevice: "IP / डिवाइस", success: "सफल", failedStart: "विफल",
  },
  privacy: {
    title: "गोपनीयता", subtitle: "नियंत्रित करें कि आपका डेटा कैसे उपयोग होता है।",
    dataAnalytics: "डेटा और विश्लेषण", analytics: "विश्लेषण", analyticsDesc: "उपयोग डेटा साझा करके Tirbeo को बेहतर बनाने में मदद करें।",
    crashReports: "क्रैश रिपोर्ट", crashReportsDesc: "कुछ खराब होने पर त्रुटि रिपोर्ट स्वतः भेजें।",
    personalizedRecs: "व्यक्तिगत अनुशंसाएं", personalizedRecsDesc: "अनुशंसाओं को अनुकूलित करने के लिए गतिविधि का उपयोग करें।",
    discoverability: "खोज क्षमता", discoverabilityDesc: "नियंत्रित करें कि दूसरे आपको कैसे ढूंढ सकते हैं।",
    searchEngine: "सर्च इंजन", searchEngineDesc: "सर्च इंजन को आपकी सार्वजनिक प्रोफ़ाइल को इंडेक्स करने दें।",
    directory: "निर्देशिका", directoryDesc: "Tirbeo निर्देशिका में अपनी प्रोफ़ाइल दिखाएं।",
    dataExport: "डेटा निर्यात", dataExportDesc: "अपने खाते में संग्रहीत सब कुछ की एक प्रति डाउनलोड करें।",
    preparing: "निर्यात तैयार हो रहा है...", exportData: "डेटा निर्यात करें",
    exportNote: "तैयार होने पर आपको ईमेल से डाउनलोड लिंक मिलेगा।",
    dangerZone: "खतरनाक क्षेत्र", dangerZoneDesc: "स्थायी क्रियाएं जिन्हें पूर्ववत नहीं किया जा सकता।",
    deleteAccount: "खाता हटाएं", irreversible: "यह क्रिया स्थायी और अपरिवर्तनीय है। सारा डेटा हटा दिया जाएगा।",
    typeDelete: "पुष्टि करने के लिए 'delete' टाइप करें।", typeDeletePh: "पुष्टि के लिए delete टाइप करें", deleting: "हटाया जा रहा है...",
  },
  profile: {
    title: "प्रोफ़ाइल", subtitle: "लोगों को अपने बारे में थोड़ा बताएं।", saveChanges: "परिवर्तन सेव करें", noNameSet: "नाम सेट नहीं है",
    personal: "व्यक्तिगत जानकारी", work: "कार्य", links: "लिंक", fullName: "पूरा नाम", fullNamePh: "आपका पूरा नाम",
    username: "उपयोगकर्ता नाम", usernamePh: "आपका-उपयोगकर्ता-नाम", bio: "परिचय", bioPh: "लोगों को बताएं कि आप क्या करते हैं...",
    gender: "लिंग", selectOption: "एक विकल्प चुनें", male: "पुरुष", female: "महिला", other: "अन्य", preferNot: "नहीं बताना चाहूंगा/चाहूंगी",
    birthday: "जन्मदिन", country: "देश", countryPh: "अपना देश चुनें", occupation: "व्यवसाय",
    occupationPh: "जैसे सॉफ्टवेयर इंजीनियर", company: "कंपनी", companyPh: "आपकी कंपनी", role: "भूमिका", rolePh: "आपकी भूमिका",
    roleAtCompanyPh: "कंपनी में आपकी भूमिका", industry: "उद्योग", industryPh: "जैसे प्रौद्योगिकी",
    companySize: "कंपनी का आकार", justMe: "सिर्फ मैं", website: "वेबसाइट", websitePh: "https://yoursite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/username", github: "GitHub", githubPh: "github उपयोगकर्ता नाम", twitter: "Twitter / X", twitterPh: "@उपयोगकर्ता नाम", accountInfo: "खाता जानकारी", email: "ईमेल",
    recoveryEmail: "रिकवरी ईमेल", memberSince: "सदस्य से", lastActive: "अंतिम गतिविधि",
    connectedAccounts: "कनेक्टेड खाते", noneConnected: "कोई खाता कनेक्ट नहीं है।", verified: "सत्यापित", unverified: "सत्यापित नहीं",
  },
  history: {
    title: "गतिविधि इतिहास", subtitle: "सुरक्षा और खाता घटनाओं का रिकॉर्ड।",
    noActivity: "अभी कोई गतिविधि नहीं", noActivityDesc: "आपके द्वारा की गई क्रियाएं यहां दिखाई देंगी।",
    act: {
      login: "साइन इन किया", logout: "साइन आउट किया", signup: "खाता बनाया गया", passwordChanged: "पासवर्ड बदला गया",
      profileUpdated: "प्रोफ़ाइल अपडेट हुई", twofaEnabled: "2FA सक्षम किया गया", twofaDisabled: "2FA अक्षम किया गया",
      sessionRevoked: "सत्र साइन आउट हुए", emailVerified: "ईमेल सत्यापित हुआ", accountDeleted: "खाता हटाया गया",
      dataExported: "डेटा निर्यात हुआ", notificationRead: "सूचना पढ़ी गई", ticketCreated: "टिकट बनाया गया",
      ticketReplied: "टिकट का उत्तर दिया गया", ticketClosed: "टिकट बंद हुआ", unknown: "गतिविधि",
    },
  },
  tickets: {
    title: "टिकट", countOne: "{n} टिकट", countMany: "{n} टिकट", newTicket: "नया टिकट",
    noTickets: "अभी कोई टिकट नहीं", noTicketsDesc: "हमारी सहायता टीम से मदद पाने के लिए टिकट बनाएं।",
    createTicket: "टिकट बनाएं", subject: "विषय", subjectPh: "अपनी समस्या का संक्षिप्त विवरण",
    category: "श्रेणी", priority: "प्राथमिकता", message: "संदेश", messagePh: "अपनी समस्या का विस्तार से वर्णन करें...",
    describeIssue: "अपनी समस्या का वर्णन करें, हम आपसे संपर्क करेंगे।", cancel: "रद्द करें", creating: "बनाया जा रहा है...",
    catGeneral: "सामान्य", catBug: "बग रिपोर्ट", catFeature: "फीचर अनुरोध", catBilling: "बिलिंग",
    catOther: "अन्य", catAccount: "खाता", prioLow: "कम", prioNormal: "सामान्य", prioHigh: "उच्च", prioUrgent: "तत्काल",
    statusOpen: "खुला", statusClosed: "बंद", statusInProgress: "प्रगति में", priorityLabel: "{priority} प्राथमिकता",
  },
  ticketDetail: {
    notFound: "टिकट नहीं मिला।", backToTickets: "टिकटों पर वापस जाएं",
    noMessages: "अभी कोई संदेश नहीं। नीचे बातचीत शुरू करें।", you: "आप", support: "सहायता",
    supportTeam: "सहायता टीम", sendHint: "भेजने के लिए Enter · नई लाइन के लिए Shift+Enter",
    writeReply: "उत्तर लिखें...", send: "भेजें",
  },
  newTicket: {
    title: "नया टिकट", subtitle: "अपनी समस्या का वर्णन करें, हम आपसे संपर्क करेंगे।",
    backToTickets: "टिकटों पर वापस जाएं", subject: "विषय", subjectPh: "अपनी समस्या का संक्षिप्त सारांश...",
    category: "श्रेणी", priority: "प्राथमिकता", message: "संदेश",
    messagePh: "अपनी समस्या का विस्तार से वर्णन करें। बग होने पर पुनरुत्पादन के चरण, या फीचर अनुरोध होने पर अपना उपयोग मामला शामिल करें...",
    countLabel: "{n} / 20,000", ctrlEnter: "सबमिट करने के लिए ⌘ + Enter दबाएं", cancel: "रद्द करें", creating: "बनाया जा रहा है...",
    submitTicket: "टिकट सबमिट करें", requiredError: "विषय और संदेश आवश्यक हैं।",
    createFailed: "टिकट बनाने में विफल। फिर से कोशिश करें।",
    catGeneral: "सामान्य", catGeneralDesc: "सामान्य प्रश्न या प्रतिक्रिया", catBug: "बग रिपोर्ट",
    catBugDesc: "कुछ ठीक से काम नहीं कर रहा है", catFeature: "फीचर अनुरोध",
    catFeatureDesc: "नई सुविधा या सुधार सुझाएं", catAccount: "खाता",
    catAccountDesc: "आपके खाते या प्रोफ़ाइल की समस्याएं", catBilling: "बिलिंग",
    catBillingDesc: "भुगतान, चालान या सदस्यता", catOther: "अन्य", catOtherDesc: "कुछ और",
    prioLow: "कम", prioLowDesc: "कोई जल्दी नहीं", prioNormal: "सामान्य", prioNormalDesc: "मानक प्रतिक्रिया समय",
    prioHigh: "उच्च", prioHighDesc: "जल्द ध्यान देने की आवश्यकता", prioUrgent: "तत्काल", prioUrgentDesc: "गंभीर समस्या",
  },
  notifTexts: {
    "Sessions signed out": "सत्र साइन आउट हुए",
    "Signed in to your account": "आपके खाते में साइन इन किया गया",
    "New login from {device}": "{device} से नया लॉगिन",
    "All other sessions were signed out for your account.": "आपके खाते के अन्य सभी सत्र साइन आउट कर दिए गए।",
    "Session signed out": "सत्र साइन आउट हुआ",
    "One of your sessions was signed out.": "आपके एक सत्र को साइन आउट किया गया।",
    "Two-step verification enabled": "दो-चरणीय सत्यापन सक्षम हुआ",
    "Authenticator app two-factor is now active on your account.": "ऑथेंटिकेटर ऐप दो-कारक अब आपके खाते पर सक्रिय है।",
    "Two-step verification disabled": "दो-चरणीय सत्यापन अक्षम हुआ",
    "Two-factor authentication was turned off for your account.": "आपके खाते के लिए दो-कारक प्रमाणीकरण बंद कर दिया गया।",
    "Recovery email verified": "रिकवरी ईमेल सत्यापित हुआ",
    "recoveryEmailBody": "आपका रिकवरी ईमेल({email}) पुष्टि हो गया है।",
  },
};

const ne: Dict = {
  common: {
    loading: "लोड हुँदैछ", saving: "सेभ हुँदैछ...", saved: "सेभ भयो", autoSaved: "परिवर्तनहरू स्वतः सेभ हुन्छन्",
    viewAll: "सबै हेर्नुहोस्", new: "नयाँ", close: "बन्द गर्नुहोस्", cancel: "रद्द गर्नुहोस्", save: "सेभ गर्नुहोस्", delete: "मेटाउनुहोस्",
    markRead: "पढेको चिन्ह लगाउनुहोस्", loadMore: "थप लोड गर्नुहोस्", noNotifications: "कुनै सूचना छैन", noTickets: "कुनै टिकट छैन",
    justNow: "भर्खरै", agoM: "{n} मिनेट अघि", agoH: "{n} घण्टा अघि", yesterday: "हिजो", total: "जम्मा",
    unsavedWarn: "तपाईंसँग असुरक्षित परिवर्तनहरू छन् — यो पृष्ठ छोड्नु अघि सेभ गर्नुहोस्।",
  },
  nav: {
    workspace: "कार्यस्थान", account: "खाता", support: "सहयोग",
    getStarted: "सुरु गर्नुहोस्", inbox: "इनबक्स", profile: "प्रोफाइल", preferences: "प्राथमिकताहरू",
    notifications: "सूचनाहरू", connectedApps: "जोडिएका एपहरू", security: "सुरक्षा", privacy: "गोपनीयता",
    sessions: "सत्रहरू", history: "इतिहास", tickets: "टिकटहरू",
  },
  header: {
    searchPlaceholder: "खोज्नुहोस्...", notifications: "सूचनाहरू", switchToLight: "हल्को मोडमा जानुहोस्",
    switchToDark: "गाढा मोडमा जानुहोस्", calendar: "पात्रो", account: "खाता", signOut: "साइन आउट", menu: "मेनु", owner: "मालिक", user: "प्रयोगकर्ता",
  },
  overview: {
    subtitle: "तपाईंको ड्यासबोर्ड एकै नजरमा।",
    goodMorning: "शुभ प्रभात", goodAfternoon: "शुभ दिउँसो", goodEvening: "शुभ साँझ", goodNight: "शुभ रात्रि",
    welcomeBack: "पुनः स्वागत छ",
    statUnread: "नपढेको", statOpenTickets: "खुला टिकटहरू", statTotalNotif: "कुल सूचनाहरू",
    quickTitle: "द्रुत कार्यहरू",
    qInbox: "इनबक्स", qInboxDesc: "आफ्ना सन्देशहरू पढ्नुहोस्", qProfile: "प्रोफाइल", qProfileDesc: "आफ्नो प्रोफाइल सम्पादन गर्नुहोस्",
    qSecurity: "सुरक्षा", qSecurityDesc: "2FA, पासवर्डहरू, सत्रहरू", qSupport: "सहयोग", qSupportDesc: "टिकट खोल्नुहोस्",
    recentNotif: "हालका सूचनाहरू", recentTickets: "हालका टिकटहरू", allSections: "सबै खण्डहरू",
    sPrefs: "प्राथमिकताहरू", sPrefsDesc: "भाषा, समय क्षेत्र, ढाँचा", sNotif: "सूचनाहरू", sNotifDesc: "च्यानल, शान्त समय, डाइजेस्ट",
    sApps: "जोडिएका एपहरू", sAppsDesc: "Google, GitHub, Discord", sPrivacy: "गोपनीयता", sPrivacyDesc: "विश्लेषण, डेटा निर्यात",
    sSessions: "सत्रहरू", sSessionsDesc: "सक्रिय सत्रहरू व्यवस्थापन गर्नुहोस्", sHistory: "इतिहास", sHistoryDesc: "गतिविधि लग",
    openInbox: "इनबक्स खोल्नुहोस्", openTickets: "टिकटहरू खोल्नुहोस्", noNotifYet: "अहिलेसम्म कुनै सूचना छैन।", noTicketsYet: "अहिलेसम्म कुनै टिकट छैन।",
  },
  prefs: {
    title: "प्राथमिकताहरू", subtitle: "आफ्नो अनुभव अनुकूलित गर्नुहोस्।", general: "सामान्य",
    language: "भाषा", timezone: "समय क्षेत्र", dateFormat: "मिति ढाँचा", timeFormat: "समय ढाँचा",
    h12: "१२ घण्टा (AM/PM)", h24: "२४ घण्टा",
    timezoneUTC: "UTC", kathmandu: "एशिया/काठमाडौं (GMT+5:45)", eastern: "पूर्वी समय", central: "केन्द्रीय समय",
    mountain: "पर्वतीय समय", pacific: "प्रशान्त समय", london: "लन्डन", berlin: "बर्लिन", tokyo: "टोकियो",
    shanghai: "सांघाई", kolkata: "कोलकाता",
    emailTitle: "इमेल प्राथमिकताहरू", emailDesc: "Tirbeo बाट प्राप्त हुने इमेलहरू व्यवस्थापन गर्नुहोस्।",
    productEmails: "उत्पाद इमेलहरू", productEmailsDesc: "सुविधा अद्यावधिक र उत्पाद समाचार।",
    weeklySummary: "साप्ताहिक सारांश", weeklySummaryDesc: "आफ्नो गतिविधिको साप्ताहिक सारांश प्राप्त गर्नुहोस्।",
    tipsUpdates: "सुझाव र अद्यावधिक", tipsUpdatesDesc: "Tirbeo को अधिकतम उपयोग गर्ने सुझावहरू।",
  },
  session: { expired: "तपाईंको सत्र समाप्त भयो। केही सुविधाहरूले काम नगर्न सक्छन्।", signInAgain: "फेरि साइन इन गर्नुहोस्" },
  notif: {
    title: "सूचनाहरू", subtitle: "सूचनाहरू कसरी र कहिले प्राप्त गर्ने भनेर कन्फिगर गर्नुहोस्।", retention: "३० दिनपछि सूचनाहरू स्वतः मेटिन्छन्।", empty: "कुनै सूचना छैन", total: "जम्मा",
    channelsTitle: "च्यानलहरू", channelsDesc: "तपाईं कहाँ सूचनाहरू प्राप्त गर्न चाहनुहुन्छ छान्नुहोस्।",
    email: "इमेल", push: "पुश", inApp: "इन-एप",
    emailDesc: "आफ्नो इनबक्समा सूचनाहरू प्राप्त गर्नुहोस्।", pushDesc: "ब्राउजर पुश सूचनाहरू।", inAppDesc: "एप भित्र देखाउनुहोस्।",
    browserBlocked: "तपाईंको ब्राउजर सेटिङमा ब्राउजर सूचनाहरू रोकिएका छन्।",
    categoriesTitle: "श्रेणीहरू", categoriesDesc: "तपाईंलाई चासो भएका श्रेणीहरू छान्नुहोस्।",
    catSecurity: "सुरक्षा", catSecurityDesc: "साइन-इन, 2FA परिवर्तन र पासवर्ड गतिविधि।",
    catForms: "फारमहरू", catFormsDesc: "फारम पेशी र प्रतिक्रियाहरू।",
    catProduct: "उत्पाद", catProductDesc: "उत्पाद अद्यावधिक र घोषणाहरू।",
    catSupport: "सहयोग", catSupportDesc: "तपाईंका टिकटहरूका उत्तर र सहयोग अद्यावधिकहरू।",
    perCategory: "प्रति श्रेणी च्यानल", perCategoryDesc: "प्रत्येक श्रेणीका च्यानलहरू ओभरराइड गर्नुहोस्।",
    colCategory: "श्रेणी", colEmail: "इमेल", colPush: "पुश", colInApp: "इन-एप",
    quietTitle: "शान्त समय", quietDesc: "यी घण्टाहरूमा सूचनाहरू नपठाउनुहोस्।",
    enableQuiet: "शान्त समय सक्षम गर्नुहोस्", enableQuietDesc: "तपाईंले तोकेको समयमा सूचनाहरू म्युट गर्नुहोस्।",
    timeWindow: "समय सीमा", timeWindowDesc: "यी घण्टाहरू बीच सूचनाहरू रोकिन्छन्।", to: "देखि",
    quietActive: "शान्त समय चालू छ।",
    digestTitle: "दैनिक डाइजेस्ट", digestDesc: "तपाईंले छुटाउनुभएको सबैको सारांश प्राप्त गर्नुहोस्।",
    enableDigest: "डाइजेस्ट सक्षम गर्नुहोस्", enableDigestDesc: "रियल-टाइम अलर्टको सट्टा डाइजेस्ट प्राप्त गर्नुहोस्।",
    frequency: "आवृत्ति", frequencyDesc: "तपाईं डाइजेस्ट कति पटक प्राप्त गर्न चाहनुहुन्छ।",
    daily: "दैनिक", weekly: "साप्ताहिक", monthly: "मासिक",
  },
  search: {
    placeholder: "पेज, सेटिङहरू, कार्यहरू खोज्नुहोस्...", pages: "पेजहरू", overview: "अवलोकन",
    notificationsSettings: "सूचना सेटिङहरू", activityHistory: "गतिविधि इतिहास", supportTickets: "सहयोग टिकटहरू", navigate: "नेभिगेट गर्नुहोस्", open: "खोल्नुहोस्", close: "बन्द गर्नुहोस्",
  },
  calendar: {
    prevMonth: "अघिल्लो महिना", nextMonth: "अर्को महिना", backToToday: "आजमा फर्कनुहोस्",
    today: "आज", yesterday: "हिजो", tomorrow: "भोलि", daysAgo: "{n} दिन अघि", inDays: "{n} दिनमा",
    months: ["जनवरी", "फेब्रुअरी", "मार्च", "अप्रिल", "मे", "जुन", "जुलाई", "अगस्ट", "सेप्टेम्बर", "अक्टोबर", "नोभेम्बर", "डिसेम्बर"],
  },
  inbox: {
    title: "इनबक्स", descUnread: "{total} मध्ये {unread} नपढेका", descTotal: "{total} सन्देशहरू", markAllRead: "सबै पढेको चिन्ह लगाउनुहोस्", tabAll: "सबै", tabUnread: "नपढेको", tabRead: "पढेको",
    deselect: "चयन हटाउनुहोस्", selectAll: "सबै चयन गर्नुहोस्", select: "चयन", read: "पढेको",
    searchPlaceholder: "सूचनाहरू खोज्नुहोस्...", noMatching: "कुनै मिल्ने सूचना छैन",
    noMatchingDesc: "अर्को खोज प्रयास गर्नुहोस् वा फिल्टर खाली गर्नुहोस्।", allCaughtUp: "तपाईं सबैभन्दा नयाँ अवस्थामा हुनुहुन्छ",
    allCaughtUpDesc: "यस फोल्डरमा कुनै नपढेको सूचना छैन।", inboxEmpty: "अहिलेसम्म कुनै सूचना छैन",
    inboxEmptyDesc: "Tirbeo बाट आउने सूचनाहरू यहाँ देखिनेछन्।", loadMore: "थप लोड गर्नुहोस्", back: "फर्कनुहोस्", open: "खोल्नुहोस्",
    noContent: "कुनै सामग्री छैन", viewDetails: "विवरण हेर्नुहोस्", selectMessage: "एउटा सन्देश चयन गर्नुहोस्",
    selectMessageDesc: "यहाँ पढ्नको लागि सूचीबाट एउटा सन्देश छान्नुहोस्।",
    typeSecurity: "सुरक्षा", typeForms: "फारमहरू", typeProduct: "उत्पाद", typeSupport: "सहयोग", typeLogin: "लगइन", typeNotification: "सूचना", delete: "मेटाउनुहोस्",
  },
  sessions: {
    title: "सत्रहरू", subtitle: "तपाईं कहाँ साइन इन हुनुहुन्छ व्यवस्थापन गर्नुहोस्।", revokeAllOthers: "अन्य सबै सत्रहरू साइन आउट गर्नुहोस्",
    noActive: "कुनै सक्रिय सत्र छैन", noActiveDesc: "तपाईं अहिले कतै पनि साइन इन हुनुहुन्न।",
    currentDevice: "यो यन्त्र", current: "वर्तमान", active: "सक्रिय", unknownDevice: "अज्ञात यन्त्र", unknownIp: "अज्ञात IP",
    revoke: "साइन आउट", revokeAllTitle: "अन्य सबै सत्रहरू साइन आउट गर्ने?",
    revokeAllDesc: "अन्य सबै सत्रहरू साइन आउट हुनेछन्। यो यन्त्र साइन इन नै रहनेछ।",
    revokeSessionTitle: "यो सत्र साइन आउट गर्ने?", revokeSessionDesc: "यो यन्त्र तुरुन्तै साइन आउट हुनेछ।",
    revoking: "साइन आउट हुँदैछ...", unknown: "अज्ञात", unknownBrowser: "अज्ञात ब्राउजर", unknownOS: "अज्ञात OS", local: "स्थानीय", lastActive: "पछिल्लो गतिविधि", on: "मा",
  },
  apps: {
    title: "जोडिएका एपहरू", subtitle: "इन्टिग्रेसनहरू खोल्न आफ्ना खाताहरू जडान गर्नुहोस्।",
    available: "उपलब्ध एपहरू", disconnect: "विच्छेद", connect: "जडान",
    googleDesc: "सम्पर्क, पात्रो र Gmail सिङ्क गर्नुहोस्।", githubDesc: "रेपोजिटरीहरू र गतिविधि सिङ्क गर्नुहोस्।",
    discordDesc: "Discord मा सूचनाहरू प्राप्त गर्नुहोस्।",
    connected: "जोडिएको", notConnected: "जोडिएको छैन", connectedOn: "जोडिएको मिति",
    disconnectConfirm: "प्रदायक डिस्कनेक्ट गर्ने?",
    disconnectDesc: "के तपाईं यस प्रदायकलाई डिस्कनेक्ट गर्न चाहनुहुन्छ? तपाईं यसलाई पछि फेरि जोड्न सक्नुहुन्छ।",
    mergeTitle: "खाता मर्ज गर्ने?",
    mergeDesc: "यस प्रदायकको इमेल पहिले नै अर्को खातासँग जोडिएको छ। मर्ज गर्दा प्रदायक तपाईंको हालको खातामा स्थानान्तरण हुनेछ।",
    mergeEmail: "इमेल",
    mergeButton: "खाता मर्ज गर्ने",
    cancelButton: "रद्द गर्ने",
    mergeSuccess: "खाता सफलतापूर्वक मर्ज भयो!",
    mergeCancelled: "मर्ज रद्द भयो।",
    noProviders: "कुनै प्रदायक कन्फिगर गरिएको छैन।",
    providerEmail: "इमेल",
  },
  security: {
    title: "सुरक्षा", subtitle: "बलियो सुरक्षाले आफ्नो खाता सुरक्षित गर्नुहोस्।",
    twoFactor: "दुई-कारक प्रमाणीकरण",
    twoFactorOn: "तपाईंको खाताका लागि दुई-कारक प्रमाणीकरण सक्षम छ।",
    twoFactorOff: "तपाईंको खाताका लागि दुई-कारक प्रमाणीकरण सक्षम छैन।",
    status: "स्थिति", enabled: "सक्षम", notEnabled: "सक्षम छैन", disable2fa: "2FA असक्षम गर्नुहोस्", enable2fa: "2FA सक्षम गर्नुहोस्",
    setupLoading: "2FA सेटअप लोड हुँदैछ...", setupTitle: "दुई-कारक प्रमाणीकरण सक्षम गर्नुहोस्",
    setupDesc: "यो QR कोड आफ्नो प्रमाणीकरण एपले स्क्यान गर्नुहोस्, अनि तलको कोड प्रविष्ट गर्नुहोस्।",
    key: "कुञ्जी", code: "कोड", copy: "प्रतिलिपि", enter6: "आफ्नो प्रमाणीकरण एपबाट ६ अंकको कोड प्रविष्ट गर्नुहोस्",
    verifyEnable: "2FA सक्षम गर्नुहोस्", verifying: "प्रमाणित हुँदैछ...", disableTitle: "दुई-कारक प्रमाणीकरण असक्षम गर्ने?",
    disableDesc: "यसले तपाईंको खाताबाट 2FA तुरुन्तै हटाउनेछ।", disabling: "असक्षम हुँदैछ...",
    backupTitle: "ब्याकअप कोडहरू", backupDesc: "यी कोडहरू सुरक्षित ठाउँमा राख्नुहोस्। प्रमाणीकरणमा पहुँच गुमाउनुभयो भने ती प्रयोग गरेर साइन इन गर्न सक्नुहुन्छ।",
    copyAll: "सबै प्रतिलिपि गर्नुहोस्", done: "भयो", copied: "प्रतिलिपि भयो!", password: "पासवर्ड", passwordLabel: "हालको पासवर्ड",
    changed: "पासवर्ड सफलतापूर्वक परिवर्तन भयो।", change: "परिवर्तन", changeTitle: "पासवर्ड परिवर्तन गर्नुहोस्", changeDesc: "आफ्नो वर्तमान र नयाँ पासवर्ड प्रविष्ट गर्नुहोस्।",
    current: "हालको पासवर्ड", new: "नयाँ पासवर्ड", confirm: "नयाँ पासवर्ड पुष्टि गर्नुहोस्",
    currentPh: "आफ्नो हालको पासवर्ड प्रविष्ट गर्नुहोस्", newPh: "नयाँ पासवर्ड प्रविष्ट गर्नुहोस्", confirmPh: "नयाँ पासवर्ड फेरि प्रविष्ट गर्नुहोस्",
    changePassword: "पासवर्ड परिवर्तन", pwdMismatch: "नयाँ पासवर्डहरू मेल खाँदैनन्।", failed: "केही गलत भयो। फेरि प्रयास गर्नुहोस्।",
    secondaryEmail: "रिकभरी इमेल", secondaryDesc: "लक आउट भएको अवस्थामा खाता रिकभर गर्न यो इमेल प्रयोग गर्नुहोस्।",
    noSecondaryEmail: "रिकभरी इमेल सेट गरिएको छैन", addEmail: "इमेल थप्नुहोस्", lastActive: "पछिल्लो गतिविधि",
    changeEmail: "इमेल परिवर्तन गर्नुहोस्", verifyEmail: "इमेल प्रमाणित गर्नुहोस्", newEmailLabel: "नयाँ इमेल", newEmailPh: "backup@example.com", sentTo: "हामीले {email} मा कोड पठायौं।",
    email: "इमेल", verified: "प्रमाणित", remove: "हटाउनुहोस्", sendCode: "कोड पठाउनुहोस्", sending: "पठाइँदैछ...",
    verify: "प्रमाणित गर्नुहोस्", enterCode: "आफ्नो इमेलमा पठाइएको कोड प्रविष्ट गर्नुहोस्", enterValidEmail: "मान्य इमेल ठेगाना प्रविष्ट गर्नुहोस्।",
    sendFailed: "कोड पठाउन असफल। फेरि प्रयास गर्नुहोस्।", enterCodeErr: "कोड प्रविष्ट गर्नुहोस्।", invalidCode: "अमान्य कोड। फेरि प्रयास गर्नुहोस्।",
    disable2faFailed: "2FA असक्षम गर्न असफल। फेरि प्रयास गर्नुहोस्।", activeSessions: "सक्रिय सत्रहरू",
    noActiveSessions: "कुनै सक्रिय सत्र छैन।", unknownDevice: "अज्ञात यन्त्र", loginHistory: "लगइन इतिहास",
    noLoginHistory: "कुनै हालिया लगइन छैन।", thStatus: "स्थिति", thDate: "मिति", thMethod: "विधि",
    thIpDevice: "IP / यन्त्र", success: "सफल", failedStart: "असफल",
  },
  privacy: {
    title: "गोपनीयता", subtitle: "तपाईंको डेटा कसरी प्रयोग हुन्छ नियन्त्रण गर्नुहोस्।",
    dataAnalytics: "डेटा र विश्लेषण", analytics: "विश्लेषण", analyticsDesc: "प्रयोग डेटा साझा गरेर Tirbeo लाई सुधार्न मद्दत गर्नुहोस्।",
    crashReports: "क्र्यास रिपोर्टहरू", crashReportsDesc: "केही बिग्रिएको बेला त्रुटि रिपोर्ट स्वतः पठाउनुहोस्।",
    personalizedRecs: "व्यक्तिगत सिफारिसहरू", personalizedRecsDesc: "सिफारिसहरू मिलाउन गतिविधि प्रयोग गर्नुहोस्।",
    discoverability: "खोज योग्यता", discoverabilityDesc: "अरूले तपाईंलाई कसरी भेट्टाउन सक्छन् नियन्त्रण गर्नुहोस्।",
    searchEngine: "सर्च इन्जिनहरू", searchEngineDesc: "सर्च इन्जिनहरूलाई तपाईंको सार्वजनिक प्रोफाइल अनुक्रमणिका गर्न अनुमति दिनुहोस्।",
    directory: "निर्देशिका", directoryDesc: "Tirbeo निर्देशिकामा आफ्नो प्रोफाइल देखाउनुहोस्।",
    dataExport: "डेटा निर्यात", dataExportDesc: "आफ्नो खातामा भण्डारण भएका सबै कुराको प्रतिलिपि डाउनलोड गर्नुहोस्।",
    preparing: "निर्यात तयार हुँदैछ...", exportData: "डेटा निर्यात गर्नुहोस्",
    exportNote: "तयार भएपछि तपाईंलाई इमेलमा डाउनलोड लिंक प्राप्त हुनेछ।",
    dangerZone: "खतरनाक क्षेत्र", dangerZoneDesc: "उल्टाउन नसकिने स्थायी कार्यहरू।",
    deleteAccount: "खाता हटाउनुहोस्", irreversible: "यो कार्य स्थायी र अपरिवर्तनीय छ। सबै डेटा मेटिनेछ।",
    typeDelete: "पुष्टि गर्न 'delete' टाइप गर्नुहोस्।", typeDeletePh: "पुष्टि गर्न delete टाइप गर्नुहोस्", deleting: "मेटिँदैछ...",
  },
  profile: {
    title: "प्रोफाइल", subtitle: "मानिसहरूलाई आफ्नो बारेमा थोरै बताउनुहोस्।", saveChanges: "परिवर्तनहरू सेभ गर्नुहोस्", noNameSet: "नाम सेट गरिएको छैन",
    personal: "व्यक्तिगत जानकारी", work: "काम", links: "लिंकहरू", fullName: "पूरा नाम", fullNamePh: "तपाईंको पूरा नाम",
    username: "प्रयोगकर्ता नाम", usernamePh: "तपाईंको-प्रयोगकर्ता-नाम", bio: "परिचय", bioPh: "तपाईं के गर्नुहुन्छ भनी मानिसहरूलाई बताउनुहोस्...",
    gender: "लिङ्ग", selectOption: "एउटा विकल्प छान्नुहोस्", male: "पुरुष", female: "महिला", other: "अन्य", preferNot: "भन्न चाहँदिनँ",
    birthday: "जन्मदिन", country: "देश", countryPh: "आफ्नो देश छान्नुहोस्", occupation: "पेशा",
    occupationPh: "जस्तै सफ्टवेयर इन्जिनियर", company: "कम्पनी", companyPh: "तपाईंको कम्पनी", role: "भूमिका", rolePh: "तपाईंको भूमिका",
    roleAtCompanyPh: "कम्पनीमा तपाईंको भूमिका", industry: "उद्योग", industryPh: "जस्तै प्रविधि",
    companySize: "कम्पनीको आकार", justMe: "केवल म", website: "वेबसाइट", websitePh: "https://yoursite.com", linkedin: "LinkedIn", linkedinPh: "linkedin.com/in/username", github: "GitHub", githubPh: "github प्रयोगकर्ता नाम", twitter: "Twitter / X", twitterPh: "@प्रयोगकर्ता नाम", accountInfo: "खाता जानकारी", email: "इमेल",
    recoveryEmail: "रिकभरी इमेल", memberSince: "सदस्य देखि", lastActive: "पछिल्लो गतिविधि",
    connectedAccounts: "जोडिएका खाताहरू", noneConnected: "कुनै खाता जोडिएको छैन।", verified: "प्रमाणित", unverified: "प्रमाणित नगरिएको",
  },
  history: {
    title: "गतिविधि इतिहास", subtitle: "सुरक्षा र खाता घटनाहरूको अभिलेख।",
    noActivity: "अहिलेसम्म कुनै गतिविधि छैन", noActivityDesc: "तपाईंले गरेका कार्यहरू यहाँ देखिनेछन्।",
    act: {
      login: "साइन इन गरियो", logout: "साइन आउट गरियो", signup: "खाता सिर्जना भयो", passwordChanged: "पासवर्ड परिवर्तन भयो",
      profileUpdated: "प्रोफाइल अद्यावधिक भयो", twofaEnabled: "2FA सक्षम भयो", twofaDisabled: "2FA असक्षम भयो",
      sessionRevoked: "सत्रहरू साइन आउट भए", emailVerified: "इमेल प्रमाणित भयो", accountDeleted: "खाता मेटियो",
      dataExported: "डेटा निर्यात भयो", notificationRead: "सूचना पढियो", ticketCreated: "टिकट सिर्जना भयो",
      ticketReplied: "टिकटको उत्तर दिइयो", ticketClosed: "टिकट बन्द भयो", unknown: "गतिविधि",
    },
  },
  tickets: {
    title: "टिकटहरू", countOne: "{n} टिकट", countMany: "{n} टिकटहरू", newTicket: "नयाँ टिकट",
    noTickets: "अहिलेसम्म कुनै टिकट छैन", noTicketsDesc: "हाम्रो सहयोग टोलीबाट मद्दत पाउन टिकट बनाउनुहोस्।",
    createTicket: "टिकट बनाउनुहोस्", subject: "विषय", subjectPh: "तपाईंको समस्याको संक्षिप्त विवरण",
    category: "श्रेणी", priority: "प्राथमिकता", message: "सन्देश", messagePh: "आफ्नो समस्याको विस्तृत वर्णन गर्नुहोस्...",
    describeIssue: "आफ्नो समस्या वर्णन गर्नुहोस्, हामी तपाईंसँग सम्पर्क गर्नेछौं।", cancel: "रद्द गर्नुहोस्", creating: "बनाइँदैछ...",
    catGeneral: "सामान्य", catBug: "बग रिपोर्ट", catFeature: "फिचर अनुरोध", catBilling: "बिलिङ",
    catOther: "अन्य", catAccount: "खाता", prioLow: "कम", prioNormal: "सामान्य", prioHigh: "उच्च", prioUrgent: "तत्काल",
    statusOpen: "खुला", statusClosed: "बन्द", statusInProgress: "प्रगति हुँदै", priorityLabel: "{priority} प्राथमिकता",
  },
  ticketDetail: {
    notFound: "टिकट फेला परेन।", backToTickets: "टिकटहरूमा फर्कनुहोस्",
    noMessages: "अहिलेसम्म कुनै सन्देश छैन। तल कुराकानी सुरु गर्नुहोस्।", you: "तपाईं", support: "सहयोग",
    supportTeam: "सहायता टोली", sendHint: "पठाउन Enter · नयाँ लाइनको लागि Shift+Enter",
    writeReply: "उत्तर लेख्नुहोस्...", send: "पठाउनुहोस्",
  },
  newTicket: {
    title: "नयाँ टिकट", subtitle: "आफ्नो समस्या वर्णन गर्नुहोस्, हामी तपाईंसँग सम्पर्क गर्नेछौं।",
    backToTickets: "टिकटहरूमा फर्कनुहोस्", subject: "विषय", subjectPh: "आफ्नो समस्याको संक्षिप्त सारांश...",
    category: "श्रेणी", priority: "प्राथमिकता", message: "सन्देश",
    messagePh: "आफ्नो समस्याको विस्तृत वर्णन गर्नुहोस्। बग भए पुनरुत्पादनका चरणहरू, वा फिचर अनुरोध भए आफ्नो प्रयोग अवस्था समावेश गर्नुहोस्...",
    countLabel: "{n} / 20,000", ctrlEnter: "पेश गर्न ⌘ + Enter थिच्नुहोस्", cancel: "रद्द गर्नुहोस्", creating: "बनाइँदैछ...",
    submitTicket: "टिकट पेश गर्नुहोस्", requiredError: "विषय र सन्देश आवश्यक छन्।",
    createFailed: "टिकट बनाउन असफल। फेरि प्रयास गर्नुहोस्।",
    catGeneral: "सामान्य", catGeneralDesc: "सामान्य प्रश्न वा प्रतिक्रिया", catBug: "बग रिपोर्ट",
    catBugDesc: "केही ठीकसँग काम गरिरहेको छैन", catFeature: "फिचर अनुरोध",
    catFeatureDesc: "नयाँ सुविधा वा सुधार सुझाव दिनुहोस्", catAccount: "खाता",
    catAccountDesc: "तपाईंको खाता वा प्रोफाइलका समस्याहरू", catBilling: "बिलिङ",
    catBillingDesc: "भुक्तानी, इनभ्वाइस वा सदस्यता", catOther: "अन्य", catOtherDesc: "अरू केही",
    prioLow: "कम", prioLowDesc: "हतार छैन", prioNormal: "सामान्य", prioNormalDesc: "मानक प्रतिक्रिया समय",
    prioHigh: "उच्च", prioHighDesc: "चाँडै ध्यान चाहिन्छ", prioUrgent: "तत्काल", prioUrgentDesc: "गम्भीर समस्या",
  },
  notifTexts: {
    "Sessions signed out": "सत्रहरू साइन आउट भए",
    "Signed in to your account": "तपाईंको खातामा साइन इन गरियो",
    "New login from {device}": "{device} बाट नयाँ लगइन",
    "All other sessions were signed out for your account.": "तपाईंको खाताका अन्य सबै सत्रहरू साइन आउट गरिए।",
    "Session signed out": "सत्र साइन आउट भयो",
    "One of your sessions was signed out.": "तपाईंको एउटा सत्र साइन आउट गरियो।",
    "Two-step verification enabled": "दुई-चरणीय प्रमाणीकरण सक्षम भयो",
    "Authenticator app two-factor is now active on your account.": "तपाईंको खातामा प्रमाणीकरण एप दुई-कारक अब सक्रिय छ।",
    "Two-step verification disabled": "दुई-चरणीय प्रमाणीकरण असक्षम भयो",
    "Two-factor authentication was turned off for your account.": "तपाईंको खाताका लागि दुई-कारक प्रमाणीकरण बन्द गरियो।",
    "Recovery email verified": "रिकभरी इमेल प्रमाणित भयो",
    "recoveryEmailBody": "तपाईंको रिकभरी इमेल({email}) पुष्टि भयो।",
  },
};

const DICTS: Record<string, Dict> = { en, es, fr, de, ja, ko, zh, hi, ne };

export const LANG_STORAGE_KEY = "tb_lang";

export { SUPPORTED_LANGS, LOCALES, isSupportedLang } from "@/lib/locales";

export function resolveKey(dict: Dict, path: string): string | undefined {
  const parts = path.split(".");
  let node: unknown = dict;
  for (const part of parts) {
    if (node == null || typeof node !== "object") return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

export function translateNotifText(text: string, lang: string): string {
  if (!text) return text;
  const dict = DICTS[lang] ?? en;
  const table = (dict as Dict).notifTexts ?? {};
  if (typeof table[text] === "string") return table[text];
  for (const [template, translation] of Object.entries(table)) {
    if (!template.includes("{")) continue;
    const esc = template.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp("^" + esc.replace(/\\\{\w+\\\}/g, "(.+)") + "$");
    const m = text.match(regex);
    if (m) {
      const params: string[] = [];
      template.replace(/\{(\w+)\}/g, (_, k: string) => {
        params.push(k);
        return "";
      });
      const vars: Record<string, string> = {};
      params.forEach((k, i) => {
        vars[k] = m[i + 1];
      });
      return interpolate(translation, vars);
    }
  }
  return text;
}

export type I18nT = (key: string, vars?: Record<string, string | number>) => string;

interface I18nContextValue {
  lang: string;
  t: I18nT;
  setLang: (lang: string) => void;
  syncLangFromProfile: (lang?: string | null) => void;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "en",
  t: (key) => key,
  setLang: () => {},
  syncLangFromProfile: () => {},
});

function applyDomLang(lang: string) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.setAttribute("data-lang", lang);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
      if (isSupportedLang(stored)) {
        setLangState(stored);
        applyDomLang(stored);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setLang = useCallback((next: string) => {
    if (!isSupportedLang(next)) return;
    setLangState(next);
    applyDomLang(next);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const syncLangFromProfile = useCallback(
    (profileLang?: string | null) => {
      if (isSupportedLang(profileLang)) setLang(profileLang);
    },
    [setLang],
  );

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const dict = DICTS[lang] ?? en;
      const fallback = resolveKey(en, key);
      const resolved = resolveKey(dict, key) ?? fallback;
      if (resolved === undefined) return key;
      return interpolate(resolved, vars);
    },
    [lang],
  );

  return (
    <I18nContext.Provider value={{ lang, t, setLang, syncLangFromProfile }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
