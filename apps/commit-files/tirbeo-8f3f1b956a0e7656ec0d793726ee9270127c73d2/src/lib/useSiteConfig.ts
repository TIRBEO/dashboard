// ─── Site Config Hooks ───
// Re-exports engine hooks + bi() helper for bilingual values.

import { useConfig as _useConfig, useConfigSection } from './configEngine';
import type { Bilingual, Locale } from '../types';

export { useConfigSection };

// Pick the right locale string from a Bilingual value.
export const bi = (value: Bilingual | undefined, lang: Locale): string =>
  value ? value[lang] ?? value.en : '';

// useSiteConfig = useConfig (backward-compat alias used by all components)
export const useSiteConfig = _useConfig;
