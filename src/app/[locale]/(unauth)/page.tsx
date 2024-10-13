import BackToTop from '@/components/landingPage/BackToTop';
import ComparisonSection from '@/components/landingPage/ComparisonSection';
import FAQSection from '@/components/landingPage/FAQSection';
import FeaturesSection from '@/components/landingPage/FeaturesSection';
import HeroSection from '@/components/landingPage/HeroSection';
import LastSection from '@/components/landingPage/LastSection';
import { PhotosSection } from '@/components/landingPage/PhotosSection';
import PriceSection from '@/components/landingPage/PriceSection';
import StepsSection from '@/components/landingPage/StepsSection';
import UsesSection from '@/components/landingPage/UsesSection';

export default function Index() {
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
      <BackToTop />
    </>
  );
}
