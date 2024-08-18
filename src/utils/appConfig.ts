import type { LocalePrefix } from 'next-intl/routing';

const localePrefix: LocalePrefix = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'fotolabs.ai',
  locales: ['en', 'pt'],
  defaultLocale: 'en',
  localePrefix,
  url: '',
  vercelUrl: '',
  phone: '',
  email: process.env.NEXT_PUBLIC_EMAIL,
};
