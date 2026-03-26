/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import * as React from 'react';

import { Section } from '../GeneralContainers';
import { SampleImagesCarousel } from '../InfiniteCards';

export default function SamplesSection() {
  return (
    <Section className="relative w-full overflow-hidden bg-purple-200 py-10 dark:bg-purple-900 sm:py-14">
      {/* Main Content Container */}
      <div className="relative z-10 flex size-full flex-col items-center justify-center gap-x-8 sm:grid sm:grid-cols-10 sm:px-8">
        {/* Circle Element */}
        <div className="absolute -left-20 -top-40 z-0 min-h-[240px] min-w-[240px] rounded-full border-[30px] border-purple-500/40" />
        <SampleImagesCarousel />
      </div>
    </Section>
  );
}
