'use client';

import type { AllowedUseCases } from '@/utils/appConfig';

import { ParallaxScroll } from '../ui/parallax-scroll';

export function UseCasePhotosSection({
  useCase,
}: {
  useCase: AllowedUseCases;
}) {
  const images = [
    `/assets/images/usecases/${useCase}_5.webp`,
    `/assets/images/usecases/${useCase}_6.webp`,
    `/assets/images/usecases/${useCase}_7.webp`,
    `/assets/images/usecases/${useCase}_8.webp`,
    `/assets/images/usecases/${useCase}_9.webp`,
    `/assets/images/usecases/${useCase}_10.webp`,
    `/assets/images/usecases/${useCase}_11.webp`,
    `/assets/images/usecases/${useCase}_12.webp`,
    `/assets/images/usecases/${useCase}_13.webp`,
    `/assets/images/usecases/${useCase}_14.webp`,
    `/assets/images/usecases/${useCase}_15.webp`,
    `/assets/images/usecases/${useCase}_16.webp`,
  ];

  return <ParallaxScroll images={images} />;
}
