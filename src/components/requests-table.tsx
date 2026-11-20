"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore } from "react";
import { Inbox } from "lucide-react";

import type { Locale } from "@/i18n/config";
import { formatDate } from "@/i18n/format";
import type { Dictionary } from "@/i18n/get-dictionary";
import { requestStatuses, requestsStore, type RequestStatus } from "@/lib/requests-store";
import type { Service } from "@/lib/services";
import { Badge, type BadgeTone } from "./ui/badge";
import { buttonClasses } from "./ui/button";

const statusTone: Record<RequestStatus, BadgeTone> = {
  submitted: "info",
  in_review: "neutral",
  approved: "success",
  rejected: "danger",
};

interface RequestsTableProps {
  lang: Locale;
  serviceTitles: Record<Service["slug"], string>;
  dict: Dictionary["requests"];
}

export function RequestsTable({ lang, serviceTitles, dict }: RequestsTableProps) {
  const requests = useSyncExternalStore(
    requestsStore.subscribe,
    requestsStore.getSnapshot,
    requestsStore.getServerSnapshot,
  );
  const [status, setStatus] = useState<RequestStatus | "all">("all");
  const filterId = useId();

  const visible = status === "all" ? requests : requests.filter((r) => r.status === status);

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-ink-200 bg-white p-12 text-center">
        <Inbox aria-hidden className="size-10 text-ink-400" />
        <p className="text-ink-500">{dict.empty}</p>
        <Link href={`/${lang}#catalog`} className={buttonClasses()}>
          {dict.browse}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <label htmlFor={filterId} className="text-sm font-medium text-ink-700">
          {dict.filterLabel}
        </label>
        <select
          id={filterId}
          value={status}
          onChange={(event) => setStatus(event.target.value as RequestStatus | "all")}
          className="h-10 rounded-lg border border-ink-200 bg-white px-3 text-sm"
        >
          <option value="all">{dict.all}</option>
          {requestStatuses.map((value) => (
            <option key={value} value={value}>
              {dict.statuses[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-ink-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-ink-50 text-start text-xs text-ink-500">
            <tr>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {dict.number}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {dict.service}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {dict.date}
              </th>
              <th scope="col" className="px-4 py-3 text-start font-semibold">
                {dict.status}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {visible.map((request) => (
              <tr key={request.id}>
                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                  <span dir="ltr">{request.id}</span>
                </td>
                <td className="px-4 py-3 font-medium text-ink-900">
                  {serviceTitles[request.serviceSlug] ?? request.serviceSlug}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-ink-500">
                  {formatDate(request.submittedAt, lang)}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={statusTone[request.status]}>{dict.statuses[request.status]}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
