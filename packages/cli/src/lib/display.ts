import chalk from 'chalk';

export function header(title: string) {
  console.log('');
  console.log(chalk.bold.green('  ╔══════════════════════════════════════╗'));
  console.log(chalk.bold.green('  ║') + '  ' + chalk.bold.white(title.padEnd(36)) + chalk.bold.green(' ║'));
  console.log(chalk.bold.green('  ╚══════════════════════════════════════╝'));
  console.log('');
}

export function section(title: string) {
  console.log(chalk.bold.white('  ' + title));
  console.log(chalk.gray('  ' + '─'.repeat(36)));
}

export function row(label: string, value: string, color?: typeof chalk) {
  const c = color || chalk.cyan;
  console.log('  ' + chalk.white(label.padEnd(18)) + c(value));
}

export function success(msg: string) {
  console.log(chalk.green('  ✓ ' + msg));
}

export function error(msg: string) {
  console.log(chalk.red('  ✗ ' + msg));
}

export function info(msg: string) {
  console.log(chalk.blue('  ℹ ' + msg));
}

export function warn(msg: string) {
  console.log(chalk.yellow('  ⚠ ' + msg));
}

export function divider() {
  console.log(chalk.gray('  ' + '─'.repeat(38)));
}

export function footer(msg: string) {
  console.log('');
  console.log(chalk.gray('  ' + msg));
  console.log('');
}

export function banner() {
  console.log('');
  console.log(chalk.bold.cyan('  ┌────────────────────────────────────┐'));
  console.log(chalk.bold.cyan('  │') + chalk.bold.white('           T I R B E O              ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('  │') + chalk.gray('     Unified Identity Platform      ') + chalk.bold.cyan('│'));
  console.log(chalk.bold.cyan('  └────────────────────────────────────┘'));
  console.log('');
}

export function timeAgo(dateStr: string): string {
  const secs = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (secs < 60) return 'just now';
  if (secs < 3600) return Math.floor(secs / 60) + 'm ago';
  if (secs < 86400) return Math.floor(secs / 3600) + 'h ago';
  if (secs < 604800) return Math.floor(secs / 86400) + 'd ago';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return phone.slice(0, 3) + '-' + phone.slice(3);
}

export function barChart(value: number, max: number, width = 20): string {
  const filled = Math.round((value / max) * width);
  return chalk.green('█'.repeat(filled)) + chalk.gray('░'.repeat(width - filled));
}

export function table(headers: string[], rows: string[][]) {
  const colWidths: number[] = headers.map((h, i) => {
    const maxData = rows.reduce((max, r) => Math.max(max, (r[i] || '').length), 0);
    return Math.max(h.length, maxData) + 2;
  });

  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i] ?? 20)).join('');
  console.log(chalk.bold.white('  ' + headerLine));
  console.log(chalk.gray('  ' + colWidths.map(w => '─'.repeat(w)).join('')));

  rows.forEach(row => {
    const line = row.map((cell, i) => cell.padEnd(colWidths[i] ?? 20)).join('');
    console.log('  ' + line);
  });
}
