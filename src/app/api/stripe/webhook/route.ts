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
import { type UserFieldsFirebase } from '@/utils/ReplyHelper/FirebaseHelpers';
import { getTranslation, type Language } from '@/utils/translations';

// import type { StripeEvent } from './types';
const firestore = firebase.getFirestore();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

async function sendPhotoUploadInstruction(
  clientid: string,
  language: Language,
) {
  const message = getTranslation('photo upload instruction', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  let clientid = subscription?.metadata?.clientid;

  // Use subscription-client id mapping
  if (!clientid) {
    const subscriptionRef = firestore.collection('subscriptions');
    const query = subscriptionRef.where('subscriptionId', '==', subscriptionId);
    const snapshot = await query.get();
    const subscriptionDoc = snapshot.docs[0];
    const subscriptionData = subscriptionDoc?.data();
    clientid = subscriptionData?.clientid;
  }

  let updates: any;
  updates = {
    clientid,
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

  let language: Language = 'english';

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

      const clientData = (await transaction.get(clientDocRef)).data();
      language = clientData?.language;
      const state = clientData?.state;

      let stateJSON;
      try {
        stateJSON = state ? JSON.parse(state) : {};
      } catch (error) {
        console.error('Error parsing state:', error);
        stateJSON = {};
      }

      stateJSON.value = 'imagesIncomplete';

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
  if (clientid) {
    await Promise.all([
      sendPurchaseToFBCoversionAPI(clientid),
      sendPhotoUploadInstruction(clientid, language),
    ]);
  }

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
  if (!clientid || !subscriptionId) {
    console.error(
      'Missing clientid or subscriptionId in session metadata',
      clientid,
      subscriptionId,
    );
    return NextResponse.json({
      status: 400,
      error: 'Missing clientid or subscriptionId',
    });
  }

  let subscriptionData: Stripe.Subscription;
  try {
    subscriptionData = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription from Stripe:', error);
    return NextResponse.json({
      status: 500,
      error: 'Error retrieving subscription',
    });
  }

  let clientData: FirebaseFirestore.DocumentData | undefined;
  let language: Language = 'english';

  await firestore.runTransaction(async (transaction) => {
    const subscriptionRef = firestore
      .collection('subscriptions')
      .doc(subscriptionId);
    const clientDocRef = firestore
      .collection('apps')
      .doc(process.env.WABA_ID!)
      .collection('clients')
      .doc(clientid);

    // Perform all reads first
    const [subscriptionDoc, clientDoc] = await Promise.all([
      transaction.get(subscriptionRef),
      transaction.get(clientDocRef),
    ]);

    clientData = clientDoc.data();
    language = clientData?.language || 'english';
    const state = clientData?.state;
    const lastStripeEventId = clientData?.lastStripeEventId;

    // Check if the event ID has already been processed
    if (lastStripeEventId === id) {
      console.log('[-] Duplicate event received, ignoring.');
      return;
    }

    // Now perform writes
    if (!subscriptionDoc.exists) {
      transaction.set(subscriptionRef, { clientid, subscriptionId });
    } else {
      transaction.update(subscriptionRef, { clientid });
    }

    let stateJSON;
    try {
      stateJSON = state ? JSON.parse(state) : {};
    } catch (error) {
      console.error('Error parsing state:', error);
      stateJSON = {};
    }

    stateJSON.value = 'imagesIncomplete';

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
    await Promise.all([
      sendMessageToWhatsapp(payload),
      sendPurchaseToFBCoversionAPI(clientid),
    ]);
    await sendPhotoUploadInstruction(clientid, language);
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
  return NextResponse.json({ status: 200 });
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
      case 'customer.subscription.paused':
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
