'use client';

import type { VariantProps } from 'class-variance-authority';
import { Moon, Sun } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import type { buttonVariants } from './ui/button';
import { Button } from './ui/button';

type ButtonVariant = NonNullable<
  VariantProps<typeof buttonVariants>['variant']
>;

interface ThemeSwitchProps {
  buttonType?: ButtonVariant;
}

export default function ThemeSwitch({
  buttonType = 'ghost',
}: ThemeSwitchProps) {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  if (!mounted)
    return (
      <Image
        src="data:image/svg+xml;base64,PHN2ZyBzdHJva2U9IiNGRkZGRkYiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMCIgdmlld0JveD0iMCAwIDI0IDI0IiBoZWlnaHQ9IjIwMHB4IiB3aWR0aD0iMjAwcHgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiB4PSIyIiB5PSIyIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjIiIHJ4PSIyIj48L3JlY3Q+PC9zdmc+Cg=="
        width={36}
        height={36}
        sizes="36x36"
        alt="Loading Light/Dark Toggle"
        priority={false}
        title="Loading Light/Dark Toggle"
        draggable={false}
      />
    );

  if (resolvedTheme === 'dark') {
    return (
      <Button
        variant={buttonType}
        size="icon"
        onClick={() => setTheme('light')}
        aria-label="Switch to light theme"
      >
        <Sun />
      </Button>
    );
  }

  if (resolvedTheme === 'light') {
    return (
      <Button
        variant={buttonType}
        size="icon"
        onClick={() => setTheme('dark')}
        aria-label="Switch to dark theme"
      >
        <Moon />
      </Button>
    );
  }
  return null;
}
