'use client';

import { ParallaxScroll } from '../ui/parallax-scroll';

const images = [
  '/assets/images/woman (1).webp',
  '/assets/images/man (1).jpg',
  '/assets/images/woman (2).webp',
  '/assets/images/man (2).jpg',
  '/assets/images/woman (3).webp',
  '/assets/images/man (3).jpg',
  '/assets/images/woman (4).webp',
  '/assets/images/man (4).jpg',
  '/assets/images/woman (5).webp',
  '/assets/images/man (5).jpg',
  '/assets/images/woman (6).webp',
  '/assets/images/man (6).jpg',
];

export function PhotosSection() {
  return <ParallaxScroll images={images} />;
}
