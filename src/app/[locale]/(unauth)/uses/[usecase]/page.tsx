import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server';

import ComparisonSection from '@/components/landingPage/ComparisonSection';
import FAQSection from '@/components/landingPage/FAQSection';
import FeaturesSection from '@/components/landingPage/FeaturesSection';
import PriceSection from '@/components/landingPage/PriceSection';
import StepsSection from '@/components/landingPage/StepsSection';
import UseCaseHeroSection from '@/components/landingPage/UseCaseHeroSection';
import UseCaseLastSection from '@/components/landingPage/UseCaseLastSection';
import { UseCasePhotosSection } from '@/components/landingPage/UseCasePhotosSection';
import UsesSection from '@/components/landingPage/UsesSection';
import { AppConfig } from '@/utils/appConfig';
import { getBaseUrl } from '@/utils/helpers';

import ogImage from '../../../../opengraph-image.webp';

const allowedUseCases = [
  'ai-dating',
  'professional-headshots',
  'outfit-ideas',
  'travel',
  'instagram',
  'hairstyles',
];

export type AllowedUseCases = keyof Pick<
  IntlMessages,
  | 'ai-dating'
  | 'professional-headshots'
  | 'outfit-ideas'
  | 'travel'
  | 'instagram'
  | 'hairstyles'
>;

