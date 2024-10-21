import { format } from 'date-fns';
import { DateTime } from 'luxon';
import type { NextRequest } from 'next/server';

import firebase from '@/modules/firebase';
import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';
import { getBaseUrl } from '@/utils/helpers';
import { getTranslation } from '@/utils/translations';

const firestore = firebase.getFirestore();
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getLanguageForClientidArray(clientidArray: string[]) {
  const wabaId = process.env.WABA_ID as string;

  const promises = clientidArray.map(async (clientid) => {
    const clientDoc = firestore
      .collection('apps')
      .doc(wabaId)
      .collection('clients')
      .doc(clientid);
    const clientData = await clientDoc.get();

    // Check if the document exists
    if (!clientData.exists) {
      throw new Error(`Client document not found for ID: ${clientid}`);
    }

    const { language } = clientData.data() || {};
    return { clientid, language };
  });

  return Promise.all(promises);
}

async function createCustomCoupon(clientid: string) {
  const result = await fetch(`${getBaseUrl()}/api/stripe/createCustomCoupon`, {
    method: 'POST',
    body: JSON.stringify({ clientid }),
  });
  const { coupon } = await result.json();
  return coupon;
}

async function sendDiscountMessages(clientidArray: string[]) {
  const clientDataArray = await getLanguageForClientidArray(clientidArray);

  await Promise.all(
    clientDataArray.map(async ({ clientid, language = 'english' }) => {
      const coupon = await createCustomCoupon(clientid);
      const message = `${getTranslation('discount message 1', language)} *${coupon}* ${getTranslation('discount message 2', language)}`;
      await sendMessageToWhatsapp({
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      });
    }),
  );
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
  console.log(`[s] hourCRON triggered at ${formattedDate} ${requestedAt}`);
  const wabaId = process.env.WABA_ID as string;

  const now = DateTime.now().toMillis();
  console.log(`Current timestamp: ${now}`);

  const clientRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients');

  const oneHourAgo = now - 3600000;
  console.log(`One hour ago timestamp: ${oneHourAgo}`);

  const query = clientRef
    .where('paywallSentTimestamp', '<', oneHourAgo)
    .where('discountSent', '==', false);

  const snapshot = await query.get();
  console.log(`Number of documents found: ${snapshot.size}`);

  if (snapshot.empty) {
    console.log('No matching documents found');
    return new Response(JSON.stringify({ success: true, updatedClients: 0 }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const clientidArray = snapshot.docs.map((doc) => {
    console.log(
      `Client ID: ${doc.id}, paywallSentTimestamp: ${doc.data().paywallSentTimestamp}, discountSent: ${doc.data().discountSent}`,
    );
    return doc.id;
  });

  await sendDiscountMessages(clientidArray);

  const batch = firestore.batch();
  clientidArray.forEach((clientid) => {
    const clientDocRef = clientRef.doc(clientid);
    batch.update(clientDocRef, { discountSent: true });
  });

  await batch.commit();

  return new Response(
    JSON.stringify({ success: true, updatedClients: clientidArray.length }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
