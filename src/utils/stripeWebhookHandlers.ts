import type { CheckoutSessionCompletedEvent } from '@/app/api/stripe/webhook/types';
import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  makeRequestToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

import { DEFAULT_CREDITS } from './constants';
import { getUserFields } from './ReplyHelper/FirebaseHelpers';
import { sendPromptingInstruction } from './sendSampleImages';
import { getTranslation } from './translations';

const firestore = firebase.getFirestore();

export async function saveStripeEvent(event: any) {
  const eventObject = JSON.parse(event);
  const clientDoc = firestore.collection('stripe_events');

  await clientDoc.add(eventObject);
}

export async function updateBilling(clientid: string) {
  const wabaId = process.env.WABA_ID!;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients')
    .doc(clientid);

  const clientData = await clientDoc.get();
  const { language = 'english' } = clientData.data() || {};

  const stateJSON = {
    status: 'stopped',
    context: {
      creditsRemaining: DEFAULT_CREDITS,
      language: language || 'english',
      modelGenerated: true,
    },
    value: 'wipPhotoPrompting',
    children: {},
    historyValue: {},
    tags: [],
  };

  const updates: any = {
    state: JSON.stringify(stateJSON),
  };
  await clientDoc.set(updates, { merge: true });
}

export async function handleCompletedCheckoutSession(
  event: CheckoutSessionCompletedEvent,
) {
  const { clientid } = event.data.object.metadata;
  const { status } = event.data.object;

  const { language = 'english' } = await getUserFields(clientid);

  if (status !== 'complete') {
    console.log('[-] current status: ', status);
  }

  if (status === 'complete') {
    console.log('[+] payment status: ', status);

    await updateBilling(clientid);

    const message = getTranslation('payment confirmation', language);
    const payload: ICreateMessagePayload = {
      phoneNumber: clientid,
      text: true,
      msgBody: message,
    };
    await makeRequestToWhatsapp(payload);

    await sendPromptingInstruction(clientid, language);
  }
}