export async function generateMetadata(props: {
  params: { locale: string; usecase: AllowedUseCases };
}): Promise<Metadata> {
  const t = await getTranslations({
    locale: props.params.locale,
    namespace: props.params.usecase,
  });
  const ogImageAlt = AppConfig.name;
  const baseUrl = getBaseUrl();
  const currentPath =
    props.params.locale === 'en'
      ? `/${props.params.usecase}`
      : `/${props.params.locale}/${props.params.usecase}`;

  const getKeywords = (useCase: AllowedUseCases, locale: string) => {
    const baseKeywords = {
      en: [
        'ai photos',
        'photorealistic ai photos',
        'realistic ai photos',
        'hyper-realistic ai photos',
        'super realistic ai photos',
        'ai image generator',
        'ai photo creator',
        'artificial intelligence photography',
        'custom ai images',
        'personalized ai photos',
        'ai selfies',
        'whatsapp ai photos',
        'ai photo editing',
        'ai photo enhancement',
      ],
      pt: [
        'fotos de ia',
        'fotos realistas de ia',
        'fotos hiper-realistas de ia',
        'gerador de imagens de ia',
        'criador de fotos de ia',
        'fotografia de inteligência artificial',
        'imagens personalizadas de ia',
        'fotos personalizadas de ia',
        'selfies de ia',
        'fotos de ia no whatsapp',
        'edição de fotos com ia',
        'aprimoramento de fotos com ia',
      ],
    };

    const useCaseKeywords = {
      'ai-dating': {
        en: [
          'ai dating photos',
          'ai photos for dating apps',
          'tinder ai photos',
          'bumble ai photos',
          'hinge ai photos',
          'online dating profile pictures',
          'ai dating profile optimization',
          'attractive ai dating photos',
          'dating app success with ai',
          'ai-enhanced dating profiles',
        ],
        pt: [
          'fotos de ia para namoro',
          'fotos de ia para aplicativos de namoro',
          'fotos de ia para tinder',
          'fotos de ia para bumble',
          'fotos de perfil para namoro online',
          'otimização de perfil de namoro com ia',
          'fotos atraentes de ia para namoro',
          'sucesso em aplicativos de namoro com ia',
          'perfis de namoro aprimorados por ia',
        ],
      },
      'professional-headshots': {
        en: [
          'ai professional headshots',
          'linkedin ai photos',
          'corporate ai portraits',
          'business profile pictures',
          'ai cv photos',
          'professional ai selfies',
          'career-boosting ai photos',
          'executive headshots with ai',
          'ai-generated professional images',
          'digital professional portraits',
        ],
        pt: [
          'fotos profissionais de ia',
          'fotos de ia para linkedin',
          'retratos corporativos de ia',
          'fotos de perfil profissional',
          'fotos de currículo com ia',
          'selfies profissionais de ia',
          'fotos de ia para impulsionar a carreira',
          'retratos executivos com ia',
          'imagens profissionais geradas por ia',
          'retratos profissionais digitais',
        ],
      },
      'outfit-ideas': {
        en: [
          'ai outfit generator',
          'virtual clothing try-on',
          'ai fashion stylist',
          'personalized outfit recommendations',
          'ai wardrobe planner',
          'digital fashion assistant',
          'ai-powered style suggestions',
          'virtual outfit planner',
          'ai fashion inspiration',
          'smart wardrobe ai',
        ],
        pt: [
          'gerador de roupas com ia',
          'provador virtual de roupas',
          'estilista de ia',
          'recomendações personalizadas de roupas',
          'planejador de guarda-roupa com ia',
          'assistente de moda digital',
          'sugestões de estilo com ia',
          'planejador virtual de roupas',
          'inspiração de moda com ia',
          'guarda-roupa inteligente com ia',
        ],
      },
      travel: {
        en: [
          'ai travel photos',
          'virtual vacation pictures',
          'ai tourist photos',
          'digital travel memories',
          'ai-generated travel content',
          'virtual travel experiences',
          'ai travel inspiration',
          'personalized travel photos',
          'ai destination images',
          'virtual globetrotter',
        ],
        pt: [
          'fotos de viagem com ia',
          'fotos virtuais de férias',
          'fotos de turista com ia',
          'memórias digitais de viagem',
          'conteúdo de viagem gerado por ia',
          'experiências virtuais de viagem',
          'inspiração de viagem com ia',
          'fotos de viagem personalizadas',
          'imagens de destinos com ia',
          'viajante virtual',
        ],
      },
      instagram: {
        en: [
          'ai instagram photos',
          'instagram content creator',
          'ai social media pictures',
          'instagram influencer tool',
          'ai-powered instagram feed',
          'instagram aesthetic generator',
          'viral instagram content',
          'ai instagram post ideas',
          'instagram engagement booster',
          'ai social media optimization',
        ],
        pt: [
          'fotos de instagram com ia',
          'criador de conteúdo para instagram',
          'fotos de mídia social com ia',
          'ferramenta para influenciadores do instagram',
          'feed do instagram com ia',
          'gerador de estética para instagram',
          'conteúdo viral para instagram',
          'ideias de posts com ia para instagram',
          'impulsionador de engajamento no instagram',
          'otimização de mídia social com ia',
        ],
      },
      hairstyles: {
        en: [
          'ai hairstyle generator',
          'virtual hair makeover',
          'ai hair transformation',
          'hairstyle try-on app',
          'ai hair color simulator',
          'digital hairstylist',
          'ai haircut ideas',
          'virtual hair experiments',
          'ai hair trends',
          'personalized hairstyle recommendations',
        ],
        pt: [
          'gerador de penteados com ia',
          'transformação virtual de cabelo',
          'transformação de cabelo com ia',
          'app para experimentar penteados',
          'simulador de cor de cabelo com ia',
          'cabeleireiro digital',
          'ideias de corte de cabelo com ia',
          'experimentos virtuais de cabelo',
          'tendências de cabelo com ia',
          'recomendações personalizadas de penteados',
        ],
      },
    };
    const selectedBaseKeywords =
      baseKeywords[locale as keyof typeof baseKeywords] || baseKeywords.en;
    const selectedUseCaseKeywords =
      useCaseKeywords[useCase as keyof typeof useCaseKeywords]?.[
        locale as keyof (typeof useCaseKeywords)[keyof typeof useCaseKeywords]
      ] ||
      useCaseKeywords[useCase as keyof typeof useCaseKeywords]?.en ||
      [];

    return [...selectedBaseKeywords, ...selectedUseCaseKeywords];
  };

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
    alternates: {
      canonical: `${baseUrl}${currentPath}`,
      languages: {
        en: `${baseUrl}/${props.params.usecase}`,
        pt: `${baseUrl}/pt/${props.params.usecase}`,
      },
    },
    keywords: getKeywords(props.params.usecase, props.params.locale),
  };
}

export async function generateStaticParams() {
  return AppConfig.locales.flatMap((locale) =>
    allowedUseCases.map((usecase) => ({
      locale,
      usecase,
    })),
  );
}

export default function UseCasesPage({
  params: { locale, usecase },
}: {
  params: { locale: string; usecase: AllowedUseCases };
}) {
  unstable_setRequestLocale(locale);

  const useCase = usecase;
  if (!allowedUseCases.includes(useCase)) {
    redirect('/');
  }
  return (
    <>
      <UseCaseHeroSection useCase={useCase} />
      <UseCasePhotosSection useCase={useCase} />
      <StepsSection />
      <FeaturesSection />
      <ComparisonSection />
      <UsesSection />
      <PriceSection />
      <FAQSection />
      <UseCaseLastSection useCase={useCase} />
    </>
  );
}
