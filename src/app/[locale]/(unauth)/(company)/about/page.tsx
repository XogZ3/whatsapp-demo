import type { Metadata } from 'next';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import ogImage from '@/app/opengraph-image.webp';
import About from '@/components/(Company)/About';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'About',
  });
  const ogImageAlt = AppConfig.name;
  const baseUrl = getBaseUrl();
  const currentPath = '/about';

  return {
    metadataBase: new URL(getBaseUrl()),
    title: t('meta_title'),
    description: t('meta_description'),
    twitter: {
      card: 'summary_large_image',
    },
    openGraph: {
      title: {
        default: t('meta_title', { appName: AppConfig.name }) as string,
        template: `%s - ${t('meta_title', { appName: AppConfig.name }) as string}`,
      },
      description: t('meta_description', { appName: AppConfig.name }) as string,
      type: 'website',
      images: [
        {
          url: new URL(ogImage.src, baseUrl).toString(),
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        en: `${baseUrl}/`,
        pt: `${baseUrl}/pt${currentPath}`,
      },
    },
    keywords: [
      'about fotolabs',
      'about fotolabs ai',
      'sobre fotolabs ia',
      'about fotolab',
      'about fotolab ai',
      'sobre fotolab ia',
      'about ai photos in whatsapp',
      'sobre ia fotos whatsapp',
      'about whatsapp ai photos',
      'sobre whatsapp ia fotos',
      'about whatsapp fotolabs',
      'about whatsapp fotolabs ai',
      'sobre whatsapp fotolabs ia',
      'about whatsapp fotolab ai',
      'sobre whatsapp fotolab ia',
      'about whatsapp fotolab',
      'about photolabs ai',
      'sobre photolabs ia',
      'about photolab ai',
      'sobre photolab ia',
      'about photo lab',
      'about photo lab ai',
      'sobre photo lab ia',
      'about photo labs',
      'about photo labs ai',
      'sobre photo labs ia',
    ],
  };
}

export async function generateStaticParams() {
  return AppConfig.locales.map((locale) => ({ locale }));
}

export default async function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  unstable_setRequestLocale(locale);

  return (
    <div className="">
      <About />
    </div>
  );
}
