'use client';

import { useTranslations } from 'next-intl';
import { Link } from 'next-view-transitions';
import process from 'process';
import React, { useEffect, useState } from 'react';

import { AppConfig } from '@/utils/appConfig';

import { Container } from './GeneralContainers';
import Socials from './Socials';

const LinkSkeleton = ({
  id,
  title,
  links,
}: {
  id: string;
  title?: string;
  links: { id: string; label: string; href: string; description: string }[];
}) => (
  <div
    key={id}
    className={`md:col-span-1 ${id === 'contact' ? 'col-span-2' : 'col-span-1'}`}
  >
    <h2>{title}</h2>
    <div className="flex flex-col">
      {links.map((link) => (
        <Link href={link.href} key={link.id} className="py-2 text-base md:py-0">
          <p>{link.label}</p>
        </Link>
      ))}
    </div>
  </div>
);

export function Footer() {
  const [defaultYear, setdefaultYear] = useState(2024);
  useEffect(() => {
    setdefaultYear(new Date().getFullYear());
  }, []);

  const t = useTranslations('FooterSection');

  const items = [
    {
      id: 'generate-ai-photos',
      title: `${t('Title_3.label')}`,
      links: [
        {
          id: 'ai-dating',
          label: `${t('Title_3.AIDating.label')}`,
          href: '/uses/ai-dating',
          description: `${t('Title_3.AIDating.description')}`,
        },
        {
          id: 'professional-headshots',
          label: `${t('Title_3.ProfessionalHeadshots.label')}`,
          href: '/uses/professional-headshots',
          description: `${t('Title_3.ProfessionalHeadshots.description')}`,
        },
        {
          id: 'outfit-ideas',
          label: `${t('Title_3.OutfitIdeas.label')}`,
          href: '/uses/outfit-ideas',
          description: `${t('Title_3.OutfitIdeas.description')}`,
        },
        {
          id: 'travel',
          label: `${t('Title_3.Travel.label')}`,
          href: '/uses/travel',
          description: `${t('Title_3.Travel.description')}`,
        },
        {
          id: 'instagram',
          label: `${t('Title_3.Instagram.label')}`,
          href: '/uses/instagram',
          description: `${t('Title_3.Instagram.description')}`,
        },
        {
          id: 'hairstyles',
          label: `${t('Title_3.Hairstyles.label')}`,
          href: '/uses/hairstyles',
          description: `${t('Title_3.Hairstyles.description')}`,
        },
      ],
    },
    {
      id: 'company',
      title: `${t('Title_1.label')}`,
      links: [
        {
          id: 'privacy-policy',
          label: `${t('Title_1.Privacy.label')}`,
          href: '/privacy',
          description: `${t('Title_1.Privacy.description')}`,
        },
        {
          id: 'terms-conditions',
          label: `${t('Title_1.Terms.label')}`,
          href: '/terms-and-conditions',
          description: `${t('Title_1.Terms.description')}`,
        },
      ],
    },
    {
      id: 'contact',
      title: `${t('Title_2.label')}`,
      links: [
        {
          id: 'email',
          label: `${t('Title_2.Email.label')}: ${AppConfig.email}`,
          href: `mailto:${AppConfig.email}`,
          description: `${t('Title_2.Email.description')}`,
        },
        {
          id: 'cancel-subscription',
          label: `${t('Title_2.CancelSubscription.label')}`,
          href: '/cancel-subscription',
          description: `${t('Title_2.CancelSubscription.description')}`,
        },
      ],
    },
  ];

  return (
    <footer className="h-fit border-t bg-white py-2 dark:bg-black">
      {/* FOOTER */}
      <Container noYPadding>
        <div className="grid grid-cols-2 gap-4 bg-white/30 dark:bg-transparent md:flex md:w-full md:items-start md:justify-between md:gap-x-16 md:gap-y-8 md:p-2">
          {items.map((item) => (
            <LinkSkeleton
              key={item.id}
              id={item.id}
              title={item.title}
              links={item.links}
            />
          ))}
        </div>

        {/* SOCIAL SHARE BUTTONS */}
        <Socials />
        {/* COPYRIGHT */}
        <div className="flex flex-col items-center justify-center pb-2 pt-4 text-center text-sm font-extralight md:text-base">
          <span className="">
            © {t('Copyright.text_1')} {defaultYear} {AppConfig.name}.{' '}
            {t('Copyright.text_2')}.
          </span>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href={process.env.NEXT_PUBLIC_COMPANY_URL as string}
          >
            {t('Copyright.text_3')} {process.env.NEXT_PUBLIC_COMPANY}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
