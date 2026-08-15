export const SUPPORTED_LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "hi", label: "हिन्दी" },
  { code: "ne", label: "नेपाली" },
];

export const LOCALES: Record<string, string> = {
  en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE", ja: "ja-JP",
  ko: "ko-KR", zh: "zh-CN", hi: "hi-IN", ne: "ne-NP",
};

export function isSupportedLang(value: unknown): value is string {
  return typeof value === "string" && value in LOCALES;
}
