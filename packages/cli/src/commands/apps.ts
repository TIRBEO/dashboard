import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { header, info, footer } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class AppsCommand extends BaseCommand {
  constructor() {
    super('apps', 'Manage connected apps and services');
    this.cmd.action(() => this.list());
  }

  async list() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading connected apps...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/user/apps');
      s.stop();
      if (!res.ok) { console.log(chalk.red('  Error: ' + (res.error || 'Failed to load apps'))); return; }

      const apps = res.data?.apps || [];
      header('Connected Apps');

      if (apps.length === 0) {
        info('No apps connected yet');
        console.log(chalk.gray('  Connect apps at: https://dashboard.tirbeo.app/apps'));
        console.log('');
        return;
      }

      apps.forEach((a: any, i: number) => {
        const name = a.name || a.appName || a.id || 'Unknown';
        const status = a.connected ? chalk.green('●') : chalk.gray('○');
        console.log(`  ${status}  ${chalk.bold.white(name.padEnd(20))}  ${chalk.gray(a.description || a.desc || '')}`);
        if (a.url) console.log(chalk.gray(`       ${a.url}`));
        if (i < apps.length - 1) console.log('');
      });

      console.log('');
      footer('Connect at: https://dashboard.tirbeo.app/apps');
    } catch (err: any) {
      s.fail(err.message);
    }
  }
}
