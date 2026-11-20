"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";

import { alternateLocale, localeLabel, type Locale } from "@/i18n/config";

/** Swaps the locale segment of the current path, keeping the user on the same page. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/");
  segments[1] = target;
  return segments.join("/") || `/${target}`;
}

export function LocaleSwitcher({ lang, label }: { lang: Locale; label: string }) {
  const pathname = usePathname() ?? `/${lang}`;
  const target = alternateLocale(lang);

  return (
    <Link
      href={switchLocalePath(pathname, target)}
      hrefLang={target}
      lang={target}
      aria-label={`${label}: ${localeLabel[target]}`}
      className="inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 py-2 text-sm font-semibold text-ink-800 hover:bg-ink-50"
    >
      <Languages aria-hidden className="size-4" />
      {localeLabel[target]}
    </Link>
  );
}
