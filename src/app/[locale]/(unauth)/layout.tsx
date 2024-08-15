import '@/styles/global.css';

import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export default function WebsiteLayout(props: { children: React.ReactNode }) {
  return (
    <div className="relative size-full">
      <Header />
      <div>{props.children}</div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
