import type { Locale } from "@/i18n/config";

export const categories = ["licensing", "facilities", "memberships", "investment"] as const;
export type Category = (typeof categories)[number];

type Localized = Record<Locale, string>;

export interface Service {
  slug: string;
  category: Category;
  title: Localized;
  summary: Localized;
  requirements: Localized[];
  /** Processing time in working days. */
  durationDays: number;
  /** Fee in SAR; 0 means free. */
  fee: number;
  beneficiaries: ("individuals" | "organizations")[];
}

export const services: Service[] = [
  {
    slug: "sports-club-license",
    category: "licensing",
    title: { ar: "ترخيص نادٍ رياضي خاص", en: "Private sports club license" },
    summary: {
      ar: "إصدار ترخيص لتشغيل نادٍ رياضي خاص وفق الاشتراطات المعتمدة.",
      en: "Issue a license to operate a private sports club under the approved requirements.",
    },
    requirements: [
      { ar: "سجل تجاري ساري المفعول", en: "Valid commercial registration" },
      { ar: "عقد إيجار أو صك ملكية للموقع", en: "Lease contract or title deed for the site" },
      { ar: "مخطط معتمد للمنشأة", en: "Approved facility floor plan" },
    ],
    durationDays: 10,
    fee: 2500,
    beneficiaries: ["organizations"],
  },
  {
    slug: "license-renewal",
    category: "licensing",
    title: { ar: "تجديد ترخيص منشأة رياضية", en: "Sports facility license renewal" },
    summary: {
      ar: "تجديد ترخيص منشأة رياضية قائمة قبل انتهاء صلاحيته.",
      en: "Renew an existing sports facility license before it expires.",
    },
    requirements: [
      { ar: "رقم الترخيص الحالي", en: "Current license number" },
      { ar: "شهادة السلامة من الدفاع المدني", en: "Civil defense safety certificate" },
    ],
    durationDays: 5,
    fee: 1000,
    beneficiaries: ["organizations"],
  },
  {
    slug: "coach-certification",
    category: "licensing",
    title: { ar: "اعتماد مدرب رياضي", en: "Sports coach certification" },
    summary: {
      ar: "اعتماد المدربين الرياضيين وإصدار شهادة مزاولة المهنة.",
      en: "Certify sports coaches and issue a practice certificate.",
    },
    requirements: [
      { ar: "شهادة تدريبية معتمدة", en: "Accredited training certificate" },
      { ar: "شهادة إسعافات أولية سارية", en: "Valid first-aid certificate" },
    ],
    durationDays: 7,
    fee: 300,
    beneficiaries: ["individuals"],
  },
  {
    slug: "stadium-booking",
    category: "facilities",
    title: { ar: "حجز ملعب أو صالة رياضية", en: "Stadium or sports hall booking" },
    summary: {
      ar: "حجز الملاعب والصالات الرياضية العامة للفعاليات والتدريبات.",
      en: "Book public stadiums and sports halls for events and training.",
    },
    requirements: [
      { ar: "تحديد تاريخ ومدة الحجز", en: "Booking date and duration" },
      { ar: "خطة الفعالية وعدد الحضور المتوقع", en: "Event plan and expected attendance" },
    ],
    durationDays: 3,
    fee: 0,
    beneficiaries: ["individuals", "organizations"],
  },
  {
    slug: "event-permit",
    category: "facilities",
    title: { ar: "تصريح إقامة فعالية رياضية", en: "Sports event permit" },
    summary: {
      ar: "الحصول على تصريح لتنظيم فعالية أو بطولة رياضية.",
      en: "Get a permit to organize a sports event or tournament.",
    },
    requirements: [
      { ar: "خطة الأمن والسلامة", en: "Safety and security plan" },
      { ar: "موافقة مالك الموقع", en: "Venue owner approval" },
    ],
    durationDays: 14,
    fee: 500,
    beneficiaries: ["organizations"],
  },
  {
    slug: "academy-membership",
    category: "memberships",
    title: { ar: "عضوية أكاديمية رياضية", en: "Sports academy membership" },
    summary: {
      ar: "تسجيل اللاعبين في الأكاديميات الرياضية المعتمدة.",
      en: "Register players in accredited sports academies.",
    },
    requirements: [
      { ar: "صورة الهوية الوطنية", en: "National ID copy" },
      { ar: "تقرير لياقة طبية", en: "Medical fitness report" },
    ],
    durationDays: 2,
    fee: 0,
    beneficiaries: ["individuals"],
  },
  {
    slug: "federation-membership",
    category: "memberships",
    title: { ar: "عضوية اتحاد رياضي", en: "Sports federation membership" },
    summary: {
      ar: "انضمام الأندية والمنشآت إلى عضوية الاتحادات الرياضية.",
      en: "Join a sports federation as a club or organization.",
    },
    requirements: [
      { ar: "ترخيص المنشأة", en: "Facility license" },
      { ar: "النظام الأساسي للنادي", en: "Club bylaws" },
    ],
    durationDays: 10,
    fee: 750,
    beneficiaries: ["organizations"],
  },
  {
    slug: "investment-opportunity",
    category: "investment",
    title: { ar: "التقديم على فرصة استثمارية", en: "Apply for an investment opportunity" },
    summary: {
      ar: "استعراض الفرص الاستثمارية في القطاع الرياضي والتقديم عليها.",
      en: "Explore investment opportunities in the sports sector and apply.",
    },
    requirements: [
      { ar: "القوائم المالية لآخر سنتين", en: "Financial statements for the last two years" },
      { ar: "دراسة جدوى مبدئية", en: "Preliminary feasibility study" },
    ],
    durationDays: 21,
    fee: 0,
    beneficiaries: ["organizations"],
  },
  {
    slug: "club-privatization",
    category: "investment",
    title: { ar: "طلب الاستحواذ على نادٍ", en: "Club acquisition request" },
    summary: {
      ar: "تقديم طلب للاستحواذ على حصة في أحد الأندية الرياضية.",
      en: "Submit a request to acquire a stake in a sports club.",
    },
    requirements: [
      { ar: "خطاب نوايا رسمي", en: "Formal letter of intent" },
      { ar: "إثبات الملاءة المالية", en: "Proof of financial capacity" },
    ],
    durationDays: 30,
    fee: 0,
    beneficiaries: ["organizations"],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((service) => service.slug === slug);
}

/** Case-insensitive search across both languages, optionally scoped to a category. */
export function filterServices(
  list: Service[],
  { query = "", category }: { query?: string; category?: Category },
): Service[] {
  const needle = query.trim().toLowerCase();
  return list.filter((service) => {
    if (category && service.category !== category) return false;
    if (!needle) return true;
    return [service.title.ar, service.title.en, service.summary.ar, service.summary.en].some(
      (text) => text.toLowerCase().includes(needle),
    );
  });
}

export function averageDuration(list: Service[]): number {
  if (list.length === 0) return 0;
  return Math.round(list.reduce((sum, s) => sum + s.durationDays, 0) / list.length);
}
