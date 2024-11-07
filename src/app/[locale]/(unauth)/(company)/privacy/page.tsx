import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

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
      canonical: `${baseUrl}/privacy`,
      languages: {
        pt: `${baseUrl}/pt/privacy`,
        ms: `${baseUrl}/ms/privacy`,
      },
    },
  };
}

export async function generateStaticParams() {
  return AppConfig.locales.map((locale) => ({ locale }));
}

export default function PrivacyPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <div className="">
      <Privacy />
    </div>
  );
}
