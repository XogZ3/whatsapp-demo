'use client';

import { sendGAEvent } from '@next/third-parties/google';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container, Section } from '@/components/GeneralContainers';
import ButtonFancy from '@/components/ui/button-fancy';

export default function ImagineMeHeroSection() {
  const t = useTranslations('imagine-me');

  return (
    <Section className="py-4 sm:py-10">
      <Container className="flex flex-col items-center lg:flex-row lg:items-center lg:justify-between">
        {/* Left column: Header, CTA, and Comparison Table (on desktop) */}
        <div className="w-full lg:w-1/2 lg:pr-8">
          <h1 className="mb-4 text-center text-4xl font-normal tracking-normal sm:text-5xl lg:text-left">
            <span className="block font-medium text-red-500">
              {t('imagine_me')}
            </span>
            <span>{t('header_1')}</span>
          </h1>

          <ButtonFancy
            text={t('web_cta')}
            href="https://wa.me/971505072100"
            className="mb-8 w-full max-w-xs lg:mx-0"
            onClick={() =>
              sendGAEvent('event', 'conversion', {
                send_to: 'AW-16638273706/MO7nCOGP0dsZEKrR3_09',
                event_category: 'conversion',
              })
            }
          />

          {/* Comparison Table (visible only on desktop) */}
          <div className="hidden w-full max-w-md overflow-hidden rounded-lg border border-gray-200 lg:block lg:max-w-full">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="">
                  <th className="p-2">{t('comparison_table.feature')}</th>
                  <th className="p-2 text-center">WhatsApp</th>
                  <th className="p-2 text-center">FotoLabs</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    feature: t('comparison_table.high_quality'),
                    whatsapp: false,
                    fotolabs: true,
                  },
                  {
                    feature: t('comparison_table.photorealistic'),
                    whatsapp: false,
                    fotolabs: true,
                  },
                  {
                    feature: t('comparison_table.accurate_to_you'),
                    whatsapp: false,
                    fotolabs: true,
                  },
                  {
                    feature: t('comparison_table.unlimited_scenarios'),
                    whatsapp: false,
                    fotolabs: true,
                  },
                  {
                    feature: t('comparison_table.use_in_whatsapp'),
                    whatsapp: true,
                    fotolabs: true,
                  },
                ].map((row, index) => (
                  <tr
                    key={row.feature}
                    className={index % 2 === 0 ? '' : 'bg-gray-100/10'}
                  >
                    <td className="p-2">{row.feature}</td>
                    <td className="p-2 text-center">
                      {row.whatsapp ? '✅' : '❌'}
                    </td>
                    <td className="p-2 text-center">
                      {row.fotolabs ? '✅' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column: Comparison Images */}
        <div className="mt-8 w-full lg:mt-0 lg:w-1/2">
          <div className="grid w-full grid-cols-2 gap-4 lg:aspect-[9/16] lg:h-[500px]">
            <div className="relative aspect-square w-full lg:aspect-auto">
              <Image
                src="/assets/images/usecases/whatsapp_imagine_me.webp"
                alt="WhatsApp Imagine Me"
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="rounded-lg object-cover"
              />
              <div className="absolute right-0 top-0 rounded-tr-lg bg-amber-500 px-2 py-1 text-xs text-black sm:text-sm">
                WhatsApp
              </div>
            </div>
            <div className="relative aspect-square w-full lg:aspect-auto">
              <Image
                src="/assets/images/usecases/fotolabs_imagine_me.webp"
                alt="FotoLabs AI Imagine Me"
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="rounded-lg object-cover"
                style={{ objectPosition: '0% 17%' }}
              />
              <div className="absolute right-0 top-0 rounded-tr-lg bg-red-500 px-2 py-1 text-xs text-white sm:text-sm">
                FotoLabs AI
              </div>
            </div>
          </div>
        </div>

        {/* Comparison Table (visible only on mobile) */}
        <div className="mt-8 w-full max-w-md overflow-hidden rounded-lg border border-gray-200 lg:hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="">
                <th className="p-2">{t('comparison_table.feature')}</th>
                <th className="p-2">WhatsApp</th>
                <th className="p-2">FotoLabs</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  feature: t('comparison_table.high_quality'),
                  whatsapp: false,
                  fotolabs: true,
                },
                {
                  feature: t('comparison_table.photorealistic'),
                  whatsapp: false,
                  fotolabs: true,
                },
                {
                  feature: t('comparison_table.accurate_to_you'),
                  whatsapp: false,
                  fotolabs: true,
                },
                {
                  feature: t('comparison_table.unlimited_scenarios'),
                  whatsapp: false,
                  fotolabs: true,
                },
                {
                  feature: t('comparison_table.use_in_whatsapp'),
                  whatsapp: true,
                  fotolabs: true,
                },
              ].map((row, index) => (
                <tr
                  key={row.feature}
                  className={index % 2 === 0 ? '' : 'bg-gray-100/10'}
                >
                  <td className="p-2">{row.feature}</td>
                  <td className="p-2 text-center">
                    {row.whatsapp ? '✅' : '❌'}
                  </td>
                  <td className="p-2 text-center">
                    {row.fotolabs ? '✅' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  );
}
