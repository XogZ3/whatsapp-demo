import React from 'react';

import img1 from '@/public/assets/images/man_3.webp';
import img3 from '@/public/assets/images/man_dating.webp';
import img5 from '@/public/assets/images/man_professional.webp';
import img2 from '@/public/assets/images/woman_1.webp';
import img4 from '@/public/assets/images/woman_2.webp';
import img6 from '@/public/assets/images/woman_4.webp';

import { InfiniteMovingCards } from './ui/infinite-moving-cards';

const cards = [
  {
    id: '1',
    image: {
      imageSrc: img1,
      priority: true,
      loading: 'eager',
    },
  },
  {
    id: '2',
    image: {
      imageSrc: img2,
      priority: true,
      loading: 'eager',
    },
  },
  {
    id: '3',
    image: {
      imageSrc: img3,
      priority: false,
      loading: 'lazy',
    },
  },
  {
    id: '4',
    image: {
      imageSrc: img4,
      priority: false,
      loading: 'lazy',
    },
  },
  {
    id: '5',
    image: {
      imageSrc: img5,
      priority: false,
      loading: 'lazy',
    },
  },
  {
    id: '6',
    image: {
      imageSrc: img6,
      priority: false,
      loading: 'lazy',
    },
  },
];

export function SampleImagesCarousel() {
  return (
    <div className="ml-0 flex min-w-max flex-col items-center justify-center overflow-hidden rounded-md antialiased sm:ml-10">
      <InfiniteMovingCards cards={cards} direction="right" speed="normal" />
    </div>
  );
}
