'use client';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AppConfig } from '@/utils/appConfig';

import { Container } from './GeneralContainers';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const t = useTranslations('Header');
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Handle initial load with hash
    if (window.location.hash) {
      handleHashChange();
    }

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav
      className="flex h-14 items-center justify-between border-b"
      style={{ zIndex: 1000, position: 'relative' }}
    >
      <Container className="flex w-full items-center justify-between">
        <Link
          href="/"
          className="flex flex-row items-center justify-center gap-2 text-xl font-semibold sm:text-2xl sm:font-bold"
        >
          {AppConfig.name}
        </Link>

        <div className="flex items-center justify-center gap-2 sm:gap-6">
          <div className="hidden sm:flex sm:items-center sm:gap-6">
            <Link
              href={`${pathname}#pricing`}
              className="cursor-pointer hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
              onClick={handleLinkClick}
            >
              {t('pricing')}
            </Link>
            <Link
              href={`${pathname}#faq`}
              className="cursor-pointer hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
              onClick={handleLinkClick}
            >
              {t('faq')}
            </Link>
          </div>
          <div className="flex h-10 items-center justify-center">
            <LocaleSwitcher />
          </div>
          <Button
            ref={buttonRef}
            variant="ghost"
            className="h-10 sm:hidden"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <HamburgerMenuIcon className="size-5" />
          </Button>
        </div>
      </Container>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute inset-x-0 top-14 flex flex-col items-center justify-center border-b bg-white p-4 text-xl dark:bg-black sm:hidden"
        >
          <Link
            href={`${pathname}#pricing`}
            className="block py-2 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
            onClick={handleLinkClick}
          >
            {t('pricing')}
          </Link>
          <Link
            href={`${pathname}#faq`}
            className="block py-2 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
            onClick={handleLinkClick}
          >
            {t('faq')}
          </Link>
        </div>
      )}
    </nav>
  );
}
