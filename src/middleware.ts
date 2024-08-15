/* eslint-disable no-useless-escape */
import { type NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AppConfig } from './utils/appConfig';

const intlMiddleware = createMiddleware({
  locales: AppConfig.locales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

// export default intlMiddleware;
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for an API route
  if (pathname.match(/^\/[^\/]+\/api\//)) {
    // For API routes, remove the locale prefix and forward the request
    const newUrl = new URL(request.url);
    newUrl.pathname = pathname.replace(/^\/[^\/]+\/api/, '/api');
    return NextResponse.rewrite(newUrl);
  }

  // For non-API routes, use the intl middleware
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
