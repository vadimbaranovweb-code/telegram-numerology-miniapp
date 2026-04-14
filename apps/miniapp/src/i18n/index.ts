import { EN } from "./en";
import { RU } from "./ru";
import type { Translations } from "./types";

export type Lang = "ru" | "en";

const LANG_STORAGE_KEY = "numerology-miniapp-lang";

function getStoredLang(): Lang {
  if (typeof window === "undefined") return "ru";
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "en") return "en";
  } catch { /* ignore */ }
  return "ru";
}

export function setLang(lang: Lang): void {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch { /* ignore */ }
  // Reload to apply new language across all components
  window.location.reload();
}

export function getLang(): Lang {
  return getStoredLang();
}

const TRANSLATIONS: Record<Lang, Translations> = { ru: RU, en: EN };

export const lang: Lang = getStoredLang();

/** Translation dictionary — use directly: `t.hero.title` */
export const t: Translations = TRANSLATIONS[lang];
