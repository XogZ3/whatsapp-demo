'use client';

import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/libs/utils';

import { Button } from './button';

interface ButtonFancyProps {
  text?: string;
  href?: string;
  className?: string;
  onClick?: () => void;
}

const ButtonFancy: React.FC<ButtonFancyProps> = ({
  text = 'fancy-button',
  href,
  className = '',
  onClick,
}) => {
  const sharedClassName = cn(
    'inline-flex items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-amber-800 px-4 py-2 text-2xl font-semibold text-white shadow-md shadow-red-500/30 transition duration-300 hover:bg-gradient-to-tl hover:shadow-lg hover:shadow-amber-500/30 hover:ring-1 hover:ring-slate-700/90 hover:ring-offset-2 dark:from-red-600 dark:to-amber-600 dark:shadow-red-700/30 dark:hover:ring-slate-300/90',
    className,
  );

  if (href) {
    return (
      <Link
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={sharedClassName}
        onClick={onClick}
      >
        {text}
      </Link>
    );
  }

  return (
    <Button onClick={onClick} className={sharedClassName}>
      {text}
    </Button>
  );
};

export default ButtonFancy;
