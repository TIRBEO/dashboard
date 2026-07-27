#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { AuthCommand } from './commands/auth';
import { ProfileCommand } from './commands/profile';
import { AppsCommand } from './commands/apps';
import { ActivityCommand } from './commands/activity';
import { NotificationsCommand } from './commands/notifications';
import { ThemeCommand } from './commands/theme';
import { SecurityCommand } from './commands/security';
import { PreferencesCommand } from './commands/preferences';
import { SupportCommand } from './commands/support';
import { DashboardCommand } from './commands/dashboard';
import { DoctorCommand } from './commands/doctor';
import { ConfigCommand } from './commands/config';
import { DebugCommand } from './commands/debug';
import { banner, header, footer } from './lib/display';
import { isLoggedIn, getAuthData } from './lib/config';

async function main() {
  const program = new Command();
  program
    .name('tirbeo')
    .description(chalk.bold.cyan('Tirbeo') + ' — Unified Identity & Platform CLI')
    .version('1.0.0')
    .usage('<command> [options]')
    .helpOption('-h, --help', 'Show help');

  program
    .command('whoami')
    .description('Show current user')
    .action(() => {
      if (!isLoggedIn()) {
        console.log(chalk.yellow('\n  Not signed in. Run: tirbeo auth login\n'));
        return;
      }
      const auth = getAuthData();
      header('Current User');
      console.log('  ' + chalk.white('Name'.padEnd(18)) + chalk.cyan(auth?.name || 'Not set'));
      console.log('  ' + chalk.white('Email'.padEnd(18)) + (auth?.email ? chalk.green(auth.email) : chalk.yellow('Not set')));
      console.log('  ' + chalk.white('User ID'.padEnd(18)) + chalk.cyan(auth?.userId?.slice(0, 12) + '...' || 'Unknown'));
      footer('Use: tirbeo profile to see full details');
    });

  program.addCommand(new AuthCommand().cmd);
  program.addCommand(new ProfileCommand().cmd);
  program.addCommand(new DashboardCommand().cmd);
  program.addCommand(new AppsCommand().cmd);
  program.addCommand(new SecurityCommand().cmd);
  program.addCommand(new PreferencesCommand().cmd);
  program.addCommand(new NotificationsCommand().cmd);
  program.addCommand(new ActivityCommand().cmd);
  program.addCommand(new ThemeCommand().cmd);
  program.addCommand(new SupportCommand().cmd);
  program.addCommand(new DoctorCommand().cmd);
  program.addCommand(new ConfigCommand().cmd);
  program.addCommand(new DebugCommand().cmd);

  program.parse();

  if (process.argv.length <= 2) {
    banner();
    program.outputHelp();
  }
}

process.on('SIGINT', () => {
  console.log(chalk.yellow('\n  Exiting...\n'));
  process.exit(0);
});

main().catch((err: Error) => {
  console.error(chalk.red('  Fatal: ' + err.message));
  process.exit(1);
});
