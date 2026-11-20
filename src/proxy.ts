import { NextResponse, type NextRequest } from "next/server";

import { locales } from "./i18n/config";
import { detectLocale } from "./i18n/detect-locale";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = detectLocale(request.headers.get("accept-language"));
  request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next.js internals and static files.
  matcher: ["/((?!_next|favicon.ico|.*\\..*).*)"],
};
