import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import SuccessSection from '@/components/landingPage/SuccessSection';
import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string; clientid: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'SuccessPage',
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
      canonical: `${baseUrl}/success/${props.params.clientid}`,
      languages: {
        pt: `${baseUrl}/pt/success/${props.params.clientid}`,
        ms: `${baseUrl}/ms/success/${props.params.clientid}`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function SuccessPage({ params }: { params: any }) {
  return <SuccessSection clientid={params.clientid} />;
}
