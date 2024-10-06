'use client';

import React from 'react';

export default function ResponsiveHeader() {
  return (
    <div className="flex h-16 min-h-16 w-full items-center justify-between">
      <div className="hidden h-16 min-h-16 w-full items-center justify-between border-b bg-white px-6 dark:bg-black sm:flex">
        <div className="text-2xl">CLIENT ID</div>
      </div>
    </div>
  );
}
