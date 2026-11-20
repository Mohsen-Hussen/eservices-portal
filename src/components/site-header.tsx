import Link from "next/link";
import { Landmark } from "lucide-react";

import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/get-dictionary";
import { LocaleSwitcher } from "./locale-switcher";

export function SiteHeader({ lang, nav }: { lang: Locale; nav: Dictionary["nav"] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href={`/${lang}`} className="flex items-center gap-2 font-bold text-brand-800">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand-600 text-white">
            <Landmark aria-hidden className="size-5" />
          </span>
          <span className="text-lg">{nav.brand}</span>
        </Link>
        <nav className="flex flex-1 items-center gap-1 text-sm font-medium">
          <Link
            href={`/${lang}#catalog`}
            className="rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-100"
          >
            {nav.services}
          </Link>
          <Link
            href={`/${lang}/requests`}
            className="rounded-lg px-3 py-2 text-ink-700 hover:bg-ink-100"
          >
            {nav.requests}
          </Link>
        </nav>
        <LocaleSwitcher lang={lang} label={nav.switchLanguage} />
      </div>
    </header>
  );
}
