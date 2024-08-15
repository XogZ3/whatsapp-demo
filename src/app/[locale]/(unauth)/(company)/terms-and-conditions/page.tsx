import type { Metadata, NextPage } from 'next';
import { getTranslations } from 'next-intl/server';

import TnC from '@/components/(Company)/TnC';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Terms',
  });

  return {
    metadataBase: new URL(getBaseUrl()),
    title: t('meta_title', { appName: AppConfig.name }),
    description: t('meta_description', { appName: AppConfig.name }),
    openGraph: {
      title: {
        absolute: t('meta_title', { appName: AppConfig.name }),
      },
      description: t('meta_description', { appName: AppConfig.name }),
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
