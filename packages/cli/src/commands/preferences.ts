import { BaseCommand } from './base';
import { apiGet, apiPatch } from '../lib/api';
import { saveConfig } from '../lib/config';
import { header, section, row, error, footer } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class PreferencesCommand extends BaseCommand {
  constructor() {
    super('preferences', 'View and update account preferences');
    this.cmd.command('show').description('Show current preferences').action(() => this.show());
    this.cmd.command('set').description('Update a preference').argument('<key>', 'Preference key').argument('<value>', 'New value').action((k, v) => this.setPref(k, v));
  }

  async show() {
    if (!this.requireAuth()) return;

    const s = ora({ text: 'Loading preferences...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/preferences');
      s.stop();
      if (!res.ok) { error(res.error || 'Failed to load preferences'); return; }

      const p = res.data;
      header('Preferences');

      section('Appearance');
      row('Theme', p.theme || p.preferences?.themeId || 'midnight');
      row('Theme Mode', p.themeMode || p.preferences?.themeMode || 'dark');
      row('Accent Color', p.accentColor || p.preferences?.accentColor || 'white');

      section('Locale');
      row('Language', p.language || p.preferences?.language || 'en');
      row('Timezone', p.timezone || p.preferences?.timezone || 'Asia/Kathmandu');

      section('Privacy');
      row('Profile Visible', p.profileVisible !== false ? 'Yes' : 'No');
      row('Activity Visible', p.activityVisible !== false ? 'Yes' : 'No');
      row('Search Indexing', p.searchable !== false ? 'Enabled' : 'Disabled');

      section('Display');
      row('Date Format', p.dateFormat || 'MMM d, yyyy');
      row('24h Time', p.use24h ? 'Yes' : 'No');
      row('Compact Mode', p.compactMode ? 'Yes' : 'No');

      console.log('');
      footer('Edit: tirbeo preferences set <key> <value>');
    } catch (err: any) {
      s.fail(err.message);
    }
  }

  async setPref(key: string, value: string) {
    if (!this.requireAuth()) return;

    const validKeys: Record<string, string> = {
      'theme': 'theme', 'themeId': 'theme',
      'themeMode': 'themeMode', 'mode': 'themeMode',
      'accentColor': 'accentColor', 'accent': 'accentColor',
      'language': 'language', 'lang': 'language',
      'timezone': 'timezone', 'tz': 'timezone',
    };

    const mappedKey = validKeys[key] || validKeys[key.toLowerCase()];
    if (!mappedKey) {
      error('Unknown key: ' + key);
      console.log(chalk.gray('  Valid keys: ' + Object.keys(validKeys).join(', ')));
      console.log('');
      return;
    }

    const s = ora({ text: `Setting ${mappedKey} = ${value}...`, color: 'cyan' }).start();
    try {
      const patch: any = {};
      if (mappedKey === 'theme') {
        saveConfig({ theme: value });
        patch.preferences = { themeId: value };
      } else if (mappedKey === 'themeMode') {
        saveConfig({ themeMode: value });
        patch.preferences = { themeMode: value };
      } else if (mappedKey === 'accentColor') {
        saveConfig({ accentColor: value });
        patch.preferences = { accentColor: value };
      } else if (mappedKey === 'language') {
        saveConfig({ language: value });
        patch.preferences = { language: value };
      } else if (mappedKey === 'timezone') {
        saveConfig({ timezone: value });
        patch.preferences = { timezone: value };
      }

      const res = await apiPatch('/api/preferences', patch);
      s.succeed(`${chalk.bold.white(mappedKey)} set to ${chalk.bold.cyan(value)}`);
      if (res.ok) console.log(chalk.gray('  Synced to API'));
      else console.log(chalk.gray('  Saved locally (API sync failed)'));
    } catch (err: any) {
      s.warn('Saved locally only: ' + err.message);
    }
    console.log('');
  }
}
