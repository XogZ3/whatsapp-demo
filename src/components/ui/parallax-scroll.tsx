/* eslint-disable react/no-array-index-key */

'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useRef } from 'react';

import { cn } from '@/libs/utils';

export const ParallaxScroll = ({
  images,
  className,
}: {
  images: string[];
  className?: string;
}) => {
  const containerRef = useRef<any>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const translateFirst = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateSecond = useTransform(scrollYProgress, [0, 1], [0, 200]);

  // Ensure we only use 12 images
  const imagesToUse = images.slice(0, 12);

  // Divide images into 4 parts for desktop view
  const quarter = 3; // 12 images / 4 columns = 3 images per column
  const firstPart = imagesToUse.slice(0, quarter);
  const secondPart = imagesToUse.slice(quarter, 2 * quarter);
  const thirdPart = imagesToUse.slice(2 * quarter, 3 * quarter);
  const fourthPart = imagesToUse.slice(3 * quarter);

  return (
    <div
      className={cn('relative h-[100vh] w-full overflow-hidden', className)}
      ref={containerRef}
    >
      <div className="absolute inset-0 mx-auto grid max-w-6xl grid-cols-2 items-start gap-6 px-4 sm:grid-cols-4 sm:gap-10 sm:px-6 lg:px-8">
        {[firstPart, secondPart, thirdPart, fourthPart].map(
          (part, columnIndex) => (
            <div key={`column-${columnIndex}`} className="grid gap-6 sm:gap-10">
              {part.map((el, idx) => (
                <motion.div
                  style={{
                    y: columnIndex % 2 === 0 ? translateFirst : translateSecond,
                  }}
                  key={`grid-${columnIndex}${idx}`}
                  className="relative h-60 sm:h-80"
                >
                  <Image
                    src={el}
                    alt="thumbnail"
                    className="size-full rounded-lg object-cover object-center"
                    sizes="(min-width: 1400px) 242px, (min-width: 1220px) 25vw, (min-width: 640px) calc(25vw - 24px), calc(50vw - 16px)"
                    style={{ objectPosition: '0% 20%' }}
                    fill
                    quality={75}
                  />
                </motion.div>
              ))}
            </div>
          ),
        )}
      </div>
    </div>
  );
};
