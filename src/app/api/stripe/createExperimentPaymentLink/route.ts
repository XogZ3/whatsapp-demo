import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getBaseUrl } from '@/utils/helpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export type CreatePaymentLinkResult = {
  status: 200 | 400;
  paymentLink: string;
  metadata: Stripe.Metadata;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { clientid } = JSON.parse(rawBody);

  try {
    const paymentLink: Stripe.Response<Stripe.PaymentLink> =
      await stripe.paymentLinks.create({
        line_items: [
          {
            price:
              process.env.STRIPE_EXPEIMENT_PRICE_ID ||
              'price_1QDk5cJHS9DkVfWMHlOHIN6j',
            quantity: 1,
          },
        ],
        allow_promotion_codes: true,
        metadata: {
          clientid,
        },
        after_completion: {
          type: 'redirect',
          redirect: {
            url: `${getBaseUrl()}/success/${clientid}`,
          },
        },
      });

    const result: CreatePaymentLinkResult = {
      status: 200,
      paymentLink: paymentLink.url,
      metadata: paymentLink.metadata,
    };
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
