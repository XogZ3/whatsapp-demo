import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import BackToTop from '@/components/landingPage/BackToTop';
import TryNowButton from '@/components/landingPage/TryNowButton';

export default function WebsiteLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex size-full flex-col">
      <Header />
      <div className="h-full grow">{props.children}</div>
      <BackToTop />
      <TryNowButton />
      <Footer />
    </div>
  );
}
