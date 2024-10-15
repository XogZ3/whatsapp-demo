/* eslint-disable no-nested-ternary */
/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { sendGAEvent } from '@next/third-parties/google';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container, Section } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';

export default function HeroSection() {
  const t = useTranslations('HeroSection');

  return (
    <Section className="py-4 sm:py-10">
      <Container className="relative flex flex-col items-center justify-center sm:grid sm:grid-cols-2">
        {/* Text Content */}
        <div className="flex w-full flex-col items-center justify-center text-center sm:items-start sm:justify-start sm:text-start">
          <h1 className="flex flex-col gap-y-4 text-center text-5xl font-normal tracking-normal sm:text-left sm:text-6xl">
            {t('header_1')} <br />
          </h1>
          <p className="gap-x-2 text-center text-5xl sm:text-left sm:text-6xl">
            {t('conjunction')} <br />
          </p>
          <p className="gap-x-2 text-center text-5xl sm:text-left sm:text-6xl">
            <Link
              href="https://wa.me/971505072100"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline decoration-red-500 decoration-4 underline-offset-4 transition-all duration-200 ease-in-out sm:hover:text-opacity-80 sm:hover:underline-offset-8"
            >
              {t('header_2')}
            </Link>
          </p>

          <h2 className="!mb-0 py-6 text-center font-normal tracking-normal sm:text-left">
            {t('subheader')}
          </h2>
          <ul className="mb-6 hidden space-y-2 text-sm sm:block sm:text-base">
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
            href="https://wa.me/971505072100"
            className="w-fit min-w-64"
            onClick={() =>
              sendGAEvent('event', 'conversion', {
                send_to: 'AW-16638273706/MO7nCOGP0dsZEKrR3_09',
                event_category: 'conversion',
              })
            }
          />
        </div>
        {/* Image Content */}
        <div className="flex w-full justify-end">
          <div className="mt-10 flex w-full flex-col items-end sm:mt-0 sm:w-[calc(100%-2rem)]">
            <div className="mb-4 flex w-full items-center justify-center text-center text-3xl font-semibold sm:hidden">
              Upload selfies and take AI photos
            </div>
            <div className="mb-2 grid h-20 w-full grid-cols-4 gap-2 sm:w-3/4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="relative w-full pb-[100%]">
                  <Image
                    src={`/assets/images/hero_man_${num}.webp`}
                    alt={`Man ${num}`}
                    fill
                    sizes="(min-width: 1220px) 90px, (min-width: 640px) calc(8.57vw - 13px), calc(25vw - 18px)"
                    style={{
                      objectPosition: `0% ${num === 1 ? '5%' : num === 4 ? '10%' : '0%'}`,
                      objectFit: 'cover',
                    }}
                    className="absolute inset-0 size-full rounded-lg object-cover"
                    quality={75}
                  />
                </div>
              ))}
            </div>
            <div className="relative flex h-[50px] w-full items-center justify-center sm:w-3/4">
              <Image
                src="/assets/images/arrow_black.png"
                alt="Arrow"
                width={80}
                height={80}
                sizes="(max-width: 6rem) 6rem, 16rem"
                className="absolute inset-0 m-auto block dark:hidden"
                quality={75}
              />
              <Image
                src="/assets/images/arrow_white.png"
                alt="Arrow"
                width={80}
                height={80}
                sizes="(max-width: 6rem) 6rem, 16rem"
                className="absolute inset-0 m-auto hidden dark:block"
                quality={75}
              />
            </div>
            {/* AI-generated image */}
            <div className="relative flex w-full items-center justify-center sm:w-3/4">
              <div className="relative h-[444px] w-[250px]">
                <div className="size-full overflow-hidden rounded-lg">
                  <Image
                    src="/assets/images/hero_man_ai.webp"
                    alt={t('ai_generated')}
                    width={250}
                    height={444}
                    className="object-cover"
                    priority
                    loading="eager"
                    sizes="(min-width: 840px) 250px, (min-width: 640px) calc(32.22vw - 14px), 250px"
                  />
                </div>
                <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-red-500 px-2 py-1 text-xs tracking-normal text-black">
                  {t('ai_generated')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
