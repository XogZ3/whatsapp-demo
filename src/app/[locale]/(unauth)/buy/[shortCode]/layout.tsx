import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string; shortCode: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'BuyPage',
  });
  const baseUrl = getBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: t('meta_title'),
    description: t('meta_description'),
    twitter: {
      card: 'summary_large_image',
    },
    openGraph: {
      title: t('meta_title'),
      description: t('meta_description'),
    },
    alternates: {
      canonical: `${baseUrl}/buy/${props.params.shortCode}`,
      languages: {
        pt: `${baseUrl}/pt/buy/${props.params.shortCode}`,
        ms: `${baseUrl}/ms/buy/${props.params.shortCode}`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}
export default function BuyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
