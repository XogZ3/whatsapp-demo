/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useTranslations } from 'next-intl';
import { Link } from 'next-view-transitions';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import usePrefersReducedMotion from '@/hooks/usePrefersReducedMotion';
import { Env } from '@/libs/Env.mjs';

import { Container } from '../GeneralContainers';
import { Icons } from '../Icons';
import StarGrid from '../StarGrid';
import { Button } from '../ui/button';
import ButtonFancy from '../ui/button-fancy';
import NumberTicker from '../ui/magicui/number-ticker';

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
        tl.fromTo(
          '.hero__image',
          { y: 100 },
          { y: 0, opacity: 1, duration: 1.3 },
          '+=0.3',
        );
        tl.fromTo('.hero__glow', {}, { opacity: 1, duration: 1.1 }, '-=1');
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
          '.hero__image',
          { y: 100 },
          { y: 0, opacity: 1, duration: 1.3 },
          '+=0.3',
        );
        tl.fromTo('.hero__glow', {}, { opacity: 1, duration: 1.1 }, '-=1');
      });
    },
    { scope: container },
  );

  return (
    <div className="py-4 sm:py-14" ref={container}>
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center sm:static">
        <StarGrid className="w-full" />
        <div className="hero__heading !mb-1 text-5xl tracking-tight opacity-0 sm:!mb-0 sm:text-7xl">
          <Balancer>
            {t('header_1')} <br />
            <span className="whitespace-pre-wrap font-medium underline decoration-purple-500 decoration-4 underline-offset-4">
              <NumberTicker
                className="tracking-tighter underline decoration-purple-500 decoration-4 underline-offset-4"
                value={10}
              />{' '}
              {t('header_2')}
            </span>
          </Balancer>
        </div>

        <h2 className="hero__body !mb-0 py-6 font-normal tracking-tight opacity-0">
          <Balancer>{t('subheader')}</Balancer>
        </h2>
        <ButtonFancy
          text={t('web_cta')}
          path="/dashboard"
          className="hero__button hidden min-w-[185px] text-lg font-semibold opacity-0 sm:block"
        />
        <div className="hero__image flex flex-col items-center justify-center gap-y-2 opacity-0 sm:my-8">
          <Link href="https://apps.apple.com/ae/app/videogptai-create-ai-videos/id6532617360">
            <Button variant="default" className="flex flex-row gap-x-2">
              <Icons.Apple className="size-5 dark:fill-black" />{' '}
              {t('mobile_cta_apple')}
            </Button>
          </Link>
          <Link href="https://videogptai.page.link/download">
            <Button variant="default" className="flex flex-row gap-x-2">
              <Icons.Google className="size-5" /> {t('mobile_cta_google')}
            </Button>
          </Link>
        </div>
      </Container>
      {/* <DotPattern
        className={cn(
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
        )}
      /> */}
      <p className="hero__glow text-center font-semibold opacity-0">
        {t('support')}{' '}
        <a href={`mailto:${Env.NEXT_PUBLIC_EMAIL}`} className="text-purple-500">
          {Env.NEXT_PUBLIC_EMAIL}
        </a>
      </p>
    </div>
  );
}
