/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';

import { cn } from '@/libs/utils';

import { Container } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';
import { DotPattern } from '../ui/magicui/dot';

export default function SuccessSection({ clientid }: { clientid: string }) {
  const t = useTranslations('SuccessSection');

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full items-center justify-center">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center sm:static">
        <div className="hero__heading !mb-1 text-5xl tracking-tight opacity-100 sm:!mb-0 sm:text-7xl">
          {t('header')} <br />
          <span className="whitespace-pre-wrap font-medium underline decoration-green-500 decoration-4 underline-offset-4">
            {t('subheader')}
          </span>
        </div>

        {clientid && (
          <p className="pt-4 text-lg">
            {t('subheader_2')}: {clientid}
          </p>
        )}

        <h2 className="hero__body !mb-0 py-6 font-normal tracking-tight opacity-100">
          {t('next_step')}
        </h2>
        <ButtonFancy
          text={t('button_go_to_whatsapp')}
          path="https://wa.me/971505072100"
          className="hero__button min-w-[185px] text-lg font-semibold"
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
