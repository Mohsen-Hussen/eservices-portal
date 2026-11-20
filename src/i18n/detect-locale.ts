import { defaultLocale, locales, type Locale } from "./config";

/** Picks the best supported locale from the Accept-Language header. */
export function detectLocale(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return defaultLocale;
  const preferred = acceptLanguage
    .split(",")
    .map((part) => {
      const [tag, q] = part.trim().split(";q=");
      return { lang: tag.toLowerCase().split("-")[0], q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  const match = preferred.find(({ lang }) => (locales as readonly string[]).includes(lang));
  return (match?.lang as Locale | undefined) ?? defaultLocale;
}
