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
    const coupon: Stripe.Response<Stripe.Coupon> = await stripe.coupons.create({
      duration: 'once',
      name: couponCode,
      percent_off: 50,
      max_redemptions: 1,
      redeem_by: Math.floor(DateTime.now().plus({ hours: 1 }).toSeconds()),
      metadata: {
        clientid,
      },
    });

    return NextResponse.json({ coupon: coupon.id }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 400 });
  }
}
