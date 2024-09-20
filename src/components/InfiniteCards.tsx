import React from 'react';

import testimage from '@/public/assets/images/test.png';

import { InfiniteMovingCards } from './ui/infinite-moving-cards';

const cards = [
  {
    id: '1',
    image: {
      imageSrc: testimage,
      priority: true,
      loading: 'eager',
    },
  },
  {
    id: '2',
    image: {
      imageSrc: testimage,
      priority: true,
      loading: 'eager',
    },
  },
  {
    id: '3',
    image: {
      imageSrc: testimage,
      priority: false,
      loading: 'lazy',
    },
  },
  {
    id: '4',
    image: {
      imageSrc: testimage,
      priority: false,
      loading: 'lazy',
    },
  },
  {
    id: '5',
    image: {
      imageSrc: testimage,
      priority: false,
      loading: 'lazy',
    },
  },
];

export function SampleImagesCarousel() {
  return (
    <div className="ml-0 flex min-w-max flex-col items-center justify-center overflow-hidden rounded-md antialiased sm:ml-10">
      <InfiniteMovingCards cards={cards} direction="right" speed="slow" />
    </div>
  );
}
