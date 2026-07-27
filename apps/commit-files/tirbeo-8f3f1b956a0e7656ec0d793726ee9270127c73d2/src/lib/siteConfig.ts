// ─── Legacy Compatibility Layer ───
// Thin wrapper over configEngine. Prefer importing from configEngine directly.

import type { SiteConfig } from '../types';
import { configEngine, initConfigEngine } from './configEngine';

export { configEngine, initConfigEngine };
export type { ConfigSource, ConfigProvider } from './configEngine';

// Auto-initialize on import (client-side only)
if (typeof window !== 'undefined') {
  initConfigEngine().catch(console.error);
}

// Legacy sync getter (for components not yet migrated to hooks)
export function getSiteConfigSync(): SiteConfig {
  return configEngine.getConfig();
}

// Legacy async getter
export async function getSiteConfig(): Promise<SiteConfig> {
  await initConfigEngine();
  return configEngine.getConfig();
}
