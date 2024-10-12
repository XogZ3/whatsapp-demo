import BackToTop from '@/components/landingPage/BackToTop';
import ComparisonSection from '@/components/landingPage/ComparisonSection';
import FAQSection from '@/components/landingPage/FAQSection';
import HeroSection from '@/components/landingPage/HeroSection';
import LastSection from '@/components/landingPage/LastSection';
import { PhotosSection } from '@/components/landingPage/PhotosSection';
import StepsSection from '@/components/landingPage/StepsSection';
import UsesSection from '@/components/landingPage/UsesSection';

export default function Index() {
  return (
    <>
      <HeroSection />
      <PhotosSection />
      <StepsSection />
      <ComparisonSection />
      <UsesSection />
      <FAQSection />
      <LastSection />
      <BackToTop />
    </>
  );
}
