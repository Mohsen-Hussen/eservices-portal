import Link from "next/link";

import { buttonClasses } from "@/components/ui/button";

// not-found.tsx receives no params; show both languages so it works under any locale.
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="text-5xl font-bold text-brand-600">404</p>
      <h1 className="text-xl font-bold text-ink-900">
        <span lang="ar">الصفحة غير موجودة</span> · <span lang="en">Page not found</span>
      </h1>
      <div className="mt-4 flex gap-3">
        <Link href="/ar" className={buttonClasses()} lang="ar">
          الرئيسية
        </Link>
        <Link href="/en" className={buttonClasses({ variant: "secondary" })} lang="en">
          Home
        </Link>
      </div>
    </div>
  );
}
