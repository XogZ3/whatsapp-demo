// import { format } from 'date-fns';
// import { DateTime } from 'luxon';

// import type { CheckoutSessionCompletedEvent } from '@/app/api/stripe/webhook/types';
// import firebase from '@/modules/firebase';
// import {
//   type ICreateMessagePayload,
//   sendMessageToWhatsapp,
// } from '@/modules/whatsapp/whatsapp';

// import { sendPurchaseToFBCoversionAPI } from './fconversionHelper';
// import {
//   getUserFields,
//   type UserFieldsFirebase,
// } from './ReplyHelper/FirebaseHelpers';
// import { sendPromptingInstruction } from './sendSampleImages';
// import { getTranslation } from './translations';

// const firestore = firebase.getFirestore();

// export async function saveStripeEvent(event: any) {
//   try {
//     console.log('[+] attempting to save stripe event type: ', event.type);
//     const { clientid } = event.data.object.metadata;

//     const clientDocRef = firestore.collection('stripe_events').doc(clientid);
//     const eventCollectionRef = clientDocRef.collection('events').doc();

//     const updates = {
//       lastupdatedat: event.created,
//       type: event.type,
//     };

//     await firestore.runTransaction(async (transaction) => {
//       transaction.set(eventCollectionRef, event);
//       transaction.set(clientDocRef, updates, { merge: true });
//     });

//     console.log(`Stripe event saved for client ID: ${clientid}`);
//   } catch (error) {
//     console.error('Error saving Stripe event to Firestore:', error);
//   }
// }

// export async function updateBilling(
//   clientid: string,
//   eventId: string,
//   endDate: number,
// ) {
//   const wabaId = process.env.WABA_ID!;
//   const clientDoc = firestore
//     .collection('apps')
//     .doc(wabaId)
//     .collection('clients')
//     .doc(clientid);

//   const clientData = await clientDoc.get();
//   const { language = 'english' } = clientData.data() || {};

//   const stateJSON = {
//     status: 'stopped',
//     context: {
//       language: language || 'english',
//       modelGenerated: true,
//     },
//     value: 'imagesIncomplete',
//     children: {},
//     historyValue: {},
//     tags: [],
//   };

//   const startDate = DateTime.now().toMillis();

//   const updates: Partial<UserFieldsFirebase> = {
//     state: JSON.stringify(stateJSON),
//     paid: true,
//     processing: false,
//     creditsUsedToday: 0,
//     creditsResetDate: DateTime.now().toMillis(),
//     membershipStartDate: startDate,
//     membershipEndDate: endDate,
//     lastStripeEventId: eventId, // Store the last processed event ID
//   };

//   await clientDoc.set(updates, { merge: true });
//   console.log('[+] firebase billing updated');
// }

// export async function handleCompletedCheckoutSession(
//   event: CheckoutSessionCompletedEvent,
// ) {
//   const { clientid } = event.data.object.metadata;
//   const { id, status } = event.data.object;

//   const { language = 'english', lastStripeEventId } =
//     await getUserFields(clientid);

//   if (status !== 'complete') {
//     console.error('[-] stripe checkout status: ', status);
//     return;
//   }

//   // Check if the event ID has already been processed
//   if (lastStripeEventId === id) {
//     console.log('[-] Duplicate event received, ignoring.');
//     return;
//   }

//   const currentTimestamp = DateTime.now().toMillis();

//   console.log('[+] stripe checkout status: ', status);

//   const endDate = DateTime.fromMillis(currentTimestamp)
//     .plus({ days: 30 })
//     .toMillis();

//   await updateBilling(clientid, id, endDate);

//   const formattedDate = format(new Date(endDate), 'MMMM d, yyyy');
//   const message = `${getTranslation('payment confirmation', language)} ${formattedDate}`;
//   const payload: ICreateMessagePayload = {
//     phoneNumber: clientid,
//     text: true,
//     msgBody: message,
//   };
//   await sendMessageToWhatsapp(payload);

//   await sendPromptingInstruction(clientid, language);

//   await sendPurchaseToFBCoversionAPI(clientid);
// }
