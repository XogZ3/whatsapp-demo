/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { sendGAEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container, Section } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';

export default function LastSection() {
  const t = useTranslations('LastSection');

  return (
    <Section className="flex w-full items-center justify-center bg-black py-4 dark:bg-white sm:py-10">
      <Container noYPadding className="w-full">
        <div className="relative flex min-w-full grow flex-col-reverse items-center justify-between rounded-3xl bg-white dark:bg-black sm:h-[600px] sm:flex-row">
          {/* Content section */}
          <div className="flex w-full flex-col items-center justify-center px-4 pb-4 sm:w-2/3 sm:items-start sm:justify-start sm:px-8">
            <h2 className="flex flex-col gap-y-4 text-5xl font-normal tracking-normal sm:text-6xl">
              {t('header_1')} <br />
            </h2>
            <p className="gap-x-2 text-5xl sm:text-6xl">
              {t('conjunction')}{' '}
              <Link
                href="https://wa.me/971505072100"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline decoration-green-500 decoration-4 underline-offset-4 transition-all duration-200 ease-in-out hover:text-opacity-80 hover:underline-offset-8"
              >
                {t('header_2')}
              </Link>
            </p>

            <h2 className="!mb-0 py-6 font-normal tracking-normal sm:text-xl">
              {t('subheader')}
            </h2>
            <ul className="mb-6 space-y-2 text-sm sm:text-base">
              <li className="flex items-center">
                <span className="mr-2">✏️</span>
                {t('subheader_4')}
              </li>
              <li className="flex items-center">
                <span className="mr-2">📸</span>
                {t('subheader_3')}
              </li>
              <li className="flex items-center">
                <span className="mr-2">🛍️</span>
                {t('subheader_2')}
              </li>
            </ul>
            <ButtonFancy
              text={t('web_cta')}
              path="https://wa.me/971505072100"
              className="w-fit min-w-[185px] text-lg font-semibold"
              onClick={() =>
                sendGAEvent('event', 'conversion', {
                  send_to: 'AW-16638273706/MO7nCOGP0dsZEKrR3_09',
                  event_category: 'conversion',
                })
              }
            />
          </div>

          {/* Image section */}
          <div className="relative mb-8 h-[300px] w-full rounded-t-3xl bg-black dark:bg-white sm:mb-0 sm:h-full sm:w-1/3 sm:rounded-r-3xl sm:rounded-t-none">
            <Image
              src="/assets/images/man (4).jpg"
              alt="FotoLabs"
              fill
              style={{ objectPosition: '0% 20%', objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, 33vw"
              className="rounded-t-3xl sm:rounded-l-none sm:rounded-r-3xl"
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
