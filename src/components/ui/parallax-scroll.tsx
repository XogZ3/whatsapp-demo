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
  const translateThird = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const translateFourth = useTransform(scrollYProgress, [0, 1], [0, 200]);

  const quarter = Math.ceil(images.length / 4);

  const firstPart = images.slice(0, quarter);
  const secondPart = images.slice(quarter, 2 * quarter);
  const thirdPart = images.slice(2 * quarter, 3 * quarter);
  const fourthPart = images.slice(3 * quarter);

  return (
    <div
      className={cn('relative h-[100vh] w-full overflow-hidden', className)}
      ref={containerRef}
    >
      <div className="absolute inset-0 mx-auto grid max-w-6xl grid-cols-2 items-start gap-6 px-4 sm:grid-cols-4 sm:gap-10 sm:px-6 lg:px-8">
        <div className="grid gap-6 sm:gap-10">
          {firstPart.map((el, idx) => (
            <motion.div
              style={{ y: translateFirst }}
              key={`grid-1${idx}`}
              className="h-60 sm:h-80"
            >
              <Image
                src={el}
                className="size-full rounded-lg object-cover object-center"
                height={400}
                width={400}
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-6 sm:gap-10">
          {secondPart.map((el, idx) => (
            <motion.div
              style={{ y: translateSecond }}
              key={`grid-2${idx}`}
              className="h-60 sm:h-80"
            >
              <Image
                src={el}
                className="size-full rounded-lg object-cover object-center"
                height={400}
                width={400}
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-6 sm:gap-10">
          {thirdPart.map((el, idx) => (
            <motion.div
              style={{ y: translateThird }}
              key={`grid-3${idx}`}
              className="h-60 sm:h-80"
            >
              <Image
                src={el}
                className="size-full rounded-lg object-cover object-center"
                height={400}
                width={400}
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
        <div className="grid gap-6 sm:gap-10">
          {fourthPart.map((el, idx) => (
            <motion.div
              style={{ y: translateFourth }}
              key={`grid-4${idx}`}
              className="h-60 sm:h-80"
            >
              <Image
                src={el}
                className="size-full rounded-lg object-cover object-center"
                height={400}
                width={400}
                alt="thumbnail"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
