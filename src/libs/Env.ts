/* eslint-disable import/prefer-default-export */
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// Don't add NODE_ENV into T3 Env, it changes the tree-shaking behavior
export const Env = createEnv({
  server: {
    FIREBASE_SERVICE_ACCOUNT_KEY: z.string().min(1),
    FACEBOOK_APP_SECRET: z.string().min(1),
    WEBHOOK_VERIFY_TOKEN: z.string().min(1),
    WHATSAPP_TOKEN: z.string().min(1),
    PHONE_ID: z.string().min(1),
    WABA_ID: z.string().min(1),
    PHONE_NUMBER: z.string().min(1),
  },
  client: {
    NEXT_PUBLIC_EMAIL: z.string().optional(),
    NEXT_PUBLIC_COMPANY: z.string().optional(),
    NEXT_PUBLIC_COMPANY_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().optional(),
    NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  },
  // You need to destructure all the keys manually
  runtimeEnv: {
    FIREBASE_SERVICE_ACCOUNT_KEY: process.env.FIREBASE_SERVICE_ACCOUNT_KEY,
    FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,
    WEBHOOK_VERIFY_TOKEN: process.env.WEBHOOK_VERIFY_TOKEN,
    WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
    PHONE_ID: process.env.PHONE_ID,
    WABA_ID: process.env.WABA_ID,
    PHONE_NUMBER: process.env.PHONE_NUMBER,
    NEXT_PUBLIC_EMAIL: process.env.NEXT_PUBLIC_EMAIL,
    NEXT_PUBLIC_COMPANY: process.env.NEXT_PUBLIC_COMPANY,
    NEXT_PUBLIC_COMPANY_URL: process.env.NEXT_PUBLIC_COMPANY_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  },
});
