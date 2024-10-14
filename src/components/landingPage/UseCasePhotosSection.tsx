'use client';

import type { AllowedUseCases } from '@/app/[locale]/(unauth)/[usecase]/page';

import { ParallaxScroll } from '../ui/parallax-scroll';

export function UseCasePhotosSection({
  useCase,
}: {
  useCase: AllowedUseCases;
}) {
  const images = [
    `/assets/images/usecases/${useCase}_1.webp`,
    `/assets/images/usecases/${useCase}_1.jpg`,
    `/assets/images/usecases/${useCase}_2.webp`,
    `/assets/images/usecases/${useCase}_2.jpg`,
    `/assets/images/usecases/${useCase}_3.webp`,
    `/assets/images/usecases/${useCase}_3.jpg`,
    `/assets/images/usecases/${useCase}_4.webp`,
    `/assets/images/usecases/${useCase}_4.jpg`,
    `/assets/images/usecases/${useCase}_5.webp`,
    `/assets/images/usecases/${useCase}_5.jpg`,
    `/assets/images/usecases/${useCase}_6.webp`,
    `/assets/images/usecases/${useCase}_6.jpg`,
    `/assets/images/usecases/${useCase}_7.webp`,
    `/assets/images/usecases/${useCase}_7.jpg`,
    `/assets/images/usecases/${useCase}_8.webp`,
    `/assets/images/usecases/${useCase}_8.jpg`,
  ];

  return <ParallaxScroll images={images} />;
}
