import type { LocalePrefix } from 'next-intl/routing';

const localePrefix: LocalePrefix = 'as-needed';

// FIXME: Update this configuration file based on your project information
export const AppConfig = {
  name: 'FotoLabs AI',
  locales: ['en', 'pt'],
  defaultLocale: 'en',
  localePrefix,
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://fotolabs.ai',
  vercelUrl: '',
  phone: '',
  email: process.env.NEXT_PUBLIC_EMAIL,
};
