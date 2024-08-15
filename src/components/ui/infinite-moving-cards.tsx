import { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/utils';

export const InfiniteMovingCards = ({
  cards,
  direction = 'left',
  speed = 'fast',
  pauseOnHover = true,
  className,
}: {
  cards: {
    id: number;
    videoSrc: string;
  }[];
  direction?: 'left' | 'right';
  speed?: 'fast' | 'normal' | 'slow';
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLUListElement>(null);
  const isInitialized = useRef(false);

  const [start, setStart] = useState(false);

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        '--animation-direction',
        direction === 'left' ? 'forwards' : 'reverse',
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const duration =
        // eslint-disable-next-line no-nested-ternary
        speed === 'fast' ? '20s' : speed === 'normal' ? '40s' : '80s';
      containerRef.current.style.setProperty('--animation-duration', duration);
    }
  };

  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      if (containerRef.current && scrollerRef.current) {
        const scrollerContent = Array.from(scrollerRef.current.children);

        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true);
          scrollerRef.current!.appendChild(duplicatedItem);
        });

        getDirection();
        getSpeed();
        setStart(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const videos = document.querySelectorAll('video');
    videos.forEach((video) => {
      // eslint-disable-next-line no-param-reassign
      video.muted = true;
    });
  }, [cards]);

  return (
    <div
      ref={containerRef}
      className={cn(
        'scroller relative z-20 max-w-[95vw] sm:max-w-7xl overflow-hidden sm:[mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] [mask-image:linear-gradient(to_right,transparent,white_5%,white_95%,transparent)]',
        className,
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          'flex min-w-full w-max flex-nowrap list-none my-0',
          start && 'animate-scroll',
          pauseOnHover && 'hover:[animation-play-state:paused]',
        )}
      >
        {cards.map((card) => (
          <li className="rounded-2xl px-2 py-1" key={card.id}>
            <div className="relative size-full">
              <video
                src={card.videoSrc}
                style={{ objectFit: 'cover' }}
                className="m-0 h-[465px] w-[270px] rounded-2xl"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
