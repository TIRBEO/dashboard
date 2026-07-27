import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { header, error, info, footer, timeAgo } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class NotificationsCommand extends BaseCommand {
  constructor() {
    super('notifications', 'View and manage notifications');
    this.cmd.option('-n, --limit <n>', 'Number of notifications', '15').action((opts) => this.list(opts));
  }

  async list(opts: any) {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading notifications...', color: 'cyan' }).start();
    try {
      const limit = opts.limit || 15;
      const res = await apiGet('/api/notifications?limit=' + limit);
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load notifications'); return; }

      const notifications = res.data?.notifications || [];
      header('Notifications');

      if (notifications.length === 0) {
        info('No notifications');
        console.log('');
        return;
      }

      notifications.forEach((n: any, i: number) => {
        const unread = !n.read;
        const dot = unread ? chalk.bold.red('●') : chalk.gray('○');
        const ts = n.createdAt ? timeAgo(n.createdAt) : '';
        const title = n.title || n.message || '(no title)';
        const body = n.body || '';
        console.log(`  ${dot}  ${chalk.gray(ts.padEnd(14))}  ${unread ? chalk.bold.white(title) : chalk.white(title)}`);
        if (body) console.log(chalk.gray(`        ${body}`));
        if (i < notifications.length - 1) console.log('');
      });
      console.log('');
      footer('Mark as read: tirbeo notifications read');
    } catch (err: any) {
      s.fail(err.message);
    }
  }
}
