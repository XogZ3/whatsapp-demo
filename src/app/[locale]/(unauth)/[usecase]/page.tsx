import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import ComparisonSection from '@/components/landingPage/ComparisonSection';
import FAQSection from '@/components/landingPage/FAQSection';
import FeaturesSection from '@/components/landingPage/FeaturesSection';
import PriceSection from '@/components/landingPage/PriceSection';
import StepsSection from '@/components/landingPage/StepsSection';
import UseCaseHeroSection from '@/components/landingPage/UseCaseHeroSection';
import UseCaseLastSection from '@/components/landingPage/UseCaseLastSection';
import { UseCasePhotosSection } from '@/components/landingPage/UseCasePhotosSection';
import UsesSection from '@/components/landingPage/UsesSection';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

import ogImage from '../../../opengraph-image.webp';

const allowedUseCases = [
  'HeroSection',
  'LastSection',
  'ai-dating',
  'professional-headshots',
  'outfit-ideas',
  'travel',
  'instagram',
  'hairstyles',
];

export type AllowedUseCases = keyof Pick<
  IntlMessages,
  | 'HeroSection'
  | 'LastSection'
  | 'ai-dating'
  | 'professional-headshots'
  | 'outfit-ideas'
  | 'travel'
  | 'instagram'
  | 'hairstyles'
>;

export async function generateMetadata(props: {
  params: { locale: string; usecase: AllowedUseCases };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: props.params.usecase,
  });
  const ogImageAlt = AppConfig.name;
  const baseUrl = getBaseUrl();
  const currentPath =
    props.params.locale === 'en' ? '/ai-dating' : '/pt/ai-dating';

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('meta_title', { appName: AppConfig.name }) as string,
      template: `%s - ${t('meta_title', { appName: AppConfig.name }) as string}`,
    },
    description: t('meta_description', { appName: AppConfig.name }) as string,
    twitter: {
      card: 'summary_large_image',
    },
    openGraph: {
      title: {
        default: t('meta_title', { appName: AppConfig.name }) as string,
        template: `%s - ${t('meta_title', { appName: AppConfig.name }) as string}`,
      },
      description: t('meta_description', { appName: AppConfig.name }) as string,
      type: 'website',
      images: [
        {
          url: new URL(ogImage.src, baseUrl).toString(),
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        en: `${baseUrl}/ai-dating`,
        pt: `${baseUrl}/pt/ai-dating`,
      },
    },
    keywords: [
      'ai dating',
      'ai photos',
      'photorealistic ai photos',
      'ai photos for dating',
      'ai photos for tinder',
      'ai photos for instagram',
      'ai photos for facebook',
      'ai photos for whatsapp',
      'ai photos for linkedin',
      'ai photos for twitter',
      'ai photos for youtube',
      'ai photos for tiktok',
      'ai photos for snapchat',
      'ai photos for reddit',
      'ai photos for pinterest',
      'ai photos for instagram',
      'realistic ai photos',
      'hyper-realistic ai photos',
      'super realistic ai photos',
      'best ai dating photos',
      'best ai photos for dating profile',
      'best ai photos for tinder profile',
      'best ai photos for instagram profile',
      'best ai photos for facebook profile',
      'best ai photos for whatsapp profile',
      'best ai photos for linkedin profile',
      'best ai photos for twitter profile',
      'best ai photos for youtube profile',
    ],
  };
}

export default function UseCasesPage({ params }: { params: any }) {
  const useCase = params.usecase;
  if (!allowedUseCases.includes(useCase)) {
    redirect('/');
  }
  return (
    <>
      <UseCaseHeroSection useCase={useCase} />
      <UseCasePhotosSection useCase={useCase} />
      <StepsSection />
      <FeaturesSection />
      <ComparisonSection />
      <UsesSection />
      <PriceSection />
      <FAQSection />
      <UseCaseLastSection useCase={useCase} />
    </>
  );
}
