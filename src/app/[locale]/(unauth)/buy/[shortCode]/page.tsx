'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import NotFound from '@/app/[locale]/not-found';
import { AppConfig } from '@/utils/appConfig';

import LoadingPage from '../../../loading';

export default function BuyPage({ params }: { params: any }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { shortCode } = params;

  useEffect(() => {
    const redirectToLongURL = async () => {
      try {
        const response = await fetch(`/api/getLongURL?shortCode=${shortCode}`);
        const data = await response.json();

        if (data.longURL) {
          router.push(data.longURL);
        } else {
          throw new Error('Long URL not found');
        }
      } catch (err) {
        setLoading(false);
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred',
        );
      }
    };

    redirectToLongURL();
  }, [shortCode, router]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <NotFound />;
  }

  return (
    <div className="flex size-full items-center justify-center">
      <h3>The payment link is invalid</h3>
      <p>Please contact support {AppConfig.email}</p>
    </div>
  );
}
