import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import About from '@/components/(Company)/About';
import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'About',
  });

  return {
    metadataBase: new URL(getBaseUrl()),
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default function AboutPage() {
  return (
    <div className="">
      <About />
    </div>
  );
}
