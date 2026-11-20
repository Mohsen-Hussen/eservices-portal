import { notFound } from "next/navigation";

import { ServiceCatalog } from "@/components/service-catalog";
import { isLocale } from "@/i18n/config";
import { formatNumber } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { averageDuration, categories, services } from "@/lib/services";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const stats = [
    { value: services.length, label: dict.home.statsServices },
    { value: categories.length, label: dict.home.statsCategories },
    { value: averageDuration(services), label: dict.home.statsDays },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-brand-800 to-brand-700 text-white">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm font-semibold text-brand-100">{dict.home.eyebrow}</p>
          <h1 className="mt-3 max-w-2xl text-3xl leading-tight font-bold sm:text-4xl">
            {dict.home.title}
          </h1>
          <p className="mt-4 max-w-xl text-brand-100">{dict.home.subtitle}</p>
          <dl className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 p-4">
                <dt className="text-xs text-brand-100">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold">{formatNumber(stat.value, lang)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section id="catalog" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-ink-900">{dict.home.catalogTitle}</h2>
        <ServiceCatalog
          lang={lang}
          services={services}
          dict={{ catalog: dict.catalog, categories: dict.categories }}
        />
      </section>
    </>
  );
}
