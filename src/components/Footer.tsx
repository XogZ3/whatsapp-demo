'use client';

import { useTranslations } from 'next-intl';
import { Link } from 'next-view-transitions';
import process from 'process';
import React, { useEffect, useState } from 'react';

import { AppConfig } from '@/utils/appConfig';

import { Container } from './GeneralContainers';

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
        {
          id: 'sitemap',
          label: `${t('Title_1.Sitemap.label')}`,
          href: '/sitemap',
          description: `${t('Title_1.Sitemap.description')}`,
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
        {/* COPYRIGHT */}
        <div className="flex flex-col items-center justify-center pb-2 pt-4 text-center text-sm font-extralight md:text-base">
          <span className="">
            © {t('Copyright.text_1')} {defaultYear} {AppConfig.name}.{' '}
            {t('Copyright.text_2')}.
          </span>
          <Link
            target="_blank"
            href={process.env.NEXT_PUBLIC_COMPANY_URL as string}
          >
            {t('Copyright.text_3')} {process.env.NEXT_PUBLIC_COMPANY}
          </Link>
        </div>
      </Container>
    </footer>
  );
}
