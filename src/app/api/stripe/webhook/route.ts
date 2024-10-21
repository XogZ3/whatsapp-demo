// import { format } from 'date-fns';
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
  callTrainingAPI,
  getUserFields,
  saveAgeAndGender,
  setStatePhotoPrompting,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { sendMessageToTelegram } from '@/utils/telegram';
import { getTranslation, type Language } from '@/utils/translations';

// import type { StripeEvent } from './types';
const firestore = firebase.getFirestore();
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

async function sendModelExistsMessage(clientid: string, language: Language) {
  const message = getTranslation('model already exists', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };

  await sendMessageToWhatsapp(payload);
}

async function sendGeneratingModelMessage(
  clientid: string,
  language: Language,
) {
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: getTranslation('generating model', language),
  };
  await sendMessageToWhatsapp(payload);
}

async function sendGeneratingModelTemplate(
  clientid: string,
  language: Language,
) {
  const languageCode = language === 'portuguese' ? 'pt_BR' : 'en';
  let templateName: string;
  if (languageCode === 'pt_BR') templateName = 'fotolabs_generating_model_pt';
  else templateName = 'fotolabs_generating_model_en';

  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    template: true,
    templateName,
    templateLanguageCode: languageCode,
  };
  await sendMessageToWhatsapp(payload);
}

async function startGeneratingModel(
  clientid: string,
  language: Language,
): Promise<void> {
  try {
    const userFields = await getUserFields(clientid);
    const { loraURL, loraFilename, trainingImageURLs, whatsappExpiration } =
      userFields;

    const isWhatsappExpired =
      DateTime.now().toMillis() > (whatsappExpiration ?? Infinity);

    if (loraURL && loraFilename) {
      await setStatePhotoPrompting(clientid);

      await sendModelExistsMessage(clientid, language);

      return;
    }

    if (isWhatsappExpired) {
      await sendGeneratingModelTemplate(clientid, language);
    } else {
      await sendGeneratingModelMessage(clientid, language);
    }

    const response = await callTrainingAPI(clientid, trainingImageURLs);
    if (response.jobId) {
      console.log(`[+] callTrainingAPI job created: ${response.jobId}`);
    }

    await saveAgeAndGender(clientid);
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 409) {
      console.log(
        '[~] Known error in callStartTrainingAPI action:',
        error.message,
      );
    } else {
      console.error('[!] Error in startGeneratingModel:', error);
    }
    await sendMessageToTelegram(
      `error ${JSON.stringify(error, null, 2)} in startGeneratingModel for clientid ${clientid}`,
    );
  }
}

