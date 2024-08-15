'use client';

import { Section } from '../GeneralContainers';
import { ShortsCarousel } from '../InfiniteCards';

const CarouselSection = () => {
  return (
    <Section className="relative overflow-hidden bg-purple-200 py-10 dark:bg-purple-900 sm:py-14">
      {/* Main Content Container */}
      <div className="relative z-10 flex size-full flex-col gap-x-8 sm:grid sm:grid-cols-10 sm:px-8">
        {/* Circle Element */}
        <div className="absolute -left-20 -top-40 z-0 min-h-[240px] min-w-[240px] rounded-full border-[30px] border-purple-500/40" />
        <ShortsCarousel />
      </div>
    </Section>
  );
};

export default CarouselSection;
