import type { Metadata, NextPage } from 'next';
import { getTranslations } from 'next-intl/server';

import TnC from '@/components/(Company)/TnC';
import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Terms',
  });

  const baseUrl = getBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: t('meta_title'),
    description: t('meta_description'),
    openGraph: {
      title: {
        absolute: t('meta_title'),
      },
      description: t('meta_description'),
    },
    alternates: {
      canonical: `${baseUrl}/terms-and-conditions`,
      languages: {
        pt: `${baseUrl}/pt/terms-and-conditions`,
        ms: `${baseUrl}/ms/terms-and-conditions`,
      },
    },
  };
}

const TermsAndConditions: NextPage = () => {
  return (
    <div className="">
      <TnC />
    </div>
  );
};

export default TermsAndConditions;
