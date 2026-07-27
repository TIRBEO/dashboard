import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { header, section, row, error, footer } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class ProfileCommand extends BaseCommand {
  constructor() {
    super('profile', 'View and manage your profile');
    this.cmd.action(() => this.execute());
  }

  async execute() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading profile...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/users/me');
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load profile'); return; }

      const p = res.data;
      header('Your Profile');

      section('Identity');
      row('Name', p.name || '(none)');
      row('Email', p.email || '(none)');
      row('Phone', p.phoneNumber || '(none)');
      row('Avatar', p.photoUrl || '(none)');

      section('Status');
      row('Verified', p.isVerified ? '✓ Yes' : 'No', p.isVerified ? chalk.green : chalk.yellow);
      row('Karma', String(p.karmaPoints || 0));
      row('Occupation', p.occupation || '(none)');

      if (p.createdAt) {
        section('Metadata');
        row('Joined', new Date(p.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
        if (p.updatedAt) row('Last Updated', new Date(p.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
      }

      footer('Edit: tirbeo profile edit --name "New Name" --bio "New bio"');
    } catch (err: any) {
      s.fail(err.message);
    }
  }
}
