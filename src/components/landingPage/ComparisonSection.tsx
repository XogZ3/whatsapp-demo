import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';

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
          style={{
            objectPosition: 'cover',
            objectFit: 'cover',
            height: '100%',
            width: '100%',
          }}
          fill
          className="rounded-t-xl"
          draggable={false}
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
            style={{ width: 'auto', height: 'auto' }}
            draggable={false}
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
            {t('header')}
          </h2>
          <p className=" mx-auto mt-5 max-w-md text-base font-normal">
            {t('subheader')}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4 sm:gap-6">
          <ComparisonCard
            imageSrc="/assets/images/midjourney.png"
            altText="Midjourney comparison"
            title="Midjourney"
            features={[
              { text: t('midjourney.low_resemblance'), positive: false },
              { text: t('midjourney.easy_to_use'), positive: true },
              { text: t('midjourney.requires_discord'), positive: false },
              { text: t('midjourney.medium_photorealism'), positive: true },
              { text: t('midjourney.high_quality'), positive: true },
              { text: t('midjourney.slow_generation'), positive: false },
            ]}
          />

          <ComparisonCard
            imageSrc="/assets/images/fotolabs.jpg"
            altText="FotoLabs.ai comparison"
            title="FotoLabs.ai"
            isFotoLabsAI
            features={[
              { text: t('fotolabsai.high_resemblance'), positive: true },
              { text: t('fotolabsai.super_easy_to_use'), positive: true },
              {
                text: t('fotolabsai.use_directly_from_whatsapp'),
                positive: true,
              },
              { text: t('fotolabsai.high_photorealism'), positive: true },
              { text: t('fotolabsai.high_quality'), positive: true },
              { text: t('fotolabsai.super_fast_generation'), positive: true },
            ]}
          />

          <ComparisonCard
            imageSrc="/assets/images/comfy.jpeg"
            altText="ComfyUI comparison"
            title="ComfyUI"
            features={[
              { text: t('comfyui.low_resemblance'), positive: false },
              { text: t('comfyui.hard_to_use'), positive: false },
              {
                text: t('comfyui.requires_expensive_graphic_card'),
                positive: false,
              },
              { text: t('comfyui.low_photorealism'), positive: false },
              { text: t('comfyui.high_quality'), positive: true },
              { text: t('comfyui.slow_generation'), positive: false },
            ]}
          />
        </div>
      </Container>
    </Section>
  );
}
