import { BaseCommand } from './base';
import { apiGet } from '../lib/api';
import { getConfig, isLoggedIn } from '../lib/config';
import { header, section, success, error } from '../lib/display';
import chalk from 'chalk';
import ora from 'ora';

export class DoctorCommand extends BaseCommand {
  constructor() {
    super('doctor', 'Run diagnostics and check system health');
    this.cmd.action(() => this.run());
  }

  async run() {
    header('System Diagnostics');
    const results: Array<{ name: string; ok: boolean; detail: string }> = [];

    // Node version
    const nodeVer = process.version;
    const nodeOk = parseInt(nodeVer.slice(1)) >= 18;
    results.push({ name: 'Node.js', ok: nodeOk, detail: nodeVer + (nodeOk ? '' : ' (requires >=18)') });

    // Platform
    results.push({ name: 'Platform', ok: true, detail: process.platform + ' ' + process.arch });

    // Auth status
    const loggedIn = isLoggedIn();
    results.push({ name: 'Authentication', ok: loggedIn, detail: loggedIn ? 'Signed in' : 'Not signed in' });

    // Config
    const config = getConfig();
    results.push({ name: 'Config File', ok: true, detail: config.theme + '/' + config.themeMode + '/' + config.accentColor });

    // API connectivity
    console.log('');
    const s = ora({ text: 'Checking API connectivity...', color: 'cyan' }).start();
    try {
      const res = await apiGet('/api/health');
      s.stop();
      if (res.ok) {
        results.push({ name: 'API Connection', ok: true, detail: 'Healthy (200)' });
      } else {
        results.push({ name: 'API Connection', ok: false, detail: 'Status ' + res.status + ': ' + (res.error || 'error') });
      }
    } catch (err: any) {
      s.fail('API unreachable');
      results.push({ name: 'API Connection', ok: false, detail: err.message });
    }

    // DNS
    const s2 = ora({ text: 'Checking DNS resolution...', color: 'cyan' }).start();
    try {
      const { resolve4 } = require('dns').promises;
      await resolve4('api.tirbeo.app');
      s2.succeed('DNS OK');
      results.push({ name: 'DNS', ok: true, detail: 'api.tirbeo.app resolves' });
    } catch (err: any) {
      s2.fail('DNS issue');
      results.push({ name: 'DNS', ok: false, detail: 'Cannot resolve api.tirbeo.app' });
    }

    // Render results
    console.log('');
    section('Results');
    results.forEach(r => {
      const icon = r.ok ? chalk.green('✓') : chalk.red('✗');
      console.log(`  ${icon}  ${chalk.white(r.name.padEnd(20))}  ${r.ok ? chalk.gray(r.detail) : chalk.red(r.detail)}`);
    });

    const passed = results.filter(r => r.ok).length;
    console.log('');
    if (passed === results.length) {
      success(`All ${passed} checks passed`);
    } else {
      error(`${results.length - passed} issue(s) found (${passed}/${results.length} passed)`);
    }
    console.log('');
  }
}
