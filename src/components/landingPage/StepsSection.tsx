'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import {
  TRAINING_IMAGES_LOWER_LIMIT,
  TRAINING_IMAGES_UPPER_LIMIT,
} from '@/utils/constants';

import { Section } from '../GeneralContainers';

export default function StepsSection() {
  const t = useTranslations('StepsSection');
  return (
    <Section className="px-2 sm:px-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className=" text-3xl font-bold sm:text-4xl xl:text-5xl">
            {t('header')}
          </h2>
          <p className=" mx-auto mt-5 max-w-md text-base font-normal">
            {t('subheader')}
          </p>
        </div>

        <div className="mx-auto mt-8 flex max-w-md flex-col items-stretch lg:mt-20 lg:max-w-none lg:flex-row">
          <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-black">
            <div className="flex h-full flex-col px-9 py-8">
              <div className=" inline-flex size-10 items-center justify-start rounded-xl text-base font-bold">
                1
              </div>
              <p className=" mt-5 grow text-lg font-medium">
                {t('step_1_1')}{' '}
                <Link
                  href="https://wa.me/971505072100"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-green-500 underline-offset-4 transition-colors duration-200 ease-in-out hover:text-green-500"
                >
                  {t('step_1_2')}
                </Link>{' '}
                {t('step_1_3')} <s>$29.99</s> $19.99
              </p>
            </div>
          </div>

          <div className="flex items-center justify-center py-4 lg:hidden">
            <svg
              className="h-auto w-4 rotate-90 text-gray-300"
              viewBox="0 0 16 32"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 21)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 14)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 7)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 0)"
              />
            </svg>
          </div>

          <div className="hidden lg:-mx-2 lg:flex lg:items-center">
            <svg
              className="h-4 w-auto text-gray-300"
              viewBox="0 0 81 16"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 11 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 46 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 81 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 18 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 53 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 25 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 60 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 32 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 67 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 39 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 74 1)"
              />
            </svg>
          </div>

          <div className="relative flex-1">
            <div className="absolute -inset-4">
              <div
                className="mx-auto size-full rotate-180 opacity-20 blur-lg"
                style={{
                  background:
                    'linear-gradient(90deg, #44ff9a -0.55%, #44b0ff 22.86%, #8b44ff 48.36%, #ff6644 73.33%, #ebff70 99.34%)',
                }}
              />
            </div>

            <div className="relative h-full overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-black">
              <div className="flex h-full flex-col px-9 py-8">
                <div className=" inline-flex size-10 items-center justify-start rounded-xl text-base font-bold">
                  2
                </div>
                <p className=" mt-5 grow text-lg font-medium">
                  {t('step_2', {
                    lowerLimit: TRAINING_IMAGES_LOWER_LIMIT,
                    upperLimit: TRAINING_IMAGES_UPPER_LIMIT,
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden lg:-mx-2 lg:flex lg:items-center">
            <svg
              className="h-4 w-auto text-gray-300"
              viewBox="0 0 81 16"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 11 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 46 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 81 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 18 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 53 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 25 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 60 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 32 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 67 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 39 1)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(-0.5547 0.83205 0.83205 0.5547 74 1)"
              />
            </svg>
          </div>

          <div className="flex items-center justify-center py-4 lg:hidden">
            <svg
              className="h-auto w-4 rotate-90 text-gray-300"
              viewBox="0 0 16 32"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 21)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 14)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 7)"
              />
              <line
                y1="-0.5"
                x2="18.0278"
                y2="-0.5"
                transform="matrix(0.83205 0.5547 0.5547 -0.83205 1 0)"
              />
            </svg>
          </div>

          <div className="relative flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:bg-black">
            <div className="flex h-full flex-col px-9 py-8">
              <div className=" inline-flex size-10 items-center justify-start rounded-xl text-base font-bold">
                3
              </div>
              <p className=" mt-5 grow text-lg font-medium">{t('step_3')}</p>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
