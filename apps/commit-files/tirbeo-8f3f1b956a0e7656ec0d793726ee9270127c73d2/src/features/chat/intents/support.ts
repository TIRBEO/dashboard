import type { Intent } from './types';

export const SUPPORT_INTENTS: Intent[] = [
  // ── General Support ──
  {
    patterns: [/support\b/i, /help\b/i, /customer support\b/i, /help center\b/i, /help desk\b/i],
    reply: "I'm here to help with Tirbeo questions. For account-specific issues, please visit our support page or contact support directly.",
  },
  {
    patterns: [/contact\b/i, /contact support\b/i, /contact us\b/i, /reach out\b/i, /get in touch\b/i, /email support\b/i],
    reply: "You can reach out to Tirbeo support through official channels for account-specific help.",
  },
  {
    patterns: [/faq\b/i, /frequently asked\b/i, /common questions\b/i, /common issues\b/i],
    reply: "Check the Tirbeo FAQ page for answers to common questions. For specific issues, I'm here to help.",
  },
  {
    patterns: [/documentation\b/i, /docs\b/i, /guide\b/i, /manual\b/i, /help article\b/i, /tutorial\b/i],
    reply: "Tirbeo's documentation and guides are available on the official website for detailed information.",
  },
  {
    patterns: [/report a bug\b/i, /bug report\b/i, /file a bug\b/i, /report issue\b/i, /something is broken\b/i],
    reply: "To report a bug, use the official bug reporting channels. Include details about what happened and what you expected.",
  },
  {
    patterns: [/feature request\b/i, /request feature\b/i, /suggest feature\b/i, /wish list\b/i, /want feature\b/i],
    reply: "Feature requests are welcome! Share your ideas through official Tirbeo channels.",
  },
  {
    patterns: [/feedback\b/i, /suggestion\b/i, /improvement\b/i, /idea\b/i, /suggest\b/i],
    reply: "We love hearing feedback! Share your ideas through official Tirbeo channels or community forums.",
  },

  // ── Login & Account Issues ──
  {
    patterns: [/can't log in\b/i, /cant log in\b/i, /unable to log in\b/i, /login failed\b/i, /login not working\b/i, /can't sign in\b/i, /won't let me log in\b/i],
    reply: "Try resetting your password. If that doesn't work, clear your browser cache and cookies, then try again.",
  },
  {
    patterns: [/forgot password\b/i, /reset password\b/i, /password reset\b/i, /forgot my password\b/i, /lost password\b/i, /can't access account\b/i],
    reply: "You can reset your password through the login page. Check your email for the reset link.",
  },
  {
    patterns: [/email not received\b/i, /didn't receive email\b/i, /no email\b/i, /verification email\b/i, /check email\b/i, /email not arriving\b/i],
    reply: "Check your spam or junk folder. If still not found, try requesting a new verification email.",
  },
  {
    patterns: [/account locked\b/i, /account disabled\b/i, /account suspended\b/i, /account banned\b/i, /can't access\b/i],
    reply: "If your account has been restricted, you can contact support for more information.",
  },
  {
    patterns: [/verification failed\b/i, /verify failed\b/i, /can't verify\b/i, /verification error\b/i],
    reply: "Try requesting a new verification link. If issues persist, contact support.",
  },

  // ── Technical Issues ──
  {
    patterns: [/page not loading\b/i, /won't load\b/i, /loading\b/i, /blank page\b/i, /white screen\b/i, /black screen\b/i],
    reply: "Try refreshing the page, clearing your browser cache, or using a different browser.",
  },
  {
    patterns: [/slow\b/i, /laggy\b/i, /lagging\b/i, /slow loading\b/i, /performance\b/i, /buffering\b/i],
    reply: "Try clearing your browser cache, closing other tabs, or checking your internet connection.",
  },
  {
    patterns: [/crash\b/i, /crashing\b/i, /app crash\b/i, /keeps crashing\b/i, /freeze\b/i, /freezing\b/i, /frozen\b/i],
    reply: "Try force-closing and reopening. If the issue persists, clear your cache or try a different browser.",
  },
  {
    patterns: [/not working\b/i, /broken\b/i, /something wrong\b/i, /something is wrong\b/i, /is it down\b/i, /is tirbeo down\b/i, /outage\b/i, /down\b/i, /server down\b/i],
    reply: "If you're experiencing issues, try refreshing the page or clearing your browser cache. Check official channels for any known outages.",
  },
  {
    patterns: [/error message\b/i, /error code\b/i, /got an error\b/i, /seeing error\b/i, /error screen\b/i],
    reply: "Try refreshing the page or clearing your browser cache. If the error persists, note the error message and contact support.",
  },
  {
    patterns: [/browser not supported\b/i, /unsupported browser\b/i, /which browser\b/i, /best browser\b/i, /chrome\b/i, /firefox\b/i, /safari\b/i, /edge\b/i],
    reply: "Tirbeo works best on modern browsers like Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date.",
  },
  {
    patterns: [/mobile not working\b/i, /mobile issue\b/i, /phone issue\b/i, /app issue\b/i, /mobile app not working\b/i],
    reply: "Try updating to the latest version of the app or use the web version as an alternative.",
  },
  {
    patterns: [/clear cache\b/i, /clear cookies\b/i, /browser cache\b/i, /cache\b/i, /cookies\b/i],
    reply: "Clearing your browser cache and cookies can resolve many issues. Check your browser's settings for instructions.",
  },
  {
    patterns: [/incognito\b/i, /private browsing\b/i, /private window\b/i],
    reply: "Try opening Tirbeo in an incognito/private window to rule out browser extension or cache issues.",
  },
  {
    patterns: [/extension\b/i, /browser extension\b/i, /ad blocker\b/i, /ublock\b/i, /vpn\b/i, /proxy\b/i],
    reply: "Browser extensions like ad blockers or VPNs can sometimes interfere. Try disabling them temporarily.",
  },

  // ── Chat Issues ──
  {
    patterns: [/chat not working\b/i, /chat broken\b/i, /can't send message\b/i, /message not sending\b/i, /send button not working\b/i],
    reply: "Try refreshing the page. If the issue persists, check your internet connection and clear your browser cache.",
  },
  {
    patterns: [/message not appearing\b/i, /message missing\b/i, /can't see message\b/i, /message not showing\b/i],
    reply: "Try scrolling or refreshing. Messages may take a moment to appear depending on your connection.",
  },
  {
    patterns: [/typing indicator\b/i, /typing not showing\b/i, /typing stuck\b/i],
    reply: "Typing indicators depend on your connection. Try refreshing if they seem stuck.",
  },
  {
    patterns: [/can't load chat\b/i, /chat history missing\b/i, /lost chat history\b/i, /chat disappeared\b/i],
    reply: "Chat history is stored locally. If you cleared your browser data, the history may have been removed.",
  },
  {
    patterns: [/notification not working\b/i, /not getting notifications\b/i, /missed notification\b/i, /no alerts\b/i],
    reply: "Check your notification settings and browser permissions to make sure alerts are enabled.",
  },

  // ── Community Issues ──
  {
    patterns: [/can't join community\b/i, /join failed\b/i, /unable to join\b/i, /community not found\b/i],
    reply: "Make sure you're logged in and the community link is correct. If the community is private, you may need an invitation.",
  },
  {
    patterns: [/can't post\b/i, /post failed\b/i, /unable to post\b/i, /posting not working\b/i, /can't comment\b/i],
    reply: "Make sure you're a member of the community and your account is in good standing. Try refreshing the page.",
  },
  {
    patterns: [/moderation issue\b/i, /wrongly banned\b/i, /unfair ban\b/i, /moderator abuse\b/i, /unfair moderation\b/i],
    reply: "If you believe a moderation action was unfair, you can appeal through official support channels.",
  },
  {
    patterns: [/spam in community\b/i, /spam\b/i, /scam\b/i, /suspicious link\b/i, /fake account\b/i],
    reply: "Please report spam, scams, or suspicious accounts through the report feature to keep the community safe.",
  },

  // ── Data & Privacy Issues ──
  {
    patterns: [/delete my data\b/i, /data deletion\b/i, /forget me\b/i, /gdpr request\b/i, /right to be forgotten\b/i],
    reply: "You have the right to delete your data. Go to account settings to request data deletion, or contact support.",
  },
  {
    patterns: [/download my data\b/i, /export data\b/i, /data export\b/i, /get my data\b/i, /data portability\b/i],
    reply: "Data export features will allow you to download your content and data from Tirbeo.",
  },
  {
    patterns: [/privacy concern\b/i, /data breach\b/i, /security issue\b/i, /unauthorized access\b/i, /account hacked\b/i],
    reply: "If you suspect unauthorized access, change your password immediately and enable two-factor authentication. Report the issue to support.",
  },

  // ── Subscription & Billing ──
  {
    patterns: [/billing\b/i, /invoice\b/i, /payment\b/i, /charge\b/i, /refund\b/i, /cancel subscription\b/i],
    reply: "For billing inquiries, please visit the Tirbeo support page or contact support directly.",
  },
  {
    patterns: [/upgrade\b/i, /downgrade\b/i, /change plan\b/i, /switch plan\b/i],
    reply: "For plan changes, please visit your account settings or contact support.",
  },

  // ── How-To ──
  {
    patterns: [/how do i\b/i, /how to\b/i, /can i\b/i, /is it possible\b/i, /where do i\b/i, /where can i\b/i, /what is the way\b/i],
    reply: "I'd be happy to help! Can you tell me more about what you're trying to do?",
  },
  {
    patterns: [/where is\b/i, /where are\b/i, /how do i find\b/i, /where can i find\b/i, /locate\b/i],
    reply: "Check your account settings or the main navigation. What specifically are you looking for?",
  },
  {
    patterns: [/is there a way\b/i, /can you\b/i, /do you support\b/i, /does tirbeo\b/i, /is it possible to\b/i],
    reply: "I'd be happy to help! Can you tell me more about what you need?",
  },
];
