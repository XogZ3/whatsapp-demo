'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';
import Balancer from 'react-wrap-balancer';

import { Container, Section } from '../GeneralContainers';

interface ComparisonCardProps {
  imageSrc: string;
  altText: string;
  title: string;
  isFotoLabsAI?: boolean;
  features: Array<{ text: string; positive: boolean }>;
}

function ComparisonCard({
  imageSrc,
  altText,
  title,
  isFotoLabsAI,
  features,
}: ComparisonCardProps) {
  return (
    <div
      className={`w-full overflow-hidden rounded-2xl border ${
        isFotoLabsAI
          ? 'border-[#f47353] outline outline-1 outline-[#f47353]'
          : 'border-slate-800'
      } max-w-sm bg-white dark:bg-black sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-16px)]`}
    >
      <div className="relative h-0 pb-[115%]">
        <Image
          src={imageSrc}
          alt={altText}
          style={{ objectPosition: 'cover', objectFit: 'cover' }}
          fill
          className="rounded-t-xl"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-2 flex items-center text-lg font-semibold">
          {title}
          <Image
            src={`/assets/images/${title.toLowerCase().replace(/\s+/g, '-')}-logo.png`}
            alt={`${title} logo`}
            width={24}
            height={24}
            className="ml-2"
          />
        </h3>
        <ul>
          {features.map((feature) => (
            <li key={feature.text} className="text-sm">
              {feature.positive ? '✅' : '❌'} {feature.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function ComparisonSection() {
  const t = useTranslations('ComparisonSection');

  return (
    <Section>
      <Container className="">
        <div className="text-center">
          <h2 className=" text-3xl font-bold sm:text-4xl xl:text-5xl">
            <Balancer>{t('header')}</Balancer>
          </h2>
          <p className=" mx-auto mt-5 max-w-md text-base font-normal">
            <Balancer>{t('subheader')}</Balancer>
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
          <ComparisonCard
            imageSrc="/assets/images/midjourney.png"
            altText="Midjourney comparison"
            title="Midjourney"
            features={[
              { text: 'Low resemblance', positive: false },
              { text: 'Easy to use', positive: true },
              { text: 'Requires Discord', positive: false },
              { text: 'Medium photorealism', positive: true },
              { text: 'High Quality', positive: true },
              { text: 'Slow generation', positive: false },
            ]}
          />

          <ComparisonCard
            imageSrc="/assets/images/fotolabs.jpg"
            altText="FotoLabs.ai comparison"
            title="FotoLabs.ai"
            isFotoLabsAI
            features={[
              { text: 'High resemblance', positive: true },
              { text: 'Super easy to use', positive: true },
              { text: 'Use directly from WhatsApp', positive: true },
              { text: 'High photorealism', positive: true },
              { text: 'High Quality', positive: true },
              { text: 'Super fast generation', positive: true },
            ]}
          />

          <ComparisonCard
            imageSrc="/assets/images/comfy.jpeg"
            altText="ComfyUI comparison"
            title="ComfyUI"
            features={[
              { text: 'No resemblance', positive: false },
              { text: 'Hard to use', positive: false },
              { text: 'Requires expensive graphic card', positive: false },
              { text: 'Low photorealism', positive: false },
              { text: 'High Quality', positive: true },
              { text: 'Very slow generation', positive: false },
            ]}
          />
        </div>
      </Container>
    </Section>
  );
}
