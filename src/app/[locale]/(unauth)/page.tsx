import { unstable_setRequestLocale } from 'next-intl/server';

import ComparisonSection from '@/components/landingPage/ComparisonSection';
import FAQSection from '@/components/landingPage/FAQSection';
import FeaturesSection from '@/components/landingPage/FeaturesSection';
import HeroSection from '@/components/landingPage/HeroSection';
import LastSection from '@/components/landingPage/LastSection';
import { PhotosSection } from '@/components/landingPage/PhotosSection';
import PriceSection from '@/components/landingPage/PriceSection';
import StepsSection from '@/components/landingPage/StepsSection';
import UsesSection from '@/components/landingPage/UsesSection';
import { AppConfig } from '@/utils/appConfig';

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
      <HeroSection />
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
