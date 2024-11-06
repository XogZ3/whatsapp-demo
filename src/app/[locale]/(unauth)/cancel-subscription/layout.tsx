import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'CancelSubscription',
  });
  const baseUrl = getBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: t('meta_title') as string,
    description: t('meta_description') as string,
    twitter: {
      card: 'summary_large_image',
    },
    openGraph: {
      title: t('meta_title') as string,
      description: t('meta_description') as string,
    },
    alternates: {
      canonical: `${baseUrl}/cancel-subscription`,
      languages: {
        pt: `${baseUrl}/pt/cancel-subscription`,
        ms: `${baseUrl}/ms/cancel-subscription`,
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}
export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
