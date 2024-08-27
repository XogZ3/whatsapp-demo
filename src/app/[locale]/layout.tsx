import '@/styles/global.css';

import { GoogleTagManager } from '@next/third-parties/google';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Script from 'next/script';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ViewTransitions } from 'next-view-transitions';
import { Suspense } from 'react';

import { Main } from '@/components/GeneralContainers';
import { Toaster } from '@/components/ui/toaster';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

import ogImage from '../opengraph-image.png';
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
    description: t('meta_description'),
    twitter: {
      card: 'summary_large_image',
    },
    openGraph: {
      title: {
        default: t('meta_title', { appName: AppConfig.name }) as string,
        template: `%s - ${t('meta_title', { appName: AppConfig.name }) as string}`,
      },
      description: t('meta_description'),
      type: 'website',
      images: [
        {
          url: new URL(ogImage.src, baseUrl).toString(),
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
      phoneNumbers: [`${AppConfig.phone}`],
    },
    keywords: [''],
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
          <Script id="facebook-pixel" strategy="afterInteractive">
            {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', ${process.env.FACEBOOK_PIXEL_ID});
          fbq('track', 'PageView');
        `}
          </Script>
          <noscript>
            <Image
              height="1"
              width="1"
              style={{ display: 'none' }}
              alt="fb pixel"
              src={`https://www.facebook.com/tr?id=${process.env.FACEBOOK_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        </body>
      </html>
    </ViewTransitions>
  );
}
