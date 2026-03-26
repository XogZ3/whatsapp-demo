import React from 'react';

import img3 from '@/public/assets/images/man_cosplay.webp';
import img7 from '@/public/assets/images/man_model.webp';
import img1 from '@/public/assets/images/man_studio_ft.webp';
import img5 from '@/public/assets/images/woman_cosplay.webp';
import img4 from '@/public/assets/images/woman_fire.webp';
import img2 from '@/public/assets/images/woman_ft.webp';
import img8 from '@/public/assets/images/woman_mermaid.webp';
import img6 from '@/public/assets/images/woman_studio_ft.webp';

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
  {
    id: '7',
    image: {
      imageSrc: img7,
      priority: false,
      loading: 'lazy',
    },
  },
  {
    id: '8',
    image: {
      imageSrc: img8,
      priority: false,
      loading: 'lazy',
    },
  },
];

export function SampleImagesCarousel() {
  return (
    <div className="col-span-10 ml-0 flex min-w-max flex-col items-center justify-center overflow-hidden rounded-md antialiased">
      <InfiniteMovingCards
        cards={cards}
        direction="right"
        speed="fast"
        pauseOnHover={false}
      />
    </div>
  );
}
