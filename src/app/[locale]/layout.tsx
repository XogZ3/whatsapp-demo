import { GoogleAnalytics } from '@next/third-parties/google';
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

const inter = Inter({ subsets: ['latin'], display: 'swap', preload: true });

export async function generateMetadata(props: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: 'Index',
  });
  const ogImageAlt = AppConfig.name;
  const baseUrl = getBaseUrl();
  const currentPath = props.params.locale === 'en' ? '/' : '/pt';

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
    icons: {
      icon: [
        {
          url: '/assets/favicon/favicon-16x16.png',
          sizes: '16x16',
          type: 'image/png',
        },
        {
          url: '/assets/favicon/favicon-32x32.png',
          sizes: '32x32',
          type: 'image/png',
        },
        {
          url: '/assets/favicon/favicon-96x96.png',
          sizes: '96x96',
          type: 'image/png',
        },
      ],
    },
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        en: `${baseUrl}/`,
        pt: `${baseUrl}/pt`,
      },
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

  const jsonLdData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: AppConfig.name,
    image: `${AppConfig.url}/logo.png`,
    applicationCategory: 'WhatsApp AI Image Generator',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '19.99',
      priceCurrency: 'USD',
    },
    description:
      'FotoLabs AI is an AI-powered photo creation tool that helps you create stunning images easily inside WhatsApp.',
    url: AppConfig.url,
    provider: {
      '@type': 'Organization',
      name: AppConfig.name,
      logo: `${AppConfig.url}/logo.png`,
    },
    screenshot: `${AppConfig.url}/screenshot.jpeg`,
    featureList: [
      'AI-powered photo creation',
      'Use inside WhatsApp',
      'Easy, fast and cheap',
      'No need to download or install anything',
      'Unlimited photos',
      'Customizable',
      'High quality',
      'Consistent results',
      'AI photo of yourself in 30 seconds',
      'WhatsApp AI photos',
      'Professional photos with AI',
      'LinkedIn profile pictures with AI',
      'LinkedIn AI photos',
      'Professional headshots with AI',
      'AI hairstyle visualization',
      'AI makeup visualization',
      'AI skincare visualization',
      'AI tattoo visualization',
      'AI piercing visualization',
      'AI hair color visualization',
      'AI beard visualization',
      'AI makeup visualization',
      'AI skincare visualization',
    ],
  };

  return (
    <ViewTransitions>
      <html lang={props.params.locale} suppressHydrationWarning>
        <body className={inter.className}>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
          />
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
        <GoogleAnalytics
          gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID as string}
        />
      </html>
    </ViewTransitions>
  );
}