async function handleSubscriptionEvent(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  let clientid = subscription?.metadata?.clientid;

  // Use subscription-client id mapping if clientid is not in metadata
  if (!clientid) {
    const subscriptionRef = firestore.collection('subscriptions');
    const query = subscriptionRef.where('subscriptionId', '==', subscriptionId);
    const snapshot = await query.get();
    const subscriptionDoc = snapshot.docs[0];
    const subscriptionData = subscriptionDoc?.data();
    clientid = subscriptionData?.clientid;
    if (!clientid) return NextResponse.json({ status: 200 });
  }

  const updates = {
    clientid,
    subscriptionId,
    subscriptionStatus: subscription.status,
    membershipStartDate: subscription.current_period_start * 1000,
    membershipEndDate: subscription.current_period_end * 1000,
    paid: subscription.status === 'active',
    ...(subscription.canceled_at !== undefined && {
      subscriptionCanceledAt: subscription.canceled_at,
    }),
  };

  // Save subscription data to a separate collection
  await firestore.runTransaction(async (transaction) => {
    // Perform all read operations first
    const subscriptionRef = firestore
      .collection('subscriptions')
      .doc(subscriptionId);
    const subscriptionDoc = await transaction.get(subscriptionRef);

    let clientDocRef;
    let clientData;
    let state;

    if (clientid) {
      clientDocRef = firestore
        .collection('apps')
        .doc(process.env.WABA_ID!)
        .collection('clients')
        .doc(clientid);
      const clientDocSnapshot = await transaction.get(clientDocRef);
      clientData = clientDocSnapshot.data();
      state = clientData?.state;
    }

    // Now perform all write operations
    if (!subscriptionDoc.exists) {
      transaction.set(subscriptionRef, updates);
    } else {
      transaction.update(subscriptionRef, updates);
    }

    if (clientid && clientDocRef) {
      let stateJSON;
      try {
        stateJSON = state ? JSON.parse(state) : {};
      } catch (error) {
        console.error('Error parsing state:', error);
        stateJSON = {};
      }

      if (event.type === 'customer.subscription.created') {
        stateJSON.value = 'generatingModel';
        stateJSON.context.shortenedStripeLink = '';
      } else if (event.type === 'customer.subscription.deleted') {
        stateJSON.value = 'paywall';
      }

      const clientUpdates = {
        subscriptionId,
        state: JSON.stringify(stateJSON),
        paid: updates.paid,
        processing: false,
        creditsUsedToday: 0,
        creditsResetDate: DateTime.now().toMillis(),
        subscriptionStatus: updates.subscriptionStatus,
        membershipStartDate: updates.membershipStartDate,
        membershipEndDate: updates.membershipEndDate,
        lastStripeEventId: subscriptionId,
      };

      transaction.update(clientDocRef, clientUpdates);
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
    date: invoice.created * 1000,
    couponUsed: invoice?.discount?.coupon?.name || '',
  };

  console.log(
    '[stripe webhook] handleInvoiceEvent coupon used?: ',
    invoice?.discount?.coupon?.name || '',
  );

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

  let language: Language = 'english';

  // Perform all reads first
  const [subscriptionDoc, clientDoc] = await Promise.all([
    firestore.collection('subscriptions').doc(subscriptionId).get(),
    firestore
      .collection('apps')
      .doc(process.env.WABA_ID!)
      .collection('clients')
      .doc(clientid)
      .get(),
  ]);

  const clientData = clientDoc.data();
  language = clientData?.language || 'english';
  const state = clientData?.state;
  const lastStripeEventId = clientData?.lastStripeEventId;

  // Check if the event ID has already been processed
  if (lastStripeEventId === id) {
    console.log('[-] Duplicate event received, ignoring.');
    return NextResponse.json({ status: 200 });
  }

  // Now perform writes
  await firestore.runTransaction(async (transaction) => {
    const subscriptionRef = firestore
      .collection('subscriptions')
      .doc(subscriptionId);
    const clientDocRef = firestore
      .collection('apps')
      .doc(process.env.WABA_ID!)
      .collection('clients')
      .doc(clientid);

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

    stateJSON.value = 'generatingModel';

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

  // const formattedDate = format(
  //   new Date(subscriptionData!.current_period_end * 1000),
  //   'MMMM d, yyyy',
  // );

  try {
    if (status === 'complete') {
      await Promise.all([
        startGeneratingModel(clientid, language),
        sendPurchaseToFBCoversionAPI(clientid),
      ]);

      console.log(
        `Checkout session completed for clientid: ${clientid}, subscriptionId: ${subscriptionId}`,
      );
    } else {
      console.log(
        '[!] checkout session error: ',
        JSON.stringify(session, null, 2),
      );
      await sendMessageToTelegram(
        `error in session checkout ${JSON.stringify(session, null, 2)}`,
      );
    }
  } catch (error) {
    console.log(
      '[!] checkout session error: ',
      JSON.stringify(error, null, 2),
      JSON.stringify(session, null, 2),
    );
    await sendMessageToTelegram(
      `error ${JSON.stringify(error, null, 2)} in session checkout ${JSON.stringify(
        session,
        null,
        2,
      )}`,
    );
  }

  // Update all related invoices with the clientid
  // Fetch all related invoices with the clientid
  const invoicesSnapshot = await firestore
    .collection('invoices')
    .where('subscriptionId', '==', subscriptionId)
    .get();

  if (invoicesSnapshot.empty) {
    // No invoices found, send an error message to Telegram
    await sendMessageToTelegram(
      `Error: No invoices found for clientid ${clientid} with subscriptionId ${subscriptionId}`,
    );
  } else {
    const batch = firestore.batch();
    invoicesSnapshot.docs.forEach((doc) => {
      console.log(
        `[stripe webhook] client id ${clientid} updated in invoice ${doc.ref}`,
      );
      batch.update(doc.ref, { clientid });
    });
    await batch.commit();
  }

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
      case 'customer.subscription.resumed':
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
