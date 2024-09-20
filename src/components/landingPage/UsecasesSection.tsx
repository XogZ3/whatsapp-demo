/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import Image from 'next/image';
import * as React from 'react';

import { Container } from '../GeneralContainers';

export default function UsecasesSection() {
  return (
    <div className="bg-green-300 py-4 dark:bg-green-600 sm:py-14">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center sm:static">
        <div className="grid grid-flow-row sm:grid-flow-col sm:grid-cols-2 sm:gap-x-4 md:grid-cols-4">
          <div className="relative h-48 w-60 md:h-60">
            <Image
              src="/assets/images/test.png"
              sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              alt="test"
            />
          </div>
          <div className="relative h-48 w-60 md:h-60">
            <Image
              src="/assets/images/test.png"
              sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              alt="test"
            />
          </div>
          <div className="relative h-48 w-60 md:h-60">
            <Image
              src="/assets/images/test.png"
              sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              alt="test"
            />
          </div>
          <div className="relative h-48 w-60 md:h-60">
            <Image
              src="/assets/images/test.png"
              sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
              fill
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
              }}
              alt="test"
            />
          </div>
        </div>
      </Container>
    </div>
  );
}
