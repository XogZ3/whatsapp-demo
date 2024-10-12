/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { sendGAEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import { Container } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';

export default function HeroSection() {
  const t = useTranslations('HeroSection');

  return (
    <div className="py-4 sm:py-10">
      <Container className="relative flex flex-col items-center justify-center sm:grid sm:grid-cols-2">
        <div className="flex w-full flex-col items-center justify-center text-center sm:items-start sm:justify-start sm:text-start">
          <h1 className="flex flex-col gap-y-4 text-center text-5xl font-normal tracking-normal sm:text-left sm:text-6xl">
            <Balancer>
              {t('header_1')} <br />
            </Balancer>
          </h1>
          <p className="gap-x-2 text-center text-5xl sm:text-left sm:text-6xl">
            {t('conjunction')}{' '}
            <Link
              href="https://wa.me/971505072100"
              target="_blank"
              className="font-medium underline decoration-green-500 decoration-4 underline-offset-4 transition-all duration-200 ease-in-out hover:text-opacity-80 hover:underline-offset-8"
            >
              {t('header_2')}
            </Link>
          </p>

          <h2 className="!mb-0 py-6 text-center font-normal tracking-normal sm:text-left">
            <Balancer>{t('subheader')}</Balancer>
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
        <div className="mt-10 flex w-full flex-col items-center justify-center sm:mt-0">
          <div className="mb-2 grid h-20 w-full grid-cols-4 gap-2 sm:w-3/4">
            <div className="relative w-full pb-[100%]">
              <Image
                src="/assets/images/og_woman_1.webp"
                alt="woman 1"
                width={100}
                height={100}
                style={{ objectPosition: '0% 5%', objectFit: 'cover' }}
                className="absolute inset-0 size-full rounded-lg object-cover"
              />
            </div>
            <div className="relative w-full pb-[100%]">
              <Image
                src="/assets/images/og_woman_2.webp"
                alt="woman 2"
                width={100}
                height={100}
                style={{ objectPosition: '0% 0%', objectFit: 'cover' }}
                className="absolute inset-0 size-full rounded-lg object-cover"
              />
            </div>
            <div className="relative w-full pb-[100%]">
              <Image
                src="/assets/images/og_woman_3.webp"
                alt="woman 3"
                width={100}
                height={100}
                style={{ objectPosition: '0% 0%', objectFit: 'cover' }}
                className="absolute inset-0 size-full rounded-lg object-cover"
              />
            </div>
            <div className="relative w-full pb-[100%]">
              <Image
                src="/assets/images/og_woman_4.webp"
                alt="woman 4"
                width={100}
                height={100}
                style={{ objectPosition: '0% 10%', objectFit: 'cover' }}
                className="absolute inset-0 size-full rounded-lg object-cover"
              />
            </div>
          </div>
          <div className="">
            <Image
              src="/assets/images/arrow_black.png"
              alt="Arrow"
              width={80}
              height={50}
              className="block dark:hidden"
            />
            <Image
              src="/assets/images/arrow_white.png"
              alt="Arrow"
              width={80}
              height={50}
              className="hidden dark:block"
            />
          </div>
          <div className="relative">
            <Image
              src="/assets/images/woman_cafe.webp"
              alt="AI Generated"
              width={250}
              height={250}
              className="rounded-lg"
            />
            <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-green-500 px-2 py-1 text-xs text-black">
              AI generated photo
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
