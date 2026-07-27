import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { header, section, row, error, info, footer } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class SecurityCommand extends BaseCommand {
  constructor() {
    super('security', 'Manage account security settings');
    this.cmd.command('status').description('Show security status').action(() => this.status());
    this.cmd.command('2fa').description('Show 2FA status').action(() => this.twoFa());
    this.cmd.command('passkeys').description('List passkeys').action(() => this.passkeys());
    this.cmd.command('sessions').description('List active sessions').action(() => this.sessions());
    this.cmd.command('events').description('Show recent security events').action(() => this.events());
  }

  async status() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading security status...', color: 'cyan' }).start();
    try {
      const [profileRes, passkeysRes, sessionsRes] = await Promise.all([
        apiGet('/api/users/me'),
        apiGet('/api/passkey/list'),
        apiGet('/api/security/sessions'),
      ]);
      s.stop();

      const p = profileRes.ok ? profileRes.data : {};
      const passkeys = passkeysRes.ok ? (passkeysRes.data?.passkeys || []) : [];
      const sessions = sessionsRes.ok ? (sessionsRes.data?.sessions || []) : [];

      header('Security Status');

      section('Authentication');
      row('Password', p.hasPassword ? chalk.green('✓ Set') : chalk.yellow('○ Not set'));
      row('2FA Enabled', p.is2FAEnabled ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled'));

      section('Recovery Methods');
      row('Phone', p.phoneNumber ? chalk.green('✓ ' + p.phoneNumber) : chalk.yellow('○ Not set'));
      row('Recovery Email', p.recoveryEmail ? chalk.green('✓ ' + p.recoveryEmail) : chalk.yellow('○ Not set'));
      row('Backup Codes', p.hasBackupCodes ? chalk.green('✓ Available') : chalk.yellow('○ None'));
      row('Passkeys', passkeys.length > 0 ? chalk.green(`✓ ${passkeys.length} registered`) : chalk.yellow('○ None'));
      row('Active Sessions', chalk.cyan(String(sessions.length)));

      console.log('');
      footer('tirbeo security 2fa  |  tirbeo security sessions');
    } catch (err: any) {
      s.fail(err.message);
    }
  }

  async twoFa() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading 2FA status...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/users/me');
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load 2FA status'); return; }

      const d = res.data;
      header('Two-Factor Authentication');
      row('Status', d.is2FAEnabled ? chalk.green('✓ Enabled') : chalk.red('✗ Disabled'));

      if (!d.is2FAEnabled) {
        console.log('');
        info('Enable 2FA via the dashboard: https://dashboard.tirbeo.app/dashboard/security');
      }
      console.log('');
    } catch (err: any) {
      s.fail(err.message);
    }
  }

  async passkeys() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading passkeys...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/passkey/list');
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load passkeys'); return; }

      const keys = res.data?.passkeys || [];
      header('Passkeys');

      if (keys.length === 0) {
        info('No passkeys registered');
        console.log(chalk.gray('  Register at: https://dashboard.tirbeo.app/dashboard/security'));
        console.log('');
        return;
      }

      keys.forEach((k: any) => {
        row('Name', k.name || k.label || 'Unnamed', chalk.white);
        row('Created', k.createdAt ? new Date(k.createdAt).toLocaleDateString() : 'Unknown', chalk.gray);
        row('Last Used', k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleDateString() : 'Never', chalk.gray);
        console.log('');
      });
    } catch (err: any) {
      s.fail(err.message);
    }
  }

  async sessions() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading sessions...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/security/sessions');
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load sessions'); return; }

      const sessions = res.data?.sessions || [];
      header('Active Sessions');

      if (sessions.length === 0) {
        info('No active sessions');
        console.log('');
        return;
      }

      sessions.forEach((sess: any) => {
        const current = sess.isCurrent;
        const tag = current ? chalk.green(' (current)') : '';
        row('Device', (sess.userAgent || 'Unknown').slice(0, 40) + tag);
        row('IP', sess.ip || 'Unknown');
        row('Created', sess.createdAt ? new Date(sess.createdAt).toLocaleDateString() : 'Unknown');
        console.log('');
      });
    } catch (err: any) {
      s.fail(err.message);
    }
  }

  async events() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading security events...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/security/events');
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load events'); return; }

      const events = res.data?.events || [];
      header('Recent Security Events');

      if (events.length === 0) {
        info('No recent events');
        console.log('');
        return;
      }

      events.forEach((e: any) => {
        const action = formatSecAction(e.action);
        const ts = e.createdAt ? new Date(e.createdAt).toLocaleString() : '';
        console.log(`  ${chalk.gray(ts.padEnd(22))}  ${action}`);
        if (e.ip) console.log(chalk.gray(`                        IP: ${e.ip}`));
      });
      console.log('');
    } catch (err: any) {
      s.fail(err.message);
    }
  }
}

function formatSecAction(action: string): string {
  const map: Record<string, string> = {
    'LOGIN': 'Signed in',
    'LOGIN_FAILED': chalk.red('Failed sign-in attempt'),
    'LOGOUT': 'Signed out',
    'UPDATE_PASSWORD': 'Changed password',
    'ENABLE_2FA': chalk.green('Enabled 2FA'),
    'DISABLE_2FA': chalk.yellow('Disabled 2FA'),
    'ADD_PHONE': 'Added phone',
    'REMOVE_PHONE': 'Removed phone',
    'ADD_PASSKEY': 'Added passkey',
    'REMOVE_PASSKEY': 'Removed passkey',
    'ADD_BACKUP_EMAIL': 'Added recovery email',
    'SESSION_REVOKED': 'Revoked session',
    'RECOVERY_CODE_USED': chalk.yellow('Used recovery code'),
    'CLI_LOGIN': 'CLI signed in',
  };
  return map[action] || action.replace(/_/g, ' ').toLowerCase();
}
