/**
 * A tiny localStorage-backed store for submitted requests.
 * In a real portal this would be an API; the interface is kept small so it can be swapped.
 */

export const requestStatuses = ["submitted", "in_review", "approved", "rejected"] as const;
export type RequestStatus = (typeof requestStatuses)[number];

export interface ServiceRequest {
  id: string;
  serviceSlug: string;
  applicantName: string;
  submittedAt: string;
  status: RequestStatus;
}

const STORAGE_KEY = "khadamat:requests";
const EMPTY: ServiceRequest[] = [];

const listeners = new Set<() => void>();
let cache: { raw: string | null; value: ServiceRequest[] } | null = null;

function read(): ServiceRequest[] {
  if (typeof window === "undefined") return EMPTY;
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return EMPTY;
  }
  // Return a stable reference while storage is unchanged (required by useSyncExternalStore).
  if (cache && cache.raw === raw) return cache.value;
  let value: ServiceRequest[] = EMPTY;
  try {
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) value = parsed as ServiceRequest[];
  } catch {
    value = EMPTY;
  }
  cache = { raw, value };
  return value;
}

function write(requests: ServiceRequest[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
  } catch {
    // Storage can be unavailable (private mode, quota); the demo simply won't persist.
  }
  listeners.forEach((listener) => listener());
}

export function generateRequestId(now: Date = new Date(), random: () => number = Math.random) {
  const serial = Math.floor(random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `REQ-${now.getFullYear()}-${serial}`;
}

export const requestsStore = {
  getSnapshot: read,
  getServerSnapshot: () => EMPTY,
  subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  },
  add(request: Omit<ServiceRequest, "id" | "submittedAt" | "status">): ServiceRequest {
    const created: ServiceRequest = {
      ...request,
      id: generateRequestId(),
      submittedAt: new Date().toISOString(),
      status: "submitted",
    };
    write([created, ...read()]);
    return created;
  },
  clear() {
    write([]);
  },
};
