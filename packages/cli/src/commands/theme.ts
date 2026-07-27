import { BaseCommand } from './base';
import { apiPatch } from '../lib/api';
import { getConfig, saveConfig } from '../lib/config';
import { header, section, row, footer } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class ThemeCommand extends BaseCommand {
  constructor() {
    super('theme', 'View and change theme settings');
    this.cmd.command('list').description('List available themes').action(() => this.listThemes());
    this.cmd.command('set').description('Set current theme').argument('<theme>', 'Theme ID').action((t) => this.setTheme(t));
    this.cmd.command('get').description('Show current theme').action(() => this.getTheme());
  }

  async listThemes() {
    header('Available Themes');

    const cats = [
      { cat: 'Neutral', themes: ['midnight', 'charcoal', 'coal', 'slate'] },
      { cat: 'Warm', themes: ['sunset', 'ember', 'peach', 'terracotta'] },
      { cat: 'Nature', themes: ['forest', 'sage', 'olive', 'moss'] },
      { cat: 'Cool', themes: ['arctic', 'frost', 'glacier', 'sky'] },
      { cat: 'Elegant', themes: ['royal', 'wine', 'rose', 'lavender'] },
      { cat: 'Developer', themes: ['matrix', 'cyberpunk', 'terminal', 'hacker'] },
    ];

    const config = getConfig();
    const current = config.theme;

    cats.forEach(c => {
      section(c.cat);
      c.themes.forEach(t => {
        const marker = t === current ? chalk.bold.green(' ← active') : '';
        console.log(`  ${chalk.cyan(t.padEnd(18))}${marker}`);
      });
      console.log('');
    });

    footer('Set: tirbeo theme set <theme-id>');
  }

  async setTheme(themeId: string) {
    const s = ora({ text: `Setting theme to ${themeId}...`, color: 'cyan' }).start();
    try {
      saveConfig({ theme: themeId });
      await apiPatch('/api/preferences', { preferences: { themeId } });
      s.succeed(`Theme set to ${chalk.bold.white(themeId)}`);
      console.log(chalk.gray('  Synced to dashboard via API'));
    } catch (err: any) {
      s.warn('Theme saved locally (API sync failed: ' + err.message + ')');
    }
    console.log('');
  }

  getTheme() {
    const config = getConfig();
    header('Current Theme');
    row('Theme', config.theme, chalk.cyan);
    row('Mode', config.themeMode, chalk.cyan);
    row('Accent', config.accentColor, chalk.cyan);
    console.log('');
  }
}
