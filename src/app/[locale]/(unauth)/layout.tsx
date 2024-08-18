import '@/styles/global.css';

import { Footer } from '@/components/Footer';
import Header from '@/components/Header';
import ScrollToTopButton from '@/components/ScrollToTopButton';

export default function WebsiteLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full flex-col">
      <Header />
      <div className="h-full grow">{props.children}</div>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
