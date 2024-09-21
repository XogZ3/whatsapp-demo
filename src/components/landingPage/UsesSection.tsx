/* eslint-disable tailwindcss/no-custom-classname */

'use client';

import Image from 'next/image';
import * as React from 'react';
import Balancer from 'react-wrap-balancer';

import professional from '@/public/assets/images/man_professional.webp';
import travel from '@/public/assets/images/man_travel.webp';
import outfit from '@/public/assets/images/woman_1.webp';
import dating from '@/public/assets/images/woman_4.webp';
import instagram from '@/public/assets/images/woman_instagram.webp';
import keynote from '@/public/assets/images/woman_keynote.webp';

import { Container } from '../GeneralContainers';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';

const CardData = [
  {
    image: dating,
    heading: '❤️‍🔥 AI Dating',
    content:
      'Use AI to generate better dating photos for Tinder, Bumble and Hinge. Get more matches and make your dating profile stand out on dating apps with personalized, high-quality images. Experiment with different poses, outfits, and settings',
  },
  {
    image: professional,
    heading: '🕵🏽 Professional headshots',
    content:
      'Get a professional look with professional headshots you can use on your LinkedIn. Stand out from the competition, increase your visibility, attract more job offers by making a strong first impression',
  },
  {
    image: outfit,
    heading: '👗 Outfit ideas',
    content:
      'Capture different outfits and styles to see what fits you best. Use AI to visualize how various clothes look on you before making a choice. Ideas: trendy, casual, beach, provocative, retro, traditional, cyberpunk, biker, etc. ',
  },
  {
    image: travel,
    heading: '🌎 Travel',
    content:
      'Travel the world and capture stunning photos from Paris to Tokyo. Showcase your global adventures with vibrant images from iconic cities and diverse cultures',
  },
  {
    image: instagram,
    heading: '📸 Instagram',
    content:
      'Take engaging and visually stunning photos that showcase your personality as an Instagram influencer. Boost your confidence, likes and followers with captivating images that reflect your unique style and charisma',
  },
  {
    image: keynote,
    heading: '🗣️ Keynote speaker',
    content:
      'Take compelling photos of yourself speaking with authority on stage at a conference. Showcase your leadership and expertise in a professional setting, capturing powerful moments that highlight your confidence and influence',
  },
];

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
    <Card key={heading} className="col-span-1 row-span-1 pb-4">
      <CardHeader>
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={imageSrc}
            fill
            sizes="(min-width: 780px) calc(33.33vw - 64px), calc(100vw - 80px)"
            style={{ objectPosition: '0% 25%', objectFit: 'cover' }}
            alt="test"
            placeholder="blur"
          />
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
              imageSrc={card.image}
              heading={card.heading}
              content={card.content}
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
