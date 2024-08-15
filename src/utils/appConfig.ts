import type { LocalePrefix } from 'next-intl/routing';

import { Env } from '@/libs/Env.mjs';

const localePrefix: LocalePrefix = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'VideoGPT.ai',
  locales: ['en', 'pt'],
  defaultLocale: 'en',
  localePrefix,
  url: '',
  vercelUrl: '',
  phone: '',
  email: Env.NEXT_PUBLIC_EMAIL,
};
