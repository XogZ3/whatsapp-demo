'use client';

// import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Link } from 'next-view-transitions';
import React from 'react';

import { AppConfig } from '@/utils/appConfig';

import { Container } from './GeneralContainers';
import LocaleSwitcher from './LocaleSwitcher';
import ThemeSwitch from './ThemeSwitch';

export default function Header() {
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
          {/* Add a fixed width and height to this container */}
          <div className="flex h-10 w-20 items-center justify-center">
            <LocaleSwitcher />
          </div>
          <div className="flex size-10 items-center justify-center">
            <ThemeSwitch />
          </div>
        </div>
      </Container>
    </nav>
  );
}
