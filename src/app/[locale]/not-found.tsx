'use client';

import { useTranslations } from 'next-intl';

import { Container } from '@/components/GeneralContainers';
import LottieBall from '@/components/LottieBall';
import ButtonFancy from '@/components/ui/button-fancy';

function NotFoundContent() {
  const t = useTranslations('NotFound');

  return (
    <section className="flex min-h-screen items-center justify-center">
      <Container className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
          {/* Text Content */}
          <div className="flex w-full flex-col items-center text-center lg:w-1/2 lg:items-start lg:text-left">
            <h2 className="text-4xl font-normal tracking-normal sm:text-5xl lg:text-6xl">
              <span>{t('header')}</span>
              <span className="mt-2 block font-medium text-red-500">
                {t('paragraph')}
              </span>
            </h2>

            <p className="my-6 max-w-md font-normal tracking-normal">
              {t('message')}
            </p>

            <ButtonFancy
              text={t('button')}
              href="/"
              className="hidden w-full min-w-[200px] sm:block sm:w-auto"
            />
          </div>

          {/* Image Content */}
          <div className="flex w-full justify-center lg:w-1/2 lg:justify-end">
            <LottieBall />
          </div>
          <ButtonFancy
            text={t('button')}
            href="/"
            className="block w-full min-w-[200px] text-center sm:hidden sm:w-auto"
          />
        </div>
      </Container>
    </section>
  );
}

export default function NotFound() {
  return <NotFoundContent />;
}
