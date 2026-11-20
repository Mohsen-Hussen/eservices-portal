"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ArrowRight, Clock, Search, Wallet } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatNumber, t } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { categories, filterServices, type Category, type Service } from "@/lib/services";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface ServiceCatalogProps {
  lang: Locale;
  services: Service[];
  dict: Pick<Dictionary, "catalog" | "categories">;
}

export function ServiceCatalog({ lang, services, dict }: ServiceCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | undefined>();
  const searchId = useId();

  const results = useMemo(
    () => filterServices(services, { query, category }),
    [services, query, category],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <label htmlFor={searchId} className="sr-only">
            {dict.catalog.searchLabel}
          </label>
          <Search
            aria-hidden
            className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-400"
          />
          <input
            id={searchId}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={dict.catalog.searchPlaceholder}
            className="h-11 w-full rounded-lg border border-ink-200 bg-white ps-10 pe-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
        <div role="group" aria-label={dict.catalog.searchLabel} className="flex flex-wrap gap-2">
          {[undefined, ...categories].map((value) => {
            const active = value === category;
            return (
              <button
                key={value ?? "all"}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 bg-white text-ink-700 hover:border-brand-500",
                )}
              >
                {value ? dict.categories[value] : dict.catalog.allCategories}
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="text-sm text-ink-500">
        {t(dict.catalog.resultCount, { count: formatNumber(results.length, lang) })}
      </p>

      {results.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 bg-white p-10 text-center text-ink-500">
          {dict.catalog.empty}
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((service) => (
            <li key={service.slug}>
              <Link
                href={`/${lang}/services/${service.slug}`}
                className="group flex h-full flex-col gap-3 rounded-xl border border-ink-200 bg-white p-5 transition hover:border-brand-500 hover:shadow-md focus-visible:outline-2 focus-visible:outline-brand-600"
              >
                <Badge tone="brand">{dict.categories[service.category]}</Badge>
                <h3 className="text-base font-bold text-ink-900">{service.title[lang]}</h3>
                <p className="line-clamp-2 flex-1 text-sm text-ink-500">{service.summary[lang]}</p>
                <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-xs text-ink-500">
                  <span className="flex items-center gap-1.5">
                    <Clock aria-hidden className="size-3.5" />
                    {t(dict.catalog.days, { count: formatNumber(service.durationDays, lang) })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Wallet aria-hidden className="size-3.5" />
                    {service.fee === 0
                      ? dict.catalog.free
                      : t(dict.catalog.fee, { amount: formatNumber(service.fee, lang) })}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-brand-700">
                  {dict.catalog.details}
                  <ArrowRight
                    aria-hidden
                    className="rtl-flip size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
