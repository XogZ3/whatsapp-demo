/* eslint-disable no-nested-ternary */
/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { sendGAEvent } from '@next/third-parties/google';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import type { AllowedUseCases } from '@/app/[locale]/(unauth)/[usecase]/page';

import { Container, Section } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';

export default function UseCaseHeroSection({
  useCase = 'HeroSection',
}: {
  useCase: AllowedUseCases;
}) {
  const t = useTranslations(useCase as keyof IntlMessages);

  return (
    <Section className="py-4 sm:py-10">
      <Container className="relative flex flex-col items-center justify-center sm:grid sm:grid-cols-2">
        {/* Text Content */}
        <div className="flex w-full flex-col items-center justify-center text-center sm:items-start sm:justify-start sm:text-start">
          <h1 className="flex flex-col gap-y-4 text-center text-5xl font-normal tracking-normal sm:text-left sm:text-6xl">
            {t('header_1')} <br />
          </h1>
          <h2 className="!mb-0 py-6 text-center font-normal tracking-normal sm:text-left">
            {t('subheader')}
          </h2>
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
            <h3 className="mb-4 flex w-full items-center justify-center text-center text-3xl font-semibold sm:hidden">
              {t('mobile_subheader')}
            </h3>
            <div className="mb-2 grid h-20 w-full grid-cols-4 gap-2 sm:w-3/4">
              {[1, 2, 3, 4].map((num) => (
                <div key={num} className="relative w-full pb-[100%]">
                  <Image
                    src={`/assets/images/usecases/${useCase}_${num}.webp`}
                    alt={`woman ${num}`}
                    fill
                    sizes="(max-width: 768px) 25vw, 20vw"
                    style={{
                      objectPosition: `0% ${num === 1 ? '5%' : num === 4 ? '10%' : '0%'}`,
                      objectFit: 'cover',
                    }}
                    className="absolute inset-0 size-full rounded-lg object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="relative flex h-[50px] w-full items-center justify-center sm:w-3/4">
              <Image
                src="/assets/images/arrow_black.png"
                alt="Arrow"
                width={80}
                height={50}
                className="absolute inset-0 m-auto block dark:hidden"
              />
              <Image
                src="/assets/images/arrow_white.png"
                alt="Arrow"
                width={80}
                height={50}
                className="absolute inset-0 m-auto hidden dark:block"
              />
            </div>
            {/* AI-generated image */}
            <div className="relative flex w-full items-center justify-center sm:w-3/4">
              <div className="relative h-[444px] w-[250px]">
                <div className="size-full overflow-hidden rounded-lg">
                  <Image
                    src={`/assets/images/usecases/${useCase}_ai.webp`}
                    alt={t('ai_generated')}
                    width={250}
                    height={444}
                    className="object-cover"
                    priority
                    loading="eager"
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
