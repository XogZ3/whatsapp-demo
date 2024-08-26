import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

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
            price: 'price_1PrcXnDWnX2YhQwszW8XrKBs',
            quantity: 1,
          },
        ],
        metadata: {
          clientid, // Add any metadata you need
        },
        // after_completion: {
        //   type: 'redirect',
        //   redirect: {
        //     url: `${getBaseUrl()}/success`, // TODO: Replace with your success URL
        //   },
        // },
      });
    console.log(
      `createPaymentLink api logs: `,
      JSON.stringify(paymentLink, null, 2),
    );
    console.log('stripe link: ', paymentLink.url);

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
