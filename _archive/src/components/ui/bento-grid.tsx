// bento-grid.tsx
import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';

import { cn } from '@/libs/utils';
import { cardVariants } from '@/utils/motion';

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  imageSrc,
  delay = 0,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  imageSrc?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      whileInView="onscreen"
      initial="offscreen"
      viewport={{ once: true }}
      variants={cardVariants(delay)}
      className={cn(
        `row-span-1 rounded-xl group/bento shadow-md p-4 dark:bg-zinc-900  bg-white flex flex-col space-y-4`,
        className,
      )}
    >
      {header && (
        <div className="relative h-40">
          {header}
          {imageSrc && (
            <Image
              src={imageSrc}
              alt="test"
              fill
              sizes="(max-width: 768px) 100vw, 700px)"
              className="object-contain"
              style={{ objectFit: 'cover', objectPosition: 'top' }}
              draggable={false}
            />
          )}
        </div>
      )}
      <div className="transition duration-200">
        <div className="my-2 font-sans font-bold text-neutral-600 dark:text-neutral-200">
          {title}
        </div>
        <div className="font-sans text-xs font-normal text-neutral-600 dark:text-neutral-300">
          {description}
        </div>
      </div>
    </motion.div>
  );
};
