'use client';

// import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { Link } from 'next-view-transitions';
import React from 'react';

import { AppConfig } from '@/utils/appConfig';

import { Container } from './GeneralContainers';
import LocaleSwitcher from './LocaleSwitcher';
import ThemeSwitch from './ThemeSwitch';
// import { Button } from './ui/button';
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from './ui/drawer';

// const items = [
//   {
//     id: 'about-us',
//     label: 'About Us',
//     href: '/about',
//   },
// ];

export default function Header() {
  // const [open, setOpen] = useState(false);

  return (
    <nav
      className="flex h-14 items-center justify-between border-b bg-white dark:bg-black"
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
          {/* <nav className="hidden items-center justify-center gap-6 sm:flex">
            <Link key="home" className="font-medium" href="/">
              Home
            </Link>
            {items.map((item) => (
              <Link key={item.id} className="font-medium" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav> */}

          <div className="mx-auto flex items-center sm:px-0">
            <LocaleSwitcher />
          </div>
          <div className="mx-auto flex items-center sm:px-0">
            <ThemeSwitch />
          </div>
          {/* Drawer */}
          {/* <div className="flex items-center justify-center pl-2 sm:hidden">
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger role="navigation">
                <HamburgerMenuIcon className="size-5" />
              </DrawerTrigger>

              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>
                    <Button
                      onClick={() => {
                        setOpen(false);
                        // window.location.href = '/';
                        // do something
                      }}
                    >
                      Book Now
                    </Button>
                  </DrawerTitle>
                </DrawerHeader>
                <DrawerClose>
                  <nav className="flex flex-col items-center justify-center gap-6 px-2">
                    {items.map((item) => (
                      <Link
                        key={item.id}
                        className="font-medium"
                        href={item.href}
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </DrawerClose>
                <DrawerFooter className="flex w-full items-center justify-center">
                  <DrawerClose asChild>
                    <Button
                      className="w-fit px-4"
                      variant="outline"
                      onClick={() => setOpen(false)}
                    >
                      Close
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div> */}
        </div>
      </Container>
    </nav>
  );
}
