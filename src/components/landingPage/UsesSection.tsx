/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import Image from 'next/image';
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

import { Container } from '../GeneralContainers';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

const CardData = [
  {
    image1: man_dating,
    image2: woman_dating,
    heading: '❤️‍🔥 AI Dating',
    content:
      'Use AI to generate better dating photos for Tinder, Bumble and Hinge. Get more matches and make your dating profile stand out on dating apps with personalized, high-quality images. Experiment with different poses, outfits, and settings',
  },
  {
    image1: woman_professional,
    image2: man_professional,
    heading: '🕵🏽 Professional headshots',
    content:
      'Get a professional look with professional headshots you can use on your LinkedIn. Stand out from the competition, increase your visibility, attract more job offers by making a strong first impression',
  },
  {
    image1: man_outfit,
    image2: woman_outfit,
    heading: '👗 Outfit ideas',
    content:
      'Capture different outfits and styles to see what fits you best. Use AI to visualize how various clothes look on you before making a choice. Ideas: trendy, casual, beach, provocative, retro, traditional, cyberpunk, biker, etc. ',
  },
  {
    image1: woman_travel,
    image2: man_travel,
    heading: '🌎 Travel',
    content:
      'Travel the world and capture stunning photos from Paris to Tokyo. Showcase your global adventures with vibrant images from iconic cities and diverse cultures',
  },
  {
    image1: man_instagram,
    image2: woman_instagram,
    heading: '📸 Instagram',
    content:
      'Take engaging and visually stunning photos that showcase your personality as an Instagram influencer. Boost your confidence, likes and followers with captivating images that reflect your unique style and charisma',
  },
  {
    image1: woman_hair,
    image2: man_hair,
    heading: '👩‍🦱 Hairstyles',
    content:
      'Experiment with a variety of hairstyles that express your individuality. Whether it’s chic curls, sleek braids, or bold fades, show off your look with striking images',
  },
];

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
  return (
    <div className="py-4 sm:py-14">
      <Container className="relative flex flex-col items-center justify-center gap-y-2 text-center leading-8">
        <h3 className="flex flex-col pb-4 text-4xl font-normal tracking-normal">
          <Balancer>FotoLabs Uses</Balancer>
        </h3>
        <div className="flex w-full flex-col gap-y-4 text-5xl tracking-normal sm:grid sm:grid-cols-3 sm:gap-x-4 sm:text-7xl">
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
    </div>
  );
}
