import '@/styles/global.css';

import { Footer } from '@/components/Footer';
import Header from '@/components/Header';

export default function WebsiteLayout(props: { children: React.ReactNode }) {
  return (
    <div className="flex size-full flex-col">
      <Header />
      <div className="h-full grow">{props.children}</div>
      {/* <DotPattern
        className={cn(
          '[mask-image:radial-gradient(800px_circle_at_center,white,transparent)] -z-10',
        )}
      /> */}
      <Footer />
    </div>
  );
}
