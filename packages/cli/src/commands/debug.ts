import { BaseCommand } from './base';
import { getConfig, isLoggedIn } from '../lib/config';
import { header, section, row, footer } from '../lib/display';

export class DebugCommand extends BaseCommand {
  constructor() {
    super('debug', 'Show debug information');
    this.cmd.action(() => this.run());
  }

  run() {
    header('Debug Info');

    section('Environment');
    row('Node.js', process.version);
    row('Platform', process.platform + ' ' + process.arch);
    row('argv', process.argv.join(' '));

    section('Config');
    const c = getConfig();
    row('API URL', c.apiUrl);
    row('Theme', c.theme + ' / ' + c.themeMode);
    row('Accent', c.accentColor);
    row('Language', c.language);
    row('Timezone', c.timezone);
    row('Last Login', c.lastLogin || 'Never');

    section('Auth');
    row('Logged In', isLoggedIn() ? 'Yes' : 'No');
    row('User ID', c.userId || '(none)');
    row('Email', c.email || '(none)');

    section('Paths');
    row('Config Dir', require('path').join(require('os').homedir(), '.config', 'tirbeo'));

    console.log('');
    footer('Report issues: https://github.com/TIRBEO/cli/issues');
  }
}
