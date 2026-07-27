import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig } from '../lib/config';

export class DashboardCommand extends BaseCommand {
  constructor() {
    super('dashboard', 'Terminal dashboard overview');
    this.cmd.action(() => this.execute());
  }

  async execute() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading dashboard...', color: 'cyan' }).start();
    try {
      const [profileRes, passkeysRes, sessionsRes, activityRes] = await Promise.all([
        apiGet('/api/users/me'),
        apiGet('/api/passkey/list'),
        apiGet('/api/security/sessions'),
        apiGet('/api/user/activity?limit=5'),
      ]);
      s.stop();

      const p = profileRes.ok ? profileRes.data : {};
      const passkeys = passkeysRes.ok ? (passkeysRes.data?.passkeys || []) : [];
      const sessions = sessionsRes.ok ? (sessionsRes.data?.sessions || []) : [];
      const events = activityRes.ok ? (activityRes.data?.events || []) : [];

      console.log('');
      console.log(chalk.bold.cyan('  ┌────────────────────────────────────────┐'));
      console.log(chalk.bold.cyan('  │') + chalk.bold.white('            T I R B E O                   ') + chalk.bold.cyan('│'));
      console.log(chalk.bold.cyan('  │') + chalk.gray('       Terminal Dashboard                  ') + chalk.bold.cyan('│'));
      console.log(chalk.bold.cyan('  └────────────────────────────────────────┘'));
      console.log('');

      console.log(chalk.bold.white('  ── Profile ───────────────────────────────'));
      console.log('  ' + chalk.white('Name'.padEnd(18)) + chalk.cyan(p.name || '(none)'));
      console.log('  ' + chalk.white('Email'.padEnd(18)) + chalk.cyan(p.email || '(none)'));
      console.log('  ' + chalk.white('Karma'.padEnd(18)) + chalk.cyan(String(p.karmaPoints || 0)));
      console.log('  ' + chalk.white('Verified'.padEnd(18)) + (p.isVerified ? chalk.green('Yes') : chalk.yellow('No')));
      console.log('');

      console.log(chalk.bold.white('  ── Security ──────────────────────────────'));
      console.log('  ' + chalk.white('2FA'.padEnd(18)) + (p.is2FAEnabled ? chalk.green('Enabled') : chalk.yellow('Disabled')));
      console.log('  ' + chalk.white('Passkeys'.padEnd(18)) + chalk.cyan(String(passkeys.length)));
      console.log('  ' + chalk.white('Sessions'.padEnd(18)) + chalk.cyan(String(sessions.length)));
      console.log('');

      const config = getConfig();
      console.log(chalk.bold.white('  ── Appearance ────────────────────────────'));
      console.log('  ' + chalk.white('Theme'.padEnd(18)) + chalk.cyan(config.theme));
      console.log('  ' + chalk.white('Mode'.padEnd(18)) + chalk.cyan(config.themeMode));
      console.log('  ' + chalk.white('Accent'.padEnd(18)) + chalk.cyan(config.accentColor));
      console.log('');

      console.log(chalk.bold.white('  ── Recent Activity ───────────────────────'));
      if (events.length === 0) {
        console.log(chalk.gray('    No recent activity'));
      } else {
        events.slice(0, 5).forEach((e: any) => {
          const action = formatDashAction(e.action || e.type);
          const ts = e.createdAt ? timeAgo(e.createdAt) : '';
          console.log(`  ${chalk.gray(ts.padEnd(12))}  ${action}`);
        });
      }
      console.log('');

      console.log(chalk.bold.white('  ── Quick Links ───────────────────────────'));
      console.log('  ' + chalk.cyan('https://dashboard.tirbeo.app/dashboard'));
      console.log('  ' + chalk.cyan('https://dashboard.tirbeo.app/dashboard/security'));
      console.log('  ' + chalk.cyan('https://dashboard.tirbeo.app/dashboard/preferences'));
      console.log('');

      console.log(chalk.gray('  tirbeo --help  •  tirbeo auth  •  tirbeo profile'));
      console.log('');
    } catch (err: any) {
      s.fail(err.message);
    }
  }
}

function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  return Math.floor(secs / 86400) + 'd ago';
}

function formatDashAction(action: string): string {
  const map: Record<string, string> = {
    'LOGIN': 'Signed in',
    'LOGOUT': 'Signed out',
    'UPDATE_PROFILE': 'Profile updated',
    'THEME_CHANGED': 'Theme changed',
    'ENABLE_2FA': '2FA enabled',
    'ADD_PASSKEY': 'Passkey added',
    'CLI_LOGIN': 'CLI signed in',
  };
  return map[action] || (action || 'Activity').replace(/_/g, ' ').toLowerCase();
}
