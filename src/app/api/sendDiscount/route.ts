/* eslint-disable no-await-in-loop */
import { format } from 'date-fns';
import { DateTime } from 'luxon';
import type { NextRequest } from 'next/server';
import { setTimeout } from 'timers/promises';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';

const firestore = firebase.getFirestore();
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function sendDiscountMessages(
  clientDataArray: Array<{ id: string; language?: string }>,
) {
  const successfulClients: string[] = [];
  const delayBetweenMessages = 2000; // 1 second delay, adjust as needed

  for (const { id: clientid, language = 'english' } of clientDataArray) {
    try {
      const languageCode = language === 'portuguese' ? 'pt_BR' : 'en';
      const templateName =
        languageCode === 'pt_BR'
          ? 'fotolabs_retireve_newusers_pt'
          : 'fotolabs_retireve_newusers_en';

      const paymentConfirmationPayload: ICreateMessagePayload = {
        phoneNumber: clientid,
        template: true,
        templateName,
        templateLanguageCode: languageCode,
      };

      await sendMessageToWhatsapp(paymentConfirmationPayload);
      console.log(`Message sent successfully to ${clientid}`);
      successfulClients.push(clientid);

      // Add delay before sending the next message
      await setTimeout(delayBetweenMessages);
    } catch (error) {
      console.error(`Error sending message to ${clientid}:`, error);
    }
  }

  return successfulClients;
}

export async function POST(request: NextRequest) {
  // Handle CORS preflight request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new Response('Missing token', { status: 401, headers: corsHeaders });
  }

  if (token !== 'f8780173520f') {
    return new Response('Invalid token', { status: 402, headers: corsHeaders });
  }

  const body = await request.text();
  const data = JSON.parse(body);
  const { requestedAt } = data;

  if (!requestedAt) {
    return new Response('Missing required fields', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const formattedDate = format(new Date(requestedAt), 'MMMM d, yyyy');
  console.log(`[s] sendDiscount triggered at ${formattedDate} ${requestedAt}`);
  const wabaId = process.env.WABA_ID as string;

  const now = DateTime.now().toMillis();
  console.log(`Current timestamp: ${now}`);

  const clientRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients');

  const snapshot = await clientRef.get();
  console.log(`Number of documents found: ${snapshot.size}`);

  const clientsWithPaidFalse = snapshot.docs
    .filter((doc) => doc.data().paid === false)
    .map((doc) => ({ id: doc.id, language: doc.data().language }));

  const clientsWithMissingPaid = snapshot.docs
    .filter((doc) => !Object.prototype.hasOwnProperty.call(doc.data(), 'paid'))
    .map((doc) => ({ id: doc.id, language: doc.data().language }));

  console.log(`Clients with paid=false: ${clientsWithPaidFalse.length}`);
  console.log(
    `Clients with missing paid field: ${clientsWithMissingPaid.length}`,
  );

  const eligibleClients = [
    ...new Set([...clientsWithPaidFalse, ...clientsWithMissingPaid]),
  ];
  console.log(
    `Number of eligible clients after deduplication: ${eligibleClients.length}`,
  );

  const successfulClients = await sendDiscountMessages(eligibleClients);

  const batch = firestore.batch();
  successfulClients.forEach((clientid) => {
    const clientDocRef = clientRef.doc(clientid);
    batch.update(clientDocRef, {
      discountSent: true,
      paywallSentTimestamp: DateTime.now().toMillis(),
    });
  });
  await batch.commit();

  return new Response(
    JSON.stringify({
      success: true,
      updatedClients: successfulClients.length,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
