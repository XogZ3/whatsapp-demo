import Image from 'next/image';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { Container, Section } from '../GeneralContainers';

const ArrowImage: React.FC = () => (
  <div className="relative my-4 size-14 shrink-0 sm:mx-4 sm:my-2 sm:size-20">
    <Image
      src="/assets/images/arrow_black.png"
      alt="Arrow"
      fill
      sizes="(max-width: 6rem) 6rem, 16rem"
      className="-rotate-45 object-contain dark:hidden"
      quality={75}
    />
    <Image
      src="/assets/images/arrow_white.png"
      alt="Arrow"
      fill
      sizes="(max-width: 6rem) 6rem, 16rem"
      className="hidden -rotate-45 object-contain dark:block"
      quality={75}
    />
  </div>
);

const ImageContainer: React.FC<{ src: string; alt: string }> = ({
  src,
  alt,
}) => (
  <div className="relative aspect-[9/16] w-full max-w-[14.0625rem]">
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 60rem) 14.0625rem, (min-width: 40rem) calc(29.67vw - 3.375rem), (min-width: 36rem) 14.0625rem, calc(48.85vw - 3.0625rem)"
      className="object-cover"
      quality={75}
    />
  </div>
);

const ImageWithArrow: React.FC<{
  userImage: string;
  aiImage: string;
  userImageAlt: string;
  aiImageAlt: string;
}> = ({ userImage, aiImage, userImageAlt, aiImageAlt }) => (
  <>
    <ImageContainer src={userImage} alt={userImageAlt} />
    <ArrowImage />
    <ImageContainer src={aiImage} alt={aiImageAlt} />
  </>
);
interface FeatureProps {
  title: string;
  emoji: string;
  userImage: string;
  aiImage: string;
  userImageAlt: string;
  aiImageAlt: string;
  reverse?: boolean;
}

const Feature: React.FC<FeatureProps> = ({
  title,
  emoji,
  userImage,
  aiImage,
  userImageAlt,
  aiImageAlt,
  reverse = false,
}) => {
  const titleElement = (
    <div className="flex size-full flex-col items-center justify-center gap-y-4 sm:col-span-1 sm:mb-0">
      <p className="text-6xl sm:text-7xl">{emoji}</p>
      <h3 className="mb-6 flex items-center text-center text-2xl font-semibold sm:text-3xl xl:text-4xl">
        {title}
      </h3>
    </div>
  );

  const imageComparison = (
    <div className="flex w-full flex-row items-center sm:col-span-2 sm:justify-center">
      <ImageWithArrow
        userImage={userImage}
        aiImage={aiImage}
        userImageAlt={userImageAlt}
        aiImageAlt={aiImageAlt}
      />
    </div>
  );

  return (
    <div className="mt-10 flex w-full flex-col items-center justify-center sm:grid sm:grid-cols-3 sm:items-start sm:space-x-8">
      {reverse ? (
        <>
          <div className="sm:hidden">{titleElement}</div>
          {imageComparison}
          <div className="hidden size-full items-center justify-center sm:block">
            {titleElement}
          </div>
        </>
      ) : (
        <>
          {titleElement}
          {imageComparison}
        </>
      )}
    </div>
  );
};

export default function FeaturesSection() {
  const t = useTranslations('FeaturesSection');

  const features: FeatureProps[] = [
    {
      title: t('feature1.title'),
      emoji: '🏯',
      userImage: '/assets/images/features/feat_woman_travel.jpg',
      aiImage: '/assets/images/features/feat_woman_travel_out.jpg',
      userImageAlt: t('feature1.userImageAlt'),
      aiImageAlt: t('feature1.aiImageAlt'),
    },
    {
      title: t('feature2.title'),
      emoji: '🏋️‍♂️',
      userImage: '/assets/images/features/feat_man_gym.jpg',
      aiImage: '/assets/images/features/feat_man_gym_out.jpg',
      userImageAlt: t('feature2.userImageAlt'),
      aiImageAlt: t('feature2.aiImageAlt'),
      reverse: true,
    },
    {
      title: t('feature3.title'),
      emoji: '👗',
      userImage: '/assets/images/features/feat_woman_outfit_hair.jpg',
      aiImage: '/assets/images/features/feat_woman_outfit_hair_out.jpg',
      userImageAlt: t('feature3.userImageAlt'),
      aiImageAlt: t('feature3.aiImageAlt'),
    },
    {
      title: t('feature4.title'),
      emoji: '💇‍♂️',
      userImage: '/assets/images/features/feat_man_hair.jpg',
      aiImage: '/assets/images/features/feat_man_hair_out.jpg',
      userImageAlt: t('feature4.userImageAlt'),
      aiImageAlt: t('feature4.aiImageAlt'),
      reverse: true,
    },
  ];

  return (
    <Section className="">
      <Container>
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl xl:text-5xl">
            {t('header')}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-base font-normal">
            {t('subheader')}
          </p>
        </div>
        {features.map((feature) => (
          <Feature key={feature.title} {...feature} />
        ))}
      </Container>
    </Section>
  );
}
