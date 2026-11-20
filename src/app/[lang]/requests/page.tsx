import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RequestsTable } from "@/components/requests-table";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { services } from "@/lib/services";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/requests">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return { title: dict.requests.title };
}

export default async function RequestsPage({ params }: PageProps<"/[lang]/requests">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const serviceTitles = Object.fromEntries(services.map((s) => [s.slug, s.title[lang]]));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-ink-900">{dict.requests.title}</h1>
      <p className="mt-1 mb-6 text-sm text-ink-500">{dict.requests.subtitle}</p>
      <RequestsTable lang={lang} serviceTitles={serviceTitles} dict={dict.requests} />
    </div>
  );
}
