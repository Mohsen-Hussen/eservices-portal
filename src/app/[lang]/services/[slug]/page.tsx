import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CircleCheck, Clock, Users, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonClasses } from "@/components/ui/button";
import { isLocale } from "@/i18n/config";
import { formatNumber, t } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { getService, services } from "@/lib/services";

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!service || !isLocale(lang)) return {};
  return { title: service.title[lang], description: service.summary[lang] };
}

export default async function ServicePage({ params }: PageProps<"/[lang]/services/[slug]">) {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!isLocale(lang) || !service) notFound();
  const dict = await getDictionary(lang);

  const facts = [
    {
      icon: Clock,
      label: dict.service.duration,
      value: t(dict.catalog.days, { count: formatNumber(service.durationDays, lang) }),
    },
    {
      icon: Wallet,
      label: dict.service.fees,
      value:
        service.fee === 0
          ? dict.catalog.free
          : t(dict.catalog.fee, { amount: formatNumber(service.fee, lang) }),
    },
    {
      icon: Users,
      label: dict.service.beneficiaries,
      value: service.beneficiaries.map((b) => dict.service[b]).join(" · "),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Link
        href={`/${lang}#catalog`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:underline"
      >
        <ArrowLeft aria-hidden className="rtl-flip size-4" />
        {dict.service.back}
      </Link>

      <article className="mt-6 overflow-hidden rounded-2xl border border-ink-200 bg-white">
        <header className="border-b border-ink-100 p-6 sm:p-8">
          <Badge tone="brand">{dict.categories[service.category]}</Badge>
          <h1 className="mt-3 text-2xl font-bold text-ink-900 sm:text-3xl">
            {service.title[lang]}
          </h1>
          <p className="mt-3 text-ink-500">{service.summary[lang]}</p>
        </header>

        <dl className="grid gap-px bg-ink-100 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-3 bg-white p-5">
              <Icon aria-hidden className="mt-0.5 size-5 text-brand-600" />
              <div>
                <dt className="text-xs text-ink-500">{label}</dt>
                <dd className="mt-0.5 text-sm font-semibold text-ink-900">{value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <section className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-ink-900">{dict.service.requirements}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {service.requirements.map((requirement) => (
              <li key={requirement.en} className="flex items-start gap-2.5 text-sm text-ink-700">
                <CircleCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-600" />
                {requirement[lang]}
              </li>
            ))}
          </ul>
          <Link
            href={`/${lang}/services/${service.slug}/apply`}
            className={buttonClasses({ size: "lg", className: "mt-8 w-full sm:w-auto" })}
          >
            {dict.service.apply}
          </Link>
        </section>
      </article>
    </div>
  );
}
