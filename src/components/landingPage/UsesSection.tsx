/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import Image from 'next/image';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import img6 from '@/public/assets/images/woman_4.webp';

import { Container } from '../GeneralContainers';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

const UseCaseCard = ({
  imageSrc,
  heading,
  content,
}: {
  imageSrc: any;
  heading: string;
  content: string;
}) => {
  return (
    <Card className="col-span-1 row-span-1 pb-4">
      <CardHeader>
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={imageSrc}
            fill
            sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
            style={{ objectPosition: '0% 15%', objectFit: 'cover' }}
            alt="test"
            placeholder="blur"
          />
        </div>
      </CardHeader>
      <CardContent className="text-3xl">{heading}</CardContent>
      <CardDescription className="px-6 text-base">{content}</CardDescription>
    </Card>
  );
};

export default function UsesSection() {
  return (
    <div className="py-4 sm:py-14">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center leading-8">
        <h3 className="flex flex-col pb-4 text-4xl font-normal tracking-normal">
          <Balancer>FotoLabs Uses</Balancer>
        </h3>
        <div className="flex w-full flex-col gap-y-4 text-5xl tracking-normal sm:grid sm:grid-cols-3 sm:gap-x-4 sm:text-7xl">
          <UseCaseCard
            imageSrc={img6}
            heading="Dating Profile"
            content="
							Use AI to generate better dating photos for Tinder, Bumble and Hinge. Get more matches and make your dating profile stand out on dating apps with personalized, high-quality images. Experiment with different poses, outfits, and settings to showcase your best self and increase your chances of finding love"
          />
          <div className="row-span-1 flex flex-col space-y-4 rounded-xl bg-white p-4 shadow-md dark:bg-zinc-900">
            <div className="relative h-48 w-full md:h-60">
              <Image
                src={img6}
                alt="test"
                fill
                sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
                style={{ objectPosition: '0% 15%', objectFit: 'cover' }}
              />
            </div>
            <div className="mt-4 text-center transition duration-200 group-hover/bento:-translate-y-2">
              <h4 className="my-2 text-2xl font-bold text-neutral-600 dark:text-neutral-200">
                Dating Profile
              </h4>
              <div className="text-base font-normal text-neutral-600 dark:text-neutral-300">
                Use AI to generate better dating photos for Tinder, Bumble and
                Hinge. Get more matches and make your dating profile stand out
                on dating apps with personalized, high-quality images.
                Experiment with different poses, outfits, and settings to
                showcase your best self and increase your chances of finding
                love
              </div>
            </div>
          </div>
          <UseCaseCard
            imageSrc={img6}
            heading="Dating Profile"
            content="
							Use AI to generate better dating photos for Tinder, Bumble and Hinge. Get more matches and make your dating profile stand out on dating apps with personalized, high-quality images. Experiment with different poses, outfits, and settings to showcase your best self and increase your chances of finding love"
          />
        </div>
      </Container>
    </div>
  );
}
