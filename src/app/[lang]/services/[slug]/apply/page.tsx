import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApplicationWizard } from "@/components/application-wizard";
import { isLocale } from "@/i18n/config";
import { t } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { getService, services } from "@/lib/services";

export async function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/services/[slug]/apply">): Promise<Metadata> {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!service || !isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: t(dict.wizard.title, { service: service.title[lang] }) };
}

export default async function ApplyPage({ params }: PageProps<"/[lang]/services/[slug]/apply">) {
  const { lang, slug } = await params;
  const service = getService(slug);
  if (!isLocale(lang) || !service) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <ApplicationWizard
        lang={lang}
        serviceSlug={service.slug}
        serviceTitle={service.title[lang]}
        dict={{ wizard: dict.wizard, errors: dict.errors }}
      />
    </div>
  );
}
