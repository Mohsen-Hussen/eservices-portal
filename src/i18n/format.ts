import type { Locale } from "./config";

/** Replaces `{name}` placeholders in a translated string. */
export function t(template: string, values: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

const intlLocale: Record<Locale, string> = {
  // Arabic with Latin digits keeps IDs, dates and amounts easy to scan.
  ar: "ar-SA-u-nu-latn",
  en: "en-GB",
};

export function formatDate(iso: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale[locale], {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(intlLocale[locale]).format(value);
}
