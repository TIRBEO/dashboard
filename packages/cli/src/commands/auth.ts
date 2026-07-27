import { BaseCommand } from './base';
import chalk from 'chalk';
import ora from 'ora';
import * as http from 'http';
import * as crypto from 'crypto';
import { exec } from 'child_process';
import { saveAuth, clearAuth, isLoggedIn, getAuthData } from '../lib/config';
import { header, success, error, info, footer, banner } from '../lib/display';

function findAvailablePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      const port = typeof addr === 'object' && addr ? addr.port : 0;
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });
}

function openBrowser(targetUrl: string) {
  const platform = process.platform;
  let cmd: string;
  if (platform === 'win32') cmd = `start "" "${targetUrl}"`;
  else if (platform === 'darwin') cmd = `open "${targetUrl}"`;
  else cmd = `xdg-open "${targetUrl}"`;
  exec(cmd, () => {});
}

function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export class AuthCommand extends BaseCommand {
  constructor() {
    super('auth', 'Sign in, sign out, and manage authentication');
    this.cmd.command('login').description('Sign in to your Tirbeo account').action(() => this.login());
    this.cmd.command('logout').description('Sign out of your account').action(() => this.logout());
    this.cmd.command('whoami').description('Show current user').action(() => this.whoami());
    this.cmd.command('status').description('Check auth status').action(() => this.status());
  }

  async login() {
    if (isLoggedIn()) {
      const auth = getAuthData();
      console.log('');
      console.log(chalk.green('  Already signed in as: ' + chalk.bold(auth?.name || auth?.email || 'unknown')));
      console.log(chalk.gray('  Run ' + chalk.cyan('tirbeo auth logout') + ' to sign out first'));
      console.log('');
      return;
    }

    banner();
    console.log(chalk.bold.white('  Sign in to Tirbeo'));
    console.log(chalk.gray('  ═══════════════════════════════'));

    const tokenArg = process.argv.find(a => a.startsWith('--token='));
    const token = tokenArg ? tokenArg.split('=')[1] : null;

    if (token) {
      const s = ora({ text: 'Verifying token...', color: 'cyan' }).start();
      try {
        const res = await this.verifyCliToken(token);
        if (res) {
          s.succeed('Signed in successfully!');
          console.log(chalk.gray('  Welcome, ' + chalk.bold(res.name || res.email)));
        } else {
          s.fail('Invalid or expired token');
        }
      } catch (err: any) {
        s.fail('Failed: ' + err.message);
      }
      console.log('');
      return;
    }

    console.log('');
    console.log(chalk.gray('  Opening browser for authentication...'));
    console.log(chalk.gray('  If the browser doesn\'t open, visit the URL shown below.'));
    console.log('');

    const port = await findAvailablePort();
    const state = crypto.randomBytes(32).toString('hex');
    const authUrl = `https://accounts.tirbeo.app/auth/cli?port=${port}&state=${state}`;

    console.log(chalk.cyan('  ' + authUrl));
    console.log('');

    openBrowser(authUrl);

    const s = ora({ text: 'Waiting for authentication...', color: 'cyan' }).start();
    let timeout: NodeJS.Timeout | undefined;

    try {
      const tokenData = await new Promise<{ token: string; email: string; name: string }>((resolve, reject) => {
        const server = http.createServer(async (req, res) => {
          const reqUrl = new URL(req.url || '/', `http://127.0.0.1:${port}`);

          if (reqUrl.pathname === '/callback') {
            const t = reqUrl.searchParams.get('token');
            const e = reqUrl.searchParams.get('email');
            const n = reqUrl.searchParams.get('name');
            const returnedState = reqUrl.searchParams.get('state');

            if (!returnedState || !constantTimeCompare(state, returnedState)) {
              res.writeHead(403, { 'Content-Type': 'text/html' });
              res.end('<html><body style="background:#0A0A0B;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2>State mismatch</h2><p style="color:#888">Security check failed. Please try again from the terminal.</p></div></body></html>');
              reject(new Error('State mismatch — possible hijack attempt'));
              return;
            }

            if (!t) {
              res.writeHead(400, { 'Content-Type': 'text/html' });
              res.end('<html><body style="background:#0A0A0B;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2>Missing token</h2><p style="color:#888">Please try again from the terminal.</p></div></body></html>');
              reject(new Error('No token received'));
              return;
            }

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end('<html><body style="background:#0A0A0B;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><h2 style="margin:0 0 8px">CLI authorized</h2><p style="color:#888;margin:0">You can close this tab and return to your terminal.</p></div></body></html>');

            resolve({ token: t, email: e || '', name: n || '' });
          } else {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<html><body style="background:#0A0A0B;color:#fff;font-family:system-ui;display:flex;align-items:center;justify-content:center;height:100vh"><div style="text-align:center"><p style="color:#888">Waiting for authentication...</p></div></body></html>');
          }
        });

        server.listen(port, '127.0.0.1', () => {
          s.text = 'Waiting for authentication...';
        });

        server.on('error', (err: any) => {
          reject(new Error(`Failed to start local server: ${err.message}`));
        });

        timeout = setTimeout(() => {
          server.close();
          reject(new Error('Login timed out after 5 minutes'));
        }, 5 * 60 * 1000);
      });

      if (timeout) clearTimeout(timeout);
      s.text = 'Verifying token...';

      const userData = await this.verifyCliToken(tokenData.token);
      if (userData) {
        saveAuth({
          sessionToken: tokenData.token,
          csrfToken: null,
          expiresAt: null,
          userId: userData.id,
          email: userData.email,
          name: userData.name,
        });
        s.succeed('Signed in successfully!');
        console.log(chalk.gray('  Welcome, ' + chalk.bold(userData.name || userData.email)));
      } else {
        s.fail('Token verification failed');
      }
    } catch (err: any) {
      if (timeout) clearTimeout(timeout);
      s.fail(err?.message || 'Login failed');
    }

    console.log('');
  }

  private async verifyCliToken(token: string): Promise<{ id: string; email: string; name: string } | null> {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
      if (!payload.sub) return null;

      const res = await fetch('https://api.tirbeo.app/api/users/me', {
        headers: {
          'Cookie': '__session=' + token,
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) return null;
      const data: any = await res.json();
      return { id: data.id || payload.sub, email: data.email || '', name: data.name || '' };
    } catch {
      return null;
    }
  }

  logout() {
    if (!isLoggedIn()) {
      console.log(chalk.yellow('\n  Not signed in\n'));
      return;
    }
    const auth = getAuthData();
    clearAuth();
    console.log('');
    success('Signed out of ' + (auth?.email || 'account'));
    console.log(chalk.gray('  Re-login: tirbeo auth login'));
    console.log('');
  }

  whoami() {
    if (!this.requireAuth()) return;
    const auth = getAuthData();
    if (!auth) return;

    header('Current User');
    console.log('  ' + chalk.white('Name'.padEnd(18)) + chalk.cyan(auth.name || 'Not set'));
    console.log('  ' + chalk.white('Email'.padEnd(18)) + (auth.email ? chalk.green(auth.email) : chalk.yellow('Not set')));
    console.log('  ' + chalk.white('User ID'.padEnd(18)) + chalk.cyan(auth.userId?.slice(0, 12) + '...' || 'Unknown'));
    footer('Use: tirbeo profile to see full details');
  }

  status() {
    header('Auth Status');
    if (isLoggedIn()) {
      const auth = getAuthData();
      success('Authenticated as ' + (auth?.email || 'unknown'));
      console.log('  ' + chalk.white('Session'.padEnd(18)) + chalk.green('Valid'));
    } else {
      error('Not signed in');
      info('Run: tirbeo auth login');
    }
    console.log('');
  }
}
