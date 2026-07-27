import type { Intent } from './types';

export const ACCOUNT_INTENTS: Intent[] = [
  // ── Account Basics ──
  {
    patterns: [/create account\b/i, /sign up\b/i, /register\b/i, /new account\b/i, /how to sign up\b/i, /how to join\b/i],
    reply: "You can join the Tirbeo waitlist to receive updates and early access when invitations become available.",
  },
  {
    patterns: [/delete account\b/i, /close account\b/i, /deactivate account\b/i, /remove account\b/i],
    reply: "You can delete your account through your account settings. This action may be irreversible.",
  },
  {
    patterns: [/change email\b/i, /update email\b/i, /email address\b/i, /different email\b/i],
    reply: "You can update your email address in your account settings.",
  },
  {
    patterns: [/verify email\b/i, /email verification\b/i, /verify my email\b/i, /confirmation email\b/i, /didn't get email\b/i],
    reply: "Check your spam folder if you didn't receive the verification email. You can also request a new verification link.",
  },

  // ── Password ──
  {
    patterns: [/forgot password\b/i, /reset password\b/i, /change password\b/i, /password reset\b/i, /forgot my password\b/i, /lost password\b/i, /can't log in\b/i, /cant log in\b/i, /unable to login\b/i],
    reply: "You can reset your password through the login page. Check your email for the reset link.",
  },
  {
    patterns: [/password requirements\b/i, /password strength\b/i, /password rules\b/i, /minimum password\b/i, /password length\b/i],
    reply: "Use a strong password with a mix of letters, numbers, and symbols for best security.",
  },

  // ── Login ──
  {
    patterns: [/login\b/i, /log in\b/i, /sign in\b/i, /how to log in\b/i, /can't log in\b/i, /unable to log in\b/i, /login problem\b/i, /login issue\b/i],
    reply: "You can log in through the Tirbeo login page. If you're having issues, try resetting your password.",
  },
  {
    patterns: [/google login\b/i, /sign in with google\b/i, /google sign in\b/i, /google oauth\b/i, /gmail\b/i],
    reply: "You can sign in using your Google account for a quick and secure login.",
  },
  {
    patterns: [/apple login\b/i, /sign in with apple\b/i, /apple sign in\b/i],
    reply: "Apple Sign-In may be available as a login option on supported platforms.",
  },
  {
    patterns: [/sso\b/i, /single sign.on\b/i, /enterprise login\b/i, /saml\b/i],
    reply: "SSO (Single Sign-On) features may be available for enterprise accounts. Details will be announced officially.",
  },
  {
    patterns: [/logout\b/i, /log out\b/i, /sign out\b/i, /how to log out\b/i],
    reply: "You can log out from your account settings or the navigation menu.",
  },

  // ── Profile ──
  {
    patterns: [/edit profile\b/i, /update profile\b/i, /profile settings\b/i, /change profile\b/i, /my profile\b/i],
    reply: "You can edit your profile from your account settings to update your name, bio, and other details.",
  },
  {
    patterns: [/username\b/i, /change username\b/i, /username available\b/i, /username taken\b/i, /handle\b/i, /display name\b/i],
    reply: "Your username is your unique identity on Tirbeo. You can set it in your profile settings.",
  },
  {
    patterns: [/avatar\b/i, /profile picture\b/i, /profile photo\b/i, /change picture\b/i, /upload photo\b/i, /profile image\b/i],
    reply: "You can upload and change your profile picture in your profile settings.",
  },
  {
    patterns: [/bio\b/i, /about me\b/i, /description\b/i, /profile bio\b/i, /personal info\b/i],
    reply: "You can add a bio to your profile to share a bit about yourself with the community.",
  },

  // ── Notifications ──
  {
    patterns: [/notification\b/i, /notifications\b/i, /alert\b/i, /alerts\b/i, /push notification\b/i, /notification settings\b/i],
    reply: "You can manage your notification preferences in your account settings to control what alerts you receive.",
  },
  {
    patterns: [/email notification\b/i, /email alerts\b/i, /stop email\b/i, /unsubscribe email\b/i],
    reply: "You can adjust your email notification preferences in your account settings.",
  },
  {
    patterns: [/mute notification\b/i, /turn off notification\b/i, /disable notification\b/i, /no notification\b/i, /quiet hours\b/i],
    reply: "You can mute or customize notifications in your account settings to reduce interruptions.",
  },

  // ── Privacy Settings ──
  {
    patterns: [/who can see my profile\b/i, /profile visibility\b/i, /who can find me\b/i, /profile public\b/i, /private profile\b/i],
    reply: "You can control who can see your profile through your privacy settings.",
  },
  {
    patterns: [/who can message me\b/i, /messaging permissions\b/i, /who can dm\b/i, /message settings\b/i],
    reply: "You can control who can message you through your messaging and privacy settings.",
  },
  {
    patterns: [/online status\b/i, /show online\b/i, /visible online\b/i, /appear offline\b/i, /invisible\b/i],
    reply: "You can control your online visibility in your privacy settings.",
  },

  // ── Connected Accounts ──
  {
    patterns: [/connect account\b/i, /linked accounts\b/i, /social accounts\b/i, /twitter\b/i, /github\b/i, /linkedin\b/i, /link account\b/i],
    reply: "You can link your social accounts in your settings to showcase your online presence.",
  },

  // ── Sessions & Devices ──
  {
    patterns: [/active sessions\b/i, /logged in devices\b/i, /session management\b/i, /device\b/i, /devices\b/i, /mobile device\b/i],
    reply: "You can view and manage your active sessions in your account settings.",
  },
  {
    patterns: [/two factor\b/i, /2fa\b/i, /enable 2fa\b/i, /setup 2fa\b/i, /two-factor authentication\b/i],
    reply: "Two-factor authentication adds an extra layer of security. You can enable it in your security settings.",
  },

  // ── Account Issues ──
  {
    patterns: [/account locked\b/i, /account suspended\b/i, /account banned\b/i, /account disabled\b/i, /account restricted\b/i],
    reply: "If your account has been restricted, you can contact support for more information.",
  },
  {
    patterns: [/can't verify\b/i, /verification failed\b/i, /email not verified\b/i, /phone verification\b/i],
    reply: "Try requesting a new verification link. If issues persist, contact support.",
  },
  {
    patterns: [/error\b/i, /bug\b/i, /glitch\b/i, /crash\b/i, /something went wrong\b/i],
    reply: "Try refreshing the page or clearing your browser cache. If the issue persists, please report it.",
  },

  // ── Age & Eligibility ──
  {
    patterns: [/minimum age\b/i, /age requirement\b/i, /how old\b/i, /age limit\b/i, /must be \d+\b/i, /under 13\b/i, /kids\b/i],
    reply: "Tirbeo has age requirements in compliance with applicable laws. Check our terms of service for details.",
  },
];
