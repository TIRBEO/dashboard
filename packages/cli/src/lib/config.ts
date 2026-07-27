import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.config', 'tirbeo');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');
const AUTH_FILE = path.join(CONFIG_DIR, 'auth.json');

interface CliConfig {
  apiUrl: string;
  theme: string;
  themeMode: string;
  accentColor: string;
  language: string;
  timezone: string;
  lastLogin: string | null;
  email: string | null;
  userId: string | null;
  name: string | null;
}

export interface AuthData {
  sessionToken: string;
  csrfToken: string | null;
  expiresAt: string | null;
  userId: string;
  email: string;
  name: string;
}

const DEFAULT_CONFIG: CliConfig = {
  apiUrl: 'https://api.tirbeo.app',
  theme: 'midnight',
  themeMode: 'dark',
  accentColor: 'white',
  language: 'en',
  timezone: 'Asia/Kathmandu',
  lastLogin: null,
  email: null,
  userId: null,
  name: null,
};

function ensureDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function getConfig(): CliConfig {
  ensureDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch {}
  return { ...DEFAULT_CONFIG };
}

export function saveConfig(patch: Partial<CliConfig>) {
  const config = getConfig();
  const updated = { ...config, ...patch };
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
}

export function getAuthToken(): string | null {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      const raw = fs.readFileSync(AUTH_FILE, 'utf-8');
      const auth: AuthData = JSON.parse(raw);
      if (auth.expiresAt && new Date(auth.expiresAt) < new Date()) return null;
      return auth.sessionToken;
    }
  } catch {}
  return null;
}

export function getAuthData(): AuthData | null {
  try {
    if (fs.existsSync(AUTH_FILE)) {
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
    }
  } catch {}
  return null;
}

export function saveAuth(data: AuthData) {
  ensureDir();
  fs.writeFileSync(AUTH_FILE, JSON.stringify(data, null, 2), 'utf-8');
  saveConfig({
    lastLogin: new Date().toISOString(),
    email: data.email,
    userId: data.userId,
    name: data.name,
  });
}

export function clearAuth() {
  try {
    if (fs.existsSync(AUTH_FILE)) fs.unlinkSync(AUTH_FILE);
  } catch {}
}

export function isLoggedIn(): boolean {
  return getAuthToken() !== null;
}
