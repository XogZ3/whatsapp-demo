import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

function randomAlphabet(length: number) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return Array.from(
    { length },
    () => alphabet[Math.floor(Math.random() * alphabet.length)],
  ).join('');
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { clientid } = JSON.parse(rawBody);

  try {
    const couponCode = `FOTO${randomAlphabet(2)}${clientid.slice(-4)}`;
    const promotionCode: Stripe.Response<Stripe.PromotionCode> =
      await stripe.promotionCodes.create({
        coupon: process.env.STRIPE_HOUR_RETENTION_COUPON_ID || 'C1XAw9nS',
        code: couponCode,
        max_redemptions: 1,
        expires_at: Math.floor(DateTime.now().plus({ hours: 1 }).toSeconds()),
        metadata: {
          clientid,
        },
        restrictions: {
          first_time_transaction: true,
        },
      });
    return NextResponse.json({ coupon: promotionCode.code }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
