/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import man_dating from '@/public/assets/images/man_dating.webp';
import man_hair from '@/public/assets/images/man_hair.webp';
import man_instagram from '@/public/assets/images/man_instagram.webp';
import man_outfit from '@/public/assets/images/man_outfit.webp';
import man_professional from '@/public/assets/images/man_professional.webp';
import man_travel from '@/public/assets/images/man_travel.webp';
import woman_outfit from '@/public/assets/images/woman_1.webp';
import woman_dating from '@/public/assets/images/woman_4.webp';
import woman_hair from '@/public/assets/images/woman_hair.webp';
import woman_instagram from '@/public/assets/images/woman_instagram.webp';
import woman_professional from '@/public/assets/images/woman_professional.webp';
import woman_travel from '@/public/assets/images/woman_travel.webp';

import { Container, Section } from '../GeneralContainers';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

const UseCaseCard = ({
  image1,
  image2,
  heading,
  content,
}: {
  image1: any;
  image2: any;
  heading: string;
  content: string;
}) => {
  return (
    <Card key={heading} className="col-span-1 row-span-1 pb-4">
      <CardHeader>
        <div className="relative h-44 w-full overflow-hidden">
          <div className="relative grid w-full grid-cols-2 grid-rows-1 gap-x-2">
            <Image
              src={image1}
              width={200} // Set width here
              height={176} // Set height here
              style={{ objectPosition: '0% 25%', objectFit: 'cover' }}
              alt="test"
              placeholder="blur"
              className="col-span-1 rounded-xl"
            />
            <Image
              src={image2}
              width={200} // Set width here
              height={176} // Set height here
              style={{ objectPosition: '0% 25%', objectFit: 'cover' }}
              alt="test"
              placeholder="blur"
              className="col-span-1 rounded-xl"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="text-xl">{heading}</CardContent>
      <CardDescription className="px-6 text-base">{content}</CardDescription>
    </Card>
  );
};

export default function UsesSection() {
  const t = useTranslations('UsesSection');

  const CardData = [
    {
      image1: man_dating,
      image2: woman_dating,
      heading: t('heading_1'),
      content: t('content_1'),
    },
    {
      image1: woman_professional,
      image2: man_professional,
      heading: t('heading_2'),
      content: t('content_2'),
    },
    {
      image1: man_outfit,
      image2: woman_outfit,
      heading: t('heading_3'),
      content: t('content_3'),
    },
    {
      image1: woman_travel,
      image2: man_travel,
      heading: t('heading_4'),
      content: t('content_4'),
    },
    {
      image1: man_instagram,
      image2: woman_instagram,
      heading: t('heading_5'),
      content: t('content_5'),
    },
    {
      image1: woman_hair,
      image2: man_hair,
      heading: t('heading_6'),
      content: t('content_6'),
    },
  ];
  return (
    <Section>
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center leading-8">
        <h2 className=" text-3xl font-bold sm:text-4xl xl:text-5xl">
          <Balancer>{t('header')}</Balancer>
        </h2>
        <div className="flex w-full flex-col gap-y-4 text-5xl tracking-normal sm:mt-8 sm:grid sm:grid-cols-3 sm:gap-x-4 sm:text-7xl">
          {CardData.map((card) => (
            <UseCaseCard
              key={card.heading}
              image1={card.image1}
              image2={card.image2}
              heading={card.heading}
              content={card.content}
            />
          ))}
        </div>
      </Container>
    </Section>
  );
}
