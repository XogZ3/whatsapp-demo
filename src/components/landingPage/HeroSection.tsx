/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import { cn } from '@/libs/utils';

import { Container } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';
import { DotPattern } from '../ui/magicui/dot';

export default function HeroSection() {
  const t = useTranslations('HeroSection');

  return (
    <div className="py-4 sm:py-14">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center">
        <div className="!mb-1 text-5xl tracking-tight sm:!mb-0 sm:text-7xl">
          <Balancer>
            {t('header_1')} <br />
            <span className="whitespace-pre-wrap font-medium underline decoration-green-500 decoration-4 underline-offset-4">
              {t('header_2')}
            </span>
          </Balancer>
        </div>

        <h2 className="!mb-0 py-6 font-normal tracking-tight">
          <Balancer>{t('subheader')}</Balancer>
        </h2>
        <ButtonFancy
          text={t('web_cta')}
          path="https://wa.me/971505072100"
          className="hidden min-w-[185px] text-lg font-semibold sm:block"
        />
      </Container>
      <DotPattern
        className={cn(
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
        )}
      />
    </div>
  );
}
