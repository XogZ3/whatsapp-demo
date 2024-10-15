import Image from 'next/image';
import { useTranslations } from 'next-intl';
import React from 'react';

import { Container, Section } from '../GeneralContainers';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';

const FAQSection: React.FC = () => {
  const t = useTranslations('FAQSection');
  const faqItems = t.raw('faqs') as Array<{ question: string; answer: string }>;

  return (
    <Section id="faq">
      <Container className="flex flex-col sm:flex-row">
        <div className="relative h-96 w-full sm:h-auto sm:w-1/2">
          <Image
            src="/assets/images/faq_hero.png"
            alt="faq"
            fill
            sizes="(min-width: 1220px) 34rem, (min-width: 640px) 45.71vw, calc(100vw - 3rem)"
            style={{ objectFit: 'cover', objectPosition: '50% 0%' }}
            className="object-center"
            loading="lazy"
          />
        </div>
        <div className="flex w-full flex-col items-center justify-center p-4 sm:w-1/2 sm:p-8">
          <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl xl:text-5xl">
            {t('header')}
          </h2>
          <Accordion type="single" collapsible className="mt-8 w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </Section>
  );
};

export default FAQSection;
