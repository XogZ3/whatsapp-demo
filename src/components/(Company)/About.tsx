/* eslint-disable tailwindcss/no-custom-classname */

import { useTranslations } from 'next-intl';

import { AppConfig } from '@/utils/appConfig';

export default function About() {
  const appName = AppConfig.name;
  const t = useTranslations('About');

  return (
    <section
      id="hero"
      className="flex w-full flex-col items-center md:flex-row md:justify-center"
    >
      {/* left */}
      <div className="hidden h-screen flex-col items-start justify-center md:flex md:w-1/2 md:grow md:px-10">
        <h1 className="my-2 pb-4 md:pb-10">
          {t('meta_title', { appName: AppConfig.name })}
          GOKUL HI hello
        </h1>
        <p className="my-2 sm:text-base md:text-sm lg:text-base">
          {t('about_paragraph_1', { appName })}
        </p>
      </div>
    </section>
  );
}
