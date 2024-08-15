import { Link } from 'next-view-transitions';
import * as React from 'react';

import { cn } from '@/libs/utils';

const ButtonFancy = ({ text = 'fancy-button', path = '/', className = '' }) => {
  return (
    <Link href={path}>
      <button
        className={cn(
          'group/btn relative flex w-full items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-purple-500 px-4 py-2 font-medium text-white shadow-md shadow-blue-500/30 transition duration-300 hover:bg-gradient-to-tl hover:shadow-lg hover:shadow-purple-500/30 dark:from-blue-600 dark:to-purple-600 dark:shadow-blue-700/30 hover:ring-1 dark:hover:ring-slate-300/90 hover:ring-slate-700/90 hover:ring-offset-2',
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
