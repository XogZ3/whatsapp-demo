import { useTranslations } from 'next-intl';
import React from 'react';

import { Card, CardFooter, CardHeader } from '@/components/ui/card';

import { Container, Section } from '../GeneralContainers';

interface TestimonialCardProps {
  name: string;
  content: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ name, content }) => {
  const t = useTranslations('TestimonialSection');
  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <p>⭐⭐⭐⭐⭐</p>
        <p className="">{content}</p>
      </CardHeader>
      <CardFooter className="gap-x-2">
        <p className="font-bold">{name}</p>
        <p className="text-sm tracking-tight">{t('verified_purchase')}</p>
      </CardFooter>
    </Card>
  );
};

const TestimonialSection: React.FC = () => {
  const t = useTranslations('TestimonialSection');
  const testimonials = [
    {
      id: 1,
      name: t('testimonial_1.name'),
      content: t('testimonial_1.content'),
    },
    {
      id: 2,
      name: t('testimonial_2.name'),
      content: t('testimonial_2.content'),
    },
    {
      id: 3,
      name: t('testimonial_3.name'),
      content: t('testimonial_3.content'),
    },
  ];

  return (
    <Section className="">
      <Container noYPadding className="">
        <h2 className="mb-5 text-center text-3xl font-bold sm:text-4xl xl:text-5xl">
          {t('header')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} {...testimonial} />
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default TestimonialSection;
