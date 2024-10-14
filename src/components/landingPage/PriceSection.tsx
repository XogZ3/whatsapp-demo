'use client';

import { sendGAEvent } from '@next/third-parties/google';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Container, Section } from '../GeneralContainers';
import ButtonFancy from '../ui/button-fancy';

export default function PriceSection() {
  const t = useTranslations('PriceSection');
  return (
    <Section id="pricing">
      <Container>
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              {t('header')}
            </h2>
            <p className="max-w-[900px]  md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t('subheader')}
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-sm pt-12">
          <Card>
            <CardHeader>
              <CardTitle>{t('monthly_plan')}</CardTitle>
              <CardDescription>
                {t('for_individuals_and_small_teams')}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-3xl font-bold">
                  <s>$29.99</s> $19.99
                </span>
                <span className="text-sm font-medium ">{t('month')}</span>
              </div>
              <ul className="grid gap-2 py-4">
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <span>{t('unlimited_image_generation')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <span>{t('whatsapp_customer_support')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="size-4 text-green-500" />
                  <span>{t('regular_updates_and_improvements')}</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="w-full">
              <ButtonFancy
                text={t('web_cta')}
                href="https://wa.me/971505072100"
                className="w-full"
                onClick={() =>
                  sendGAEvent('event', 'conversion', {
                    send_to: 'AW-16638273706/MO7nCOGP0dsZEKrR3_09',
                    event_category: 'conversion',
                  })
                }
              />
            </CardFooter>
          </Card>
        </div>
      </Container>
    </Section>
  );
}
