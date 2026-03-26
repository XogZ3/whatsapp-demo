// components/GlowingStarsBackgroundCard.tsx
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/utils';

const Star = ({ isGlowing, delay }: { isGlowing: boolean; delay: number }) => {
  return (
    <motion.div
      key={delay}
      initial={{
        scale: 1,
      }}
      animate={{
        scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
        background: isGlowing ? '#fff' : '#666',
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        delay,
      }}
      className={cn('bg-[#666] h-[1px] w-[1px] rounded-full relative z-20')}
    />
  );
};

const Glow = ({ delay }: { delay: number }) => {
  return (
    <motion.div
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 2,
        ease: 'easeInOut',
        delay,
      }}
      exit={{
        opacity: 0,
      }}
      className="absolute left-1/2 z-10 size-[4px] -translate-x-1/2 rounded-full bg-red-500 shadow-2xl shadow-red-400 blur-[1px] dark:bg-blue-500 dark:shadow-blue-400"
    />
  );
};

export const Illustration = ({ mouseEnter }: { mouseEnter: boolean }) => {
  const stars = 162;
  const columns = 18;

  const [glowingStars, setGlowingStars] = useState<number[]>([]);

  const highlightedStars = useRef<number[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      highlightedStars.current = Array.from({ length: 5 }, () =>
        Math.floor(Math.random() * stars),
      );
      setGlowingStars([...highlightedStars.current]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative size-full p-1"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `1px`,
        zIndex: 0, // Set the z-index to ensure it's behind other content
      }}
    >
      {[...Array(stars)].map((_, starIdx) => {
        const isGlowing = glowingStars.includes(starIdx);
        const delay = (starIdx % 10) * 0.1;
        const staticDelay = starIdx * 0.01;
        return (
          <div
            // eslint-disable-next-line react/no-array-index-key
            key={`matrix-col-${starIdx}}`}
            className="relative flex items-center justify-center"
          >
            <Star
              isGlowing={mouseEnter ? true : isGlowing}
              delay={mouseEnter ? staticDelay : delay}
            />
            {mouseEnter && <Glow delay={staticDelay} />}
            <AnimatePresence mode="wait">
              {isGlowing && <Glow delay={delay} />}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};

export const GlowingStarsBackgroundCard = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  const [mouseEnter, setMouseEnter] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setMouseEnter(true);
      }}
      onMouseLeave={() => {
        setMouseEnter(false);
      }}
      className={cn(
        'relative bg-white dark:bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 w-full h-full rounded-t-xl border border-[#eaeaea] dark:border-neutral-600',
        className,
      )}
    >
      <div className="pointer-events-none absolute left-0 top-0 size-full">
        <Illustration mouseEnter={mouseEnter} />
      </div>
      <div className="relative z-10 px-2">{children}</div>
    </div>
  );
};

export const GlowingStarsDescription = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        'max-w-[16rem] hover:text-blue-400 dark:hover:text-red-400 hover:underline',
        className,
      )}
    >
      {children}
    </p>
  );
};

export const GlowingStarsTitle = ({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) => {
  return <h2 className={cn('', className)}>{children}</h2>;
};
