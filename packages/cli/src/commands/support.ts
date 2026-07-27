import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { header, row, success, error, footer } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class SupportCommand extends BaseCommand {
  constructor() {
    super('support', 'Get help and contact support');
    this.cmd.command('faq').description('View frequently asked questions').action(() => this.faq());
    this.cmd.command('contact').description('Open support form').action(() => this.contact());
    this.cmd.command('status').description('Check platform status').action(() => this.status());
  }

  async faq() {
    header('Frequently Asked Questions');
    console.log('');

    const faqs = [
      { q: 'How do I enable 2FA?', a: 'Go to dashboard.tirbeo.app/dashboard/security and click "Enable 2FA".' },
      { q: 'How do I add a passkey?', a: 'Go to dashboard.tirbeo.app/dashboard/security and click "Add Passkey". Your browser/device will handle the registration.' },
      { q: 'How do I change my email?', a: 'Go to dashboard.tirbeo.app/dashboard/account and update your email. You will need to verify the new address.' },
      { q: 'How do I delete my account?', a: 'Go to dashboard.tirbeo.app/dashboard/account and scroll to the bottom. Click "Delete Account".' },
      { q: 'How do I connect apps?', a: 'Go to dashboard.tirbeo.app/apps and select the apps you want to connect to.' },
      { q: 'How do I reset my password?', a: 'Go to accounts.tirbeo.app/forgot and follow the instructions.' },
      { q: 'How do I recover my account without 2FA?', a: 'Use one of your backup codes when prompted during sign-in, or contact support.' },
      { q: 'How do I check my security events?', a: 'Run: tirbeo security events' },
    ];

    faqs.forEach((f, i) => {
      console.log(chalk.bold.white(`  Q: ${f.q}`));
      console.log(chalk.gray(`  A: ${f.a}`));
      if (i < faqs.length - 1) console.log('');
    });

    console.log('');
    footer('Still need help? Run: tirbeo support contact');
  }

  async contact() {
    header('Contact Support');
    console.log('');
    console.log(chalk.cyan('  Opening support form in your browser...'));
    console.log('');
    console.log(chalk.gray('  Or contact us directly:'));
    console.log(chalk.gray('  Email:    support@tirbeo.app'));
    console.log(chalk.gray('  Website:  https://support.tirbeo.app/contact'));
    console.log('');

    try {
      const { exec } = require('child_process');
      const url = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
      exec(`${url} https://support.tirbeo.app/contact`);
    } catch {}
  }

  async status() {
    const s = ora({ text: 'Checking platform status...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/health');
      s.stop();

      header('Platform Status');
      if (res.ok) {
        success('All systems operational');
        row('API', 'Healthy', chalk.green);
      } else {
        error('Service may be experiencing issues');
        row('API', res.error || 'Unreachable', chalk.red);
      }

      row('Dashboard', 'https://dashboard.tirbeo.app', chalk.cyan);
      row('Accounts', 'https://accounts.tirbeo.app', chalk.cyan);
      row('Support', 'https://support.tirbeo.app', chalk.cyan);
      console.log('');
    } catch (err: any) {
      s.fail('Could not reach API: ' + err.message);
      console.log('');
    }
  }
}
