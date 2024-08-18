import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/libs/utils';

const ButtonFancy = ({ text = 'fancy-button', path = '/', className = '' }) => {
  return (
    <Link target="_blank" href={path}>
      <button
        className={cn(
          'group/btn relative flex w-full items-center justify-center rounded-md bg-gradient-to-br from-green-500 to-teal-500 px-4 py-2 font-medium text-white shadow-md shadow-green-500/30 transition duration-300 hover:bg-gradient-to-tl hover:shadow-lg hover:shadow-teal-500/30 dark:from-green-600 dark:to-teal-600 dark:shadow-green-700/30 hover:ring-1 dark:hover:ring-slate-300/90 hover:ring-slate-700/90 hover:ring-offset-2',
          className,
        )}
        type="submit"
      >
        {text}
      </button>
    </Link>
  );
};

export default ButtonFancy;
