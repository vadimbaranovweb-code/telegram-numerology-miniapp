/**
 * Lightweight i18n for the Telegram Mini App.
 * Language is detected synchronously from Telegram initDataUnsafe on module load.
 * Telegram SDK loads with `beforeInteractive`, so window.Telegram is available
 * by the time this module evaluates in the browser.
 *
 * CIS languages (ru, uk, be, kk, az, hy, ka, uz, tg, ky, tk, mn) → Russian UI.
 * Everything else → English.
 */

import { EN } from "./en";
import { RU } from "./ru";

const CIS_CODES = new Set([
  "ru", "uk", "be", "kk", "az", "hy", "ka", "uz", "tg", "ky", "tk", "mn",
]);

export type Lang = "ru" | "en";

export const lang: Lang = (() => {
  if (typeof window === "undefined") return "en";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code: string =
    (window as any)?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code ?? "";
  return CIS_CODES.has(code.split("-")[0]) ? "ru" : "en";
})();

/** Translation dictionary — use directly: `t.hero.title` */
export const t = lang === "ru" ? RU : EN;
