/* eslint-disable import/no-extraneous-dependencies */
// eslint-disable-next-line import/extensions
import { fileURLToPath } from 'node:url';
import withBundleAnalyzer from '@next/bundle-analyzer';
import withNextIntl from 'next-intl/plugin';
import createJiti from 'jiti';

const jiti = createJiti(fileURLToPath(import.meta.url));
jiti('./src/libs/Env');

const withNextIntlConfig = withNextIntl('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

// TODO: FIXME: Update when adding new use cases
const allowedUseCases = [
  'ai-dating',
  'professional-headshots',
  'outfit-ideas',
  'travel',
  'instagram',
  'hairstyles',
  'linkedin-ai-photo',
  'ai-headshot',
];

/** @type {import('next').NextConfig} */
export default bundleAnalyzer(
  withNextIntlConfig({
    eslint: {
      dirs: ['.'],
    },
    // transpilePackages: ['@t3-oss/env-nextjs', '@t3-oss/env-core'],
    poweredByHeader: false,
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'storage.googleapis.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'firebasestorage.googleapis.com',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'replicate.delivery',
          pathname: '**',
        },
        {
          protocol: 'https',
          hostname: 'images.unsplash.com',
          pathname: '**',
        },
      ],
    },
    webpack: (config, { isServer, dev }) => {
      // Create a new config object
      const newConfig = { ...config };

      // Add externals to resolve errors
      newConfig.externals = [
        ...(newConfig.externals || []),
        {
          bufferutil: 'bufferutil',
          'utf-8-validate': 'utf-8-validate',
        },
      ];

      // Add this section for better code splitting
      if (!isServer && !dev) {
        newConfig.optimization = {
          ...(newConfig.optimization || {}),
          splitChunks: {
            chunks: 'all',
            minSize: 20000,
            maxSize: 244000,
            minChunks: 1,
            maxAsyncRequests: 30,
            maxInitialRequests: 30,
            cacheGroups: {
              defaultVendors: {
                test: /[\\/]node_modules[\\/]/,
                priority: -10,
                reuseExistingChunk: true,
              },
              default: {
                minChunks: 2,
                priority: -20,
                reuseExistingChunk: true,
              },
            },
          },
        };
      }

      return newConfig;
    },
    experimental: {
      optimizeCss: true,
      optimizePackageImports: ['@next/third-parties/google'],
    },
    async redirects() {
      return [
        ...allowedUseCases.flatMap((useCase) => [
          {
            source: `/${useCase}`,
            destination: `/uses/${useCase}`,
            permanent: true,
          },
          {
            source: `/pt/${useCase}`,
            destination: `/pt/uses/${useCase}`,
            permanent: true,
          },
        ]),
      ];
    },
  }),
);
