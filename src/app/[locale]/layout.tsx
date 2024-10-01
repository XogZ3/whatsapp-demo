import '@/styles/global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ViewTransitions } from 'next-view-transitions';
import { Suspense } from 'react';

import { Main } from '@/components/GeneralContainers';
import { Toaster } from '@/components/ui/toaster';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

import ogImage from '../opengraph-image.webp';
import LoadingPage from './loading';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });
  const ogImageAlt = AppConfig.name;
  const baseUrl = getBaseUrl();

  return {
    metadataBase: new URL(baseUrl),
    title: {
      default: t('meta_title', { appName: AppConfig.name }) as string,
      template: `%s - ${t('meta_title', { appName: AppConfig.name }) as string}`,
    },
    description: t('meta_description', { appName: AppConfig.name }) as string,
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
    keywords: [
      'fotolabs',
      'fotolabs ai',
      'fotolabs ia',
      'fotolab',
      'fotolab ai',
      'fotolab ia',
      'ai photos in whatsapp',
      'ia fotos whatsapp',
      'whatsapp ai photos',
      'whatsapp ia fotos',
      'whatsapp fotolabs',
      'whatsapp fotolabs ai',
      'whatsapp fotolabs ia',
      'whatsapp fotolab ai',
      'whatsapp fotolab ia',
      'whatsapp fotolab',
      'photolabs ai',
      'photolabs ia',
      'photolab ai',
      'photolab ia',
      'photo lab',
      'photo lab ai',
      'photo lab ia',
      'photo labs',
      'photo labs ai',
      'photo labs ia',
    ],
  };
}

export default function RootLayout(props: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!AppConfig.locales.includes(props.params.locale)) notFound();
  const messages = useMessages();

  return (
    <ViewTransitions>
      <html lang={props.params.locale} suppressHydrationWarning>
        <GoogleTagManager gtmId="GTM-Xxxxx" />
        <body className={inter.className}>
          <Providers>
            <NextIntlClientProvider
              locale={props.params.locale}
              messages={messages}
            >
              <Suspense fallback={<LoadingPage />}>
                <Main>{props.children}</Main>
              </Suspense>
              <Toaster />
            </NextIntlClientProvider>
          </Providers>
        </body>
      </html>
    </ViewTransitions>
  );
}
