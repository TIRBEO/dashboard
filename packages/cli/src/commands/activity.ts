import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { header, error, info, footer, timeAgo } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class ActivityCommand extends BaseCommand {
  constructor() {
    super('activity', 'View your recent activity');
    this.cmd.option('-n, --limit <n>', 'Number of items to show', '10').action((opts) => this.list(opts));
  }

  async list(opts: any) {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading activity...', color: 'cyan' }).start();
    try {
      const limit = opts.limit || 10;
      const res = await apiGet('/api/user/activity?limit=' + limit);
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load activity'); return; }

      const events = res.data?.events || [];
      header('Recent Activity');

      if (events.length === 0) {
        info('No activity yet');
        console.log('');
        return;
      }

      events.forEach((e: any) => {
        const action = formatAction(e.action || e.type || 'unknown');
        const ts = e.createdAt ? timeAgo(e.createdAt) : '';
        console.log(`  ${chalk.gray(ts.padEnd(14))}  ${action}`);
      });
      console.log('');
      footer('Filter: tirbeo activity -n 20');
    } catch (err: any) {
      s.fail(err.message);
    }
  }
}

function formatAction(action: string): string {
  const map: Record<string, string> = {
    'LOGIN': 'Signed in',
    'LOGOUT': 'Signed out',
    'SIGNUP': 'Created account',
    'UPDATE_PROFILE': 'Updated profile',
    'UPDATE_PASSWORD': 'Changed password',
    'UPDATE_EMAIL': 'Changed email',
    'UPDATE_USERNAME': 'Changed username',
    'ENABLE_2FA': 'Enabled 2FA',
    'DISABLE_2FA': 'Disabled 2FA',
    'ADD_PHONE': 'Added phone number',
    'REMOVE_PHONE': 'Removed phone number',
    'ADD_PASSKEY': 'Added passkey',
    'REMOVE_PASSKEY': 'Removed passkey',
    'ADD_BACKUP_EMAIL': 'Added recovery email',
    'CONNECT_APP': 'Connected an app',
    'DISCONNECT_APP': 'Disconnected an app',
    'THEME_CHANGED': 'Changed theme',
    'SESSION_REVOKED': 'Revoked session',
    'DELETE_ACCOUNT': 'Deleted account',
  };
  return map[action] || action.replace(/_/g, ' ').toLowerCase();
}
