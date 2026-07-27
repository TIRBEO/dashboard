import type { Intent } from './types';

export const PRIVACY_INTENTS: Intent[] = [
  // ── Core Privacy ──
  {
    patterns: [/privacy\b/i, /private\b/i, /privacy policy\b/i, /how private\b/i, /privacy first\b/i],
    reply: "Tirbeo is built with privacy at its core. Your data, conversations, and connections are designed to stay under your control.",
  },
  {
    patterns: [/private by default\b/i, /default privacy\b/i, /privacy by default\b/i, /privacy by design\b/i],
    reply: "Tirbeo is privacy-first by design — your data is protected from the ground up, not as an afterthought.",
  },
  {
    patterns: [/privacy settings\b/i, /privacy controls\b/i, /privacy options\b/i, /control privacy\b/i],
    reply: "You have control over your privacy settings on Tirbeo, including who can see your profile and message you.",
  },

  // ── Encryption ──
  {
    patterns: [/encrypt\b/i, /encryption\b/i, /end.to.end\b/i, /e2e\b/i, /e2ee\b/i, /encrypted\b/i, /secure\b/i],
    reply: "Every message is end-to-end encrypted by default — only you and who you choose can read it.",
  },
  {
    patterns: [/how does encryption work\b/i, /encryption details\b/i, /what encryption\b/i, /encryption standard\b/i],
    reply: "Tirbeo uses end-to-end encryption to ensure only you and the intended recipients can read your messages.",
  },
  {
    patterns: [/tls\b/i, /ssl\b/i, /https\b/i, /certificate\b/i],
    reply: "Tirbeo uses industry-standard security protocols to protect your data in transit.",
  },

  // ── Data ──
  {
    patterns: [/data ownership\b/i, /own my data\b/i, /my data\b/i, /data is mine\b/i, /data control\b/i],
    reply: "Tirbeo is designed around data ownership — your content, conversations, and libraries are yours.",
  },
  {
    patterns: [/data collection\b/i, /what data do you collect\b/i, /what data\b/i, /collected data\b/i, /data you collect\b/i],
    reply: "Tirbeo collects only the data necessary to provide the service. Details are in our privacy policy.",
  },
  {
    patterns: [/data sharing\b/i, /share data\b/i, /sell data\b/i, /third party\b/i, /sell my data\b/i],
    reply: "Tirbeo does not sell your data to advertisers or third parties.",
  },
  {
    patterns: [/delete my data\b/i, /delete account\b/i, /remove my data\b/i, /data deletion\b/i, /right to delete\b/i, /forget me\b/i, /gdpr\b/i],
    reply: "You have the right to delete your data and account. Data deletion requests can be made through your account settings.",
  },
  {
    patterns: [/data export\b/i, /export my data\b/i, /download my data\b/i, /data portability\b/i, /take my data\b/i],
    reply: "Data portability features will allow you to export your content and data from Tirbeo.",
  },

  // ── Ads & Tracking ──
  {
    patterns: [/ad\b/i, /ads\b/i, /advertis/i, /tracking\b/i, /tracker\b/i, /pixel\b/i, /cookie\b/i],
    reply: "Tirbeo is designed without invasive tracking or targeted advertising. Your browsing habits are not sold to advertisers.",
  },
  {
    patterns: [/sell ads\b/i, /run ads\b/i, /ad model\b/i, /ad revenue\b/i, /advertising model\b/i],
    reply: "Tirbeo's business model does not rely on selling your attention or data to advertisers.",
  },
  {
    patterns: [/algorithm\b/i, /manipulate\b/i, /manipulation\b/i, /feed algorithm\b/i, /social manipulation\b/i],
    reply: "No algorithm sorting your friends. You see the people you want to hear from, in order.",
  },

  // ── Account Security ──
  {
    patterns: [/password\b/i, /change password\b/i, /forgot password\b/i, /reset password\b/i, /forgot my password\b/i, /password reset\b/i],
    reply: "You can reset your password through the login page. If you're having trouble, check your email for the reset link.",
  },
  {
    patterns: [/two factor\b/i, /2fa\b/i, /two.factor authentication\b/i, /mfa\b/i, /multi.factor\b/i, /authenticator\b/i, /totp\b/i],
    reply: "Two-factor authentication adds an extra layer of security to your account.",
  },
  {
    patterns: [/login activity\b/i, /active sessions\b/i, /session\b/i, /sessions\b/i, /logged in on\b/i, /device activity\b/i],
    reply: "You can view and manage your active sessions in your account settings.",
  },
  {
    patterns: [/hack\b/i, /hacked\b/i, /compromised\b/i, /breach\b/i, /security incident\b/i, /unauthorized access\b/i],
    reply: "If you suspect your account is compromised, change your password immediately and enable two-factor authentication.",
  },

  // ── Moderation ──
  {
    patterns: [/report user\b/i, /report\b/i, /flag user\b/i, /flag content\b/i, /inappropriate\b/i, /harassment\b/i, /abuse\b/i, /spam\b/i],
    reply: "You can report inappropriate content or behavior. Tirbeo takes community safety seriously.",
  },
  {
    patterns: [/block user\b/i, /block\b/i, /blocked\b/i, /mute user\b/i, /mute\b/i, /muted\b/i],
    reply: "You can block or mute users to control your experience and maintain your comfort.",
  },
  {
    patterns: [/safety\b/i, /safe\b/i, /security\b/i, /safe space\b/i],
    reply: "Tirbeo is committed to creating a safe environment with moderation, reporting tools, and community guidelines.",
  },

  // ── Community Privacy ──
  {
    patterns: [/public community\b/i, /private community\b/i, /community privacy\b/i, /invite only\b/i, /open community\b/i, /closed community\b/i],
    reply: "Communities can have different privacy settings — from fully public to invite-only.",
  },
  {
    patterns: [/anonymous\b/i, /anonymous posting\b/i, /anonymous user\b/i, /anonymous account\b/i],
    reply: "Tirbeo supports authentic interactions. Anonymous features may be available in certain contexts.",
  },

  // ── Transparency ──
  {
    patterns: [/transparency\b/i, /transparent\b/i, /open about\b/i, /honest\b/i],
    reply: "Tirbeo is committed to transparency about how the platform works and how data is handled.",
  },
  {
    patterns: [/audit\b/i, /third.party audit\b/i, /security audit\b/i, /penetration test\b/i],
    reply: "I don't have confirmed information about third-party security audits yet.",
  },

  // ── Misc Security ──
  {
    patterns: [/vpn\b/i, /ip address\b/i, /location tracking\b/i, /geolocation\b/i, /gps\b/i],
    reply: "Tirbeo is designed to minimize unnecessary data collection, including location information.",
  },
  {
    patterns: [/metadata\b/i, /read receipts\b/i, /online status\b/i, /last seen\b/i],
    reply: "Tirbeo gives you control over what information is visible to others, including online status and read receipts.",
  },
  {
    patterns: [/compliance\b/i, /regulation\b/i, /legal\b/i, /law enforcement\b/i, /government\b/i, /subpoena\b/i],
    reply: "For legal and compliance inquiries, please refer to Tirbeo's official legal documentation and policies.",
  },
  {
    patterns: [/zero knowledge\b/i, /zero.knowledge\b/i, /don't store\b/i, /don't store my messages\b/i],
    reply: "Tirbeo's end-to-end encryption means your messages are designed so that only you and your intended recipients can read them.",
  },
];
