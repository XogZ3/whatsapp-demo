/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import { Container } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';

export default function HeroSection() {
  const t = useTranslations('HeroSection');

  return (
    <div className="py-4 sm:py-14">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center leading-8">
        <div className="flex flex-col gap-y-4 text-5xl tracking-normal sm:text-7xl">
          <Balancer>
            {t('header_1')} <br />
          </Balancer>
          <span className="font-medium underline decoration-green-500 decoration-4 underline-offset-4">
            {t('header_2')}
          </span>
        </div>

        <h2 className="!mb-0 py-6 font-normal tracking-normal">
          <Balancer>{t('subheader')}</Balancer>
        </h2>
        <ButtonFancy
          text={t('web_cta')}
          path="https://wa.me/971505072100"
          className="min-w-[185px] text-lg font-semibold"
        />
      </Container>
    </div>
  );
}
