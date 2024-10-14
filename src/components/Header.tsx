'use client';

import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { AppConfig } from '@/utils/appConfig';

import { Container } from './GeneralContainers';
import LocaleSwitcher from './LocaleSwitcher';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
              href="#pricing"
              className="cursor-pointer hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="cursor-pointer hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
            >
              FAQ
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
          className="absolute inset-x-0 top-14 flex flex-col items-center justify-center border-b bg-white p-4 dark:bg-black sm:hidden"
        >
          <Link
            href="#pricing"
            className="block py-2 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
            onClick={() => setIsMenuOpen(false)}
          >
            Pricing
          </Link>
          <Link
            href="#faq"
            className="block py-2 hover:underline hover:decoration-red-500 hover:decoration-2 hover:underline-offset-4"
            onClick={() => setIsMenuOpen(false)}
          >
            FAQ
          </Link>
        </div>
      )}
    </nav>
  );
}
