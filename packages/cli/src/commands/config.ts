import { BaseCommand } from './base';
import { getConfig, saveConfig } from '../lib/config';
import { header, section, row, success, error, footer } from '../lib/display';
import chalk from 'chalk';

export class ConfigCommand extends BaseCommand {
  constructor() {
    super('config', 'View and update CLI configuration');
    this.cmd.command('show').description('Show all config').action(() => this.show());
    this.cmd.command('set').description('Set a config value').argument('<key>', 'Config key').argument('<value>', 'Value').action((k, v) => this.set(k, v));
    this.cmd.command('reset').description('Reset config to defaults').action(() => this.reset());
  }

  show() {
    const c = getConfig();
    header('CLI Configuration');
    section('General');
    row('API URL', c.apiUrl);
    row('Last Login', c.lastLogin || 'Never');
    row('User ID', c.userId || '(none)');
    row('Email', c.email || '(none)');

    section('Preferences');
    row('Theme', c.theme);
    row('Theme Mode', c.themeMode);
    row('Accent Color', c.accentColor);
    row('Language', c.language);
    row('Timezone', c.timezone);

    console.log('');
    footer('Config stored at: ~/.config/tirbeo/config.json');
  }

  set(key: string, value: string) {
    const valid: Record<string, keyof ReturnType<typeof getConfig>> = {
      'apiUrl': 'apiUrl',
      'theme': 'theme',
      'themeMode': 'themeMode',
      'accentColor': 'accentColor',
      'language': 'language',
      'timezone': 'timezone',
    };
    const k = valid[key];
    if (!k) {
      error('Unknown key: ' + key);
      console.log(chalk.gray('  Valid keys: ' + Object.keys(valid).join(', ')));
      console.log('');
      return;
    }
    saveConfig({ [k]: value });
    success(`Set ${chalk.bold.white(key)} = ${chalk.bold.cyan(value)}`);
    console.log('');
  }

  reset() {
    const defaults = {
      apiUrl: 'https://api.tirbeo.app',
      theme: 'midnight',
      themeMode: 'dark',
      accentColor: 'white',
      language: 'en',
      timezone: 'Asia/Kathmandu',
    };
    saveConfig(defaults);
    success('Config reset to defaults');
    console.log('');
  }
}
