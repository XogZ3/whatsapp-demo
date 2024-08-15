// pages/sitemap.tsx

'use client';

import { Link } from 'next-view-transitions';

import { pages } from '@/app/sitemap';
import { Container } from '@/components/GeneralContainers';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { getBaseUrl } from '@/utils/helpers';

const SitemapPage = () => {
  const baseURL = getBaseUrl();
  const sitemapData = pages.map((page) => ({ url: `${baseURL}/${page}` }));

  return (
    <Container className="h-screen w-full">
      {sitemapData.length === 0 ? (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-y-2 md:gap-y-6">
          <LoadingSpinner />
          <h3>Loading Sitemap</h3>
        </div>
      ) : (
        <>
          <h2 className="py-4">Sitemap</h2>
          <div className="grid w-full grid-cols-2 items-start justify-start gap-y-2 md:grid-cols-4">
            {sitemapData.map((item: any, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={index} className="flex gap-2">
                <Link
                  className="hover:text-blue-700 hover:underline dark:hover:text-red-300"
                  href={`${item.url}`}
                >
                  {item.url}
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};

export default SitemapPage;
