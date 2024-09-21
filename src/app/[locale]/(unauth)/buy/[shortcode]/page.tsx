// app/buy/[shorturl]/page.tsx

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NotFound from '@/app/[locale]/not-found';
import { getLongURLFromMap } from '@/utils/ReplyHelper/FirebaseHelpers';

export default function BuyPage({ params }: { params: any }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const shortCode = params.shortcode;

  useEffect(() => {
    const redirectToLongURL = async () => {
      const longURL = await getLongURLFromMap(shortCode);
      if (longURL) {
        router.push(longURL);
      } else {
        setLoading(false);
      }
    };
    redirectToLongURL();
  }, [shortCode, router]);

  if (loading) {
    return (
      <div className="flex size-full items-center justify-center">
        <h1>Loading...</h1>
      </div>
    );
  }

  return <NotFound />;
}
