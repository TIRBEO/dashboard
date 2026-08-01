import { copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';

const tempDir = '.prisma';

function findGeneratedClientDirs() {
  const pnpmDir = 'node_modules/.pnpm';
  const result = [];
  if (!existsSync(pnpmDir)) return result;
  for (const entry of readdirSync(pnpmDir)) {
    if (!entry.startsWith('@prisma+client@7.9.1')) continue;
    const clientDir = `${pnpmDir}/${entry}/node_modules/.prisma/client`;
    if (existsSync(clientDir)) result.push(clientDir);
  }
  return result;
}

try {
  mkdirSync(tempDir, { recursive: true });
  copyFileSync('apps/api/prisma/schema.prisma', `${tempDir}/schema.prisma`);
  execSync(`pnpm exec prisma generate --schema ${tempDir}/schema.prisma`, {
    stdio: 'inherit',
    cwd: process.cwd(),
  });

  const clientDirs = findGeneratedClientDirs();
  if (clientDirs.length > 1) {
    const source = clientDirs.find((dir) => {
      try {
        return statSync(`${dir}/index.d.ts`).size > 1_000_000;
      } catch {
        return false;
      }
    });
    if (!source) {
      console.error('prisma-generate-root: could not locate a fully generated client to replicate');
    } else {
      for (const target of clientDirs) {
        if (target === source) continue;
        rmSync(target, { recursive: true, force: true });
        cpSync(source, target, { recursive: true });
        console.log(`prisma-generate-root: replicated generated client to ${target}`);
      }
    }
  }
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
