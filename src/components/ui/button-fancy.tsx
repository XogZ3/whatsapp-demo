'use client';

import * as React from 'react';

import { cn } from '@/libs/utils';

interface ButtonFancyProps {
  text?: string;
  path?: string;
  className?: string;
  onClick?: () => void;
}

const ButtonFancy: React.FC<ButtonFancyProps> = ({
  text = 'fancy-button',
  path = '/',
  className = '',
  onClick,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick();
    }
    window.open(path, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group/btn relative text-2xl font-semibold flex w-full items-center justify-center rounded-md bg-gradient-to-br from-red-500 to-amber-800 px-4 py-2 text-white shadow-md shadow-red-500/30 transition duration-300 hover:bg-gradient-to-tl hover:shadow-lg hover:shadow-amber-500/30 dark:from-red-600 dark:to-amber-600 dark:shadow-red-700/30 hover:ring-1 dark:hover:ring-slate-300/90 hover:ring-slate-700/90 hover:ring-offset-2',
        className,
      )}
      type="button"
    >
      {text}
    </button>
  );
};

export default ButtonFancy;
