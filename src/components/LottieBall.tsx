'use client';

import React, { useRef } from 'react';

import { cn } from '@/libs/utils';

export default function LottieBall({ className }: { className?: string }) {
  const ref = useRef(null);
  React.useEffect(() => {
    import('@lottiefiles/lottie-player');
  });

  return (
    <div className="flex h-fit flex-col items-center justify-center">
      <lottie-player
        src="/assets/images/lottieloader.json"
        className={cn('', className)}
        ref={ref}
        autoplay
        loop
        mode="normal"
        style={{ width: '300px', height: '300px' }}
      />
    </div>
  );
}
