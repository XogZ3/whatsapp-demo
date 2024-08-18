/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { cn } from '@/libs/utils';

import { Container } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';
import { DotPattern } from '../ui/magicui/dot';

export default function HeroSection() {
  const t = useTranslations('HeroSection');

  const container = React.useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  gsap.registerPlugin(useGSAP);
  const mm = gsap.matchMedia();

  useGSAP(
    () => {
      if (prefersReducedMotion) {
        gsap.set(
          '.hero__heading, .hero__body, .hero__button, .hero__image, .hero__glow',
          { opacity: 1 },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } });

      mm.add('(min-width: 800px)', () => {
        // Desktop animations
        tl.fromTo(
          '.hero__heading',
          { scale: 0.5 },
          { scale: 1, opacity: 1, duration: 1.4 },
        );

        tl.fromTo(
          '.hero__body',
          { y: 20 },
          { y: 0, opacity: 1, duration: 1.2 },
          '-=0.6',
        );

        tl.fromTo(
          '.hero__button',
          { scale: 1.5 },
          { scale: 1, opacity: 1, duration: 1.3 },
          '-=0.8',
        );
      });

      mm.add('(max-width: 799px)', () => {
        // Mobile animations
        tl.fromTo(
          '.hero__heading',
          { scale: 0.5 },
          { scale: 1, opacity: 1, duration: 1.4 },
        );

        tl.fromTo(
          '.hero__body',
          { y: 20 },
          { y: 0, opacity: 1, duration: 1.2 },
          '-=0.6',
        );
        tl.fromTo(
          '.hero__button',
          { scale: 1.5 },
          { scale: 1, opacity: 1, duration: 1.3 },
          '-=0.8',
        );
      });
    },
    { scope: container },
  );

  return (
    <div className="py-4 sm:py-14" ref={container}>
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center sm:static">
        <div className="hero__heading !mb-1 text-5xl tracking-tight opacity-0 sm:!mb-0 sm:text-7xl">
          <Balancer>
            {t('header_1')} <br />
            <span className="whitespace-pre-wrap font-medium underline decoration-green-500 decoration-4 underline-offset-4">
              {t('header_2')}
            </span>
          </Balancer>
        </div>

        <h2 className="hero__body !mb-0 py-6 font-normal tracking-tight opacity-0">
          <Balancer>{t('subheader')}</Balancer>
        </h2>
        <ButtonFancy
          text={t('web_cta')}
          path="https://wa.me/971505072100"
          className="hero__button hidden min-w-[185px] text-lg font-semibold opacity-0 sm:block"
        />
      </Container>
      <DotPattern
        className={cn(
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
        )}
      />
    </div>
  );
}
