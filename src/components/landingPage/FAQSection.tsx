import { useTranslations } from 'next-intl';
import React from 'react';
import Balancer from 'react-wrap-balancer';

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
    <Section>
      <Container>
        <h2 className="mb-4 text-center text-3xl font-bold sm:text-4xl xl:text-5xl">
          <Balancer>{t('header')}</Balancer>
        </h2>
        <Accordion type="single" collapsible className="mt-8 w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Container>
    </Section>
  );
};

export default FAQSection;
