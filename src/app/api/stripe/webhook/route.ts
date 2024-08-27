import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import {
  handleCompletedCheckoutSession,
  saveStripeEvent,
} from '@/utils/stripeWebhookHandlers';

import type { CheckoutSessionCompletedEvent } from './types';

// import type { StripeEvent } from './types';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  // const res: StripeEvent = JSON.parse(rawBody);

  let event;
  const sig = req.headers.get('Stripe-Signature');
  console.log('Stripe-Signature', sig!);

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret!);
    console.log('stripe webhook event', event.type);
    await saveStripeEvent(event);

    if (event.type === 'checkout.session.completed')
      await handleCompletedCheckoutSession(
        event as CheckoutSessionCompletedEvent,
      );

    return NextResponse.json({ status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
