import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export type CreateReferralPromoCodeResult = {
  status: 200 | 400;
  code: string;
  metadata: Stripe.Metadata;
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { clientid } = JSON.parse(rawBody);

  try {
    const promotionCode: Stripe.Response<Stripe.PromotionCode> =
      await stripe.promotionCodes.create({
        coupon: process.env.STRIPE_REFERRAL_COUPON_ID || 'Rq7a1F67',
        max_redemptions: 1,
        expires_at: Math.floor(DateTime.now().plus({ months: 1 }).toSeconds()),
        metadata: {
          clientid,
        },
        restrictions: {
          first_time_transaction: true,
        },
      });

    const result: CreateReferralPromoCodeResult = {
      status: 200,
      code: promotionCode.code,
      metadata: promotionCode.metadata!,
    };
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
