/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { AppConfig } from '@/utils/appConfig';
import { opacityVariant } from '@/utils/motion';

import LottieBall from '../LottieBall';

export default function About() {
  const appName = AppConfig.name;
  const t = useTranslations('About');

  const variants = opacityVariant;

  return (
    <section
      id="hero"
      className="flex w-full flex-col items-center md:flex-row md:justify-center"
    >
      {/* left */}
      <motion.div
        variants={variants}
        initial={variants.initial}
        animate={variants.animate}
        transition={{ duration: 0.4, delay: 0 }}
        className="hidden h-screen flex-col items-start justify-center md:flex md:w-1/2 md:grow md:px-10"
        // style={{ minHeight: height }}
      >
        <h1 className="my-2 pb-4 md:pb-10">
          {t('meta_title', { appName: AppConfig.name })}
        </h1>
        <p className="my-2 sm:text-base md:text-sm lg:text-base">
          {t('about_paragraph_1', { appName })}
        </p>
      </motion.div>

      {/* top - mobile version */}
      <motion.div
        variants={variants}
        initial={variants.initial}
        animate={variants.animate}
        transition={{ duration: 0.4, delay: 0 }}
        className="h-fit grow flex-col items-start justify-center px-4 md:hidden"
        // style={{ minHeight: height }}
      >
        <h1 className="my-2 pb-4 md:pb-10">
          {t('meta_title', { appName: AppConfig.name })}
        </h1>
        <p className="my-2 sm:text-base md:text-base">
          {t('about_paragraph_1', { appName })}
        </p>
      </motion.div>

      {/* right - web | bottom - mobile */}
      <motion.div
        variants={variants}
        initial={variants.initial}
        animate={variants.animate}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex w-full items-center justify-center px-2 py-4 md:w-1/2 md:px-0"
      >
        <LottieBall />
      </motion.div>
      <motion.div
        variants={variants}
        initial={variants.initial}
        animate={variants.animate}
        transition={{ duration: 0.4, delay: 0 }}
        className="bg-opacity/60 flex flex-col items-center justify-center rounded-b-[250px] bg-zinc-300 px-4 dark:bg-zinc-700 md:hidden"
      >
        <h1 className="text-center text-2xl md:my-2">
          For Booking / Support, Call Us
        </h1>
        <h2 className="animate-text bg-gradient-to-r from-red-500 via-purple-500 to-orange-500 bg-clip-text text-xl font-bold text-transparent sm:text-3xl md:my-2 md:text-5xl">
          {AppConfig.phone}
        </h2>
      </motion.div>
    </section>
  );
}
