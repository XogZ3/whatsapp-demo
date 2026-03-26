import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getUserFields } from '@/utils/ReplyHelper/FirebaseHelpers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientid = searchParams.get('clientid');

  try {
    const { subscriptionId } = await getUserFields(clientid!);
    if (!subscriptionId)
      return NextResponse.json(
        { error: 'subscriptions not found' },
        { status: 404 },
      );
    const subscriptionDetails =
      await stripe.subscriptions.retrieve(subscriptionId);

    const result = {
      subscriptionId,
      membershipEndDate: subscriptionDetails.current_period_end,
      membershipStartDate: subscriptionDetails.billing_cycle_anchor,
    };
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
