import { format } from 'date-fns';
import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { sendPurchaseToFBCoversionAPI } from '@/utils/fconversionHelper';
import {
  getUserFields,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { sendPromptingInstruction } from '@/utils/sendSampleImages';
import { getTranslation } from '@/utils/translations';

// import type { StripeEvent } from './types';
const firestore = firebase.getFirestore();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  const { clientid } = subscription?.metadata || null;
  let updates: any;
  updates = {
    subscriptionId,
    subscriptionStatus: subscription.status,
    membershipStartDate: subscription.current_period_start * 1000,
    membershipEndDate: subscription.current_period_end * 1000,
  };

  if (event.type === 'customer.subscription.deleted') {
    updates.paid = false;
  } else {
    updates.paid = subscription.status === 'active';
  }

  // Save subscription data to a separate collection
  await firestore.runTransaction(async (transaction) => {
    const subscriptionRef = firestore
      .collection('subscriptions')
      .doc(subscriptionId);
    const subscriptionDoc = await transaction.get(subscriptionRef);

    if (!subscriptionDoc.exists) {
      transaction.set(subscriptionRef, updates);
    } else {
      transaction.update(subscriptionRef, updates);
    }

    const subscriptionData = subscriptionDoc.data();

    if (clientid) {
      const clientDocRef = firestore
        .collection('apps')
        .doc(process.env.WABA_ID!)
        .collection('clients')
        .doc(clientid);

      const clientDoc = (await transaction.get(clientDocRef)).data();

      const stateJSON = {
        status: 'stopped',
        context: {
          language: clientDoc?.language || 'english',
          modelGenerated: true,
        },
        value: 'photoPrompting',
        children: {},
        historyValue: {},
        tags: [],
      };

      updates = {
        subscriptionId,
        state: JSON.stringify(stateJSON),
        paid: subscriptionData?.status === 'active',
        processing: false,
        creditsUsedToday: 0,
        creditsResetDate: DateTime.now().toMillis(),
        subscriptionStatus: subscriptionData?.status,
        membershipStartDate:
          (subscriptionData?.current_period_start ?? 0) * 1000,
        membershipEndDate: (subscriptionData?.current_period_end ?? 0) * 1000,
        lastStripeEventId: subscriptionId,
      };

      transaction.update(clientDocRef, updates);
    }
  });

  console.log(
    `Subscription ${event.type} processed for subscriptionId: ${subscriptionId}`,
  );
  return NextResponse.json({ status: 200 });
}

async function handleInvoiceEvent(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  const invoiceData = {
    invoiceId: invoice.id,
    subscriptionId,
    amountPaid: invoice.amount_paid / 100,
    amountDue: invoice.amount_due / 100,
    currency: invoice.currency,
    status: event.type === 'invoice.payment_succeeded' ? 'succeeded' : 'failed',
    date: new Date(invoice.created * 1000).toISOString(),
  };

  // Save invoice data
  await firestore.runTransaction(async (transaction) => {
    const invoiceRef = firestore.collection('invoices').doc(invoice.id);
    transaction.set(invoiceRef, invoiceData);
  });

  console.log(
    `Invoice ${event.type} processed for subscriptionId: ${subscriptionId}`,
  );
  return NextResponse.json({ status: 200 });
}

async function handleCheckoutSessionCompleted(event: Stripe.Event) {
  const session = event.data.object as Stripe.Checkout.Session;
  const clientid = session.metadata?.clientid;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  const { id, status } = session;
  const { language = 'english', lastStripeEventId } = await getUserFields(
    clientid!,
  );

  // Check if the event ID has already been processed
  if (lastStripeEventId === id) {
    console.log('[-] Duplicate event received, ignoring.');
    return;
  }

  if (!clientid || !subscriptionId) {
    console.error('Missing clientid or subscriptionId in session metadata');
    return;
  }

  let subscriptionData: Stripe.Subscription;

  await firestore.runTransaction(async (transaction) => {
    const subscriptionRef = firestore
      .collection('subscriptions')
      .doc(subscriptionId);
    const clientDocRef = firestore
      .collection('apps')
      .doc(process.env.WABA_ID!)
      .collection('clients')
      .doc(clientid);

    const subscriptionDoc = await transaction.get(subscriptionRef);
    if (!subscriptionDoc.exists) {
      transaction.set(subscriptionRef, { clientid, subscriptionId });
    } else {
      transaction.update(subscriptionRef, { clientid });
    }

    subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
    if (subscriptionData) {
      const stateJSON = {
        status: 'stopped',
        context: {
          language: language || 'english',
          modelGenerated: true,
        },
        value: 'photoPrompting',
        children: {},
        historyValue: {},
        tags: [],
      };

      const updates: Partial<UserFieldsFirebase> = {
        customerId,
        subscriptionId,
        state: JSON.stringify(stateJSON),
        paid: subscriptionData.status === 'active',
        processing: false,
        creditsUsedToday: 0,
        creditsResetDate: DateTime.now().toMillis(),
        subscriptionStatus: subscriptionData.status,
        membershipStartDate: subscriptionData.current_period_start * 1000,
        membershipEndDate: subscriptionData.current_period_end * 1000,
        lastStripeEventId: id,
      };

      transaction.update(clientDocRef, updates);
    }
  });

  const formattedDate = format(
    new Date(subscriptionData!.current_period_end * 1000),
    'MMMM d, yyyy',
  );

  const message = `${getTranslation('payment confirmation', language)} ${formattedDate}`;
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };

  if (status === 'complete' && subscriptionData!.status === 'active') {
    await sendMessageToWhatsapp(payload);
    await sendPromptingInstruction(clientid, language);
    await sendPurchaseToFBCoversionAPI(clientid);
    console.log(
      `Checkout session completed for clientid: ${clientid}, subscriptionId: ${subscriptionId}`,
    );
  }

  // Update all related invoices with the clientid
  const invoicesSnapshot = await firestore
    .collection('invoices')
    .where('subscriptionId', '==', subscriptionId)
    .get();

  const batch = firestore.batch();
  invoicesSnapshot.docs.forEach((doc) => {
    batch.update(doc.ref, { clientid });
  });
  await batch.commit();
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  // const res: StripeEvent = JSON.parse(rawBody);

  const sig = req.headers.get('Stripe-Signature');

  try {
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      endpointSecret!,
    );
    console.log('Received stripe event', event.type);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await handleSubscriptionEvent(event);
        return NextResponse.json({ status: 200 });
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        await handleInvoiceEvent(event);
        return NextResponse.json({ status: 200 });
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event);
        return NextResponse.json({ status: 200 });
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return NextResponse.json({ status: 200 });
    }
  } catch (error) {
    console.error('Error constructing Stripe event:', error);
    return NextResponse.json({
      status: 500,
      error: 'Webhook Error: Invalid Signature',
    });
  }
}
