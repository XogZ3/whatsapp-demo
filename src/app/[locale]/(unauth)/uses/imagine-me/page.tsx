import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import ogImage from '@/app/opengraph-image.webp';
import ComparisonSection from '@/components/landingPage/ComparisonSection';
import FAQSection from '@/components/landingPage/FAQSection';
import FeaturesSection from '@/components/landingPage/FeaturesSection';
import LastSection from '@/components/landingPage/LastSection';
import { PhotosSection } from '@/components/landingPage/PhotosSection';
import PriceSection from '@/components/landingPage/PriceSection';
import StepsSection from '@/components/landingPage/StepsSection';
import UsesSection from '@/components/landingPage/UsesSection';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

import ImagineMeHeroSection from './ImagineMeHeroSection';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });
  const ogImageAlt = AppConfig.name;
  const baseUrl = getBaseUrl();

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
      canonical: `${baseUrl}/uses/imagine-me`,
      languages: {
        pt: `${baseUrl}/pt/uses/imagine-me`,
      },
    },
    keywords: [
      'imagine me',
      'ai powered',
      'imagine me photos',
      'ai generated photos',
      'personalized images',
      'photorealistic images',
      'unlimited ai photos',
      'ai powered photos',
      'imagine me ai',
      'whatsapp imagine me',
      'imagine me photos',
      'ai generated images',
      'personalized ai photos',
      'photorealistic ai photos',
      'unlimited ai photo generation',
      'ai powered photos',
      'imagine me ai',
      'whatsapp imagine me',
      'imagine me photos',
    ],
  };
}
export async function generateStaticParams() {
  return AppConfig.locales.map((locale) => ({ locale }));
}

export default function Index({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <>
      <ImagineMeHeroSection />
      <PhotosSection />
      <StepsSection />
      <FeaturesSection />
      <ComparisonSection />
      <UsesSection />
      <PriceSection />
      <FAQSection />
      <LastSection />
    </>
  );
}
