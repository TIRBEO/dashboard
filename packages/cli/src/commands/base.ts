import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { isLoggedIn, getAuthData } from '../lib/config';

export class BaseCommand {
  cmd: Command;

  constructor(name: string, description: string) {
    this.cmd = new Command(name).description(description);
  }

  protected async withSpinner<T>(text: string, fn: () => Promise<T>, ok?: string): Promise<T> {
    const s = ora({ text, color: 'cyan' }).start();
    try {
      const r = await fn();
      s.succeed(ok || 'Done');
      return r;
    } catch (err: any) {
      s.fail(err.message || 'Failed');
      throw err;
    }
  }

  protected requireAuth(): boolean {
    if (!isLoggedIn()) {
      console.log(chalk.yellow('\n  Not logged in. Run: tirbeo login\n'));
      return false;
    }
    return true;
  }

  protected getUser() {
    return getAuthData();
  }
}
