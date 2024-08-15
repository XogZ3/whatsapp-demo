import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import Privacy from '@/components/(Company)/Privacy';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Privacy',
  });

  return {
    metadataBase: new URL(getBaseUrl()),
    title: t('meta_title', { appName: AppConfig.name }),
    description: t('meta_description', { appName: AppConfig.name }),
    openGraph: {
      title: {
        absolute: t('meta_title', { appName: AppConfig.name }) as string,
      },
      description: t('meta_description', { appName: AppConfig.name }) as string,
    },
  };
}

export default function PrivacyPage() {
  return (
    <div className="">
      <Privacy />
    </div>
  );
}
