/* eslint-disable no-console */

import crypto from 'crypto';

import firebase from '@/modules/firebase';
import { parseMessagePayload } from '@/utils/payloadParser';
import { replyToUser } from '@/utils/ReplyHelper';

const firestore = firebase.getFirestore();
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  if (mode === 'subscribe' && token === process.env.WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
  return new Response(JSON.stringify('Invalid verify_token'), { status: 403 });
}

async function processWebhook(body: any) {
  try {
    console.log('Processing webhook');
    const data = JSON.parse(body);
    console.log('Parsed body:', data);

    const subscriptionObject = data.object;
    const wabaId = data.entry[0].id;
    const { field, value: payload } = data.entry[0].changes[0];

    if (
      subscriptionObject === 'whatsapp_business_account' &&
      field === 'messages' &&
      wabaId === process.env.WABA_ID
    ) {
      const messageObject = parseMessagePayload(payload);

      if (
        messageObject.clientid &&
        messageObject.timestamp &&
        (messageObject.type === 'message' || messageObject.type === 'status')
      ) {
        const clientDoc = firestore
          .collection('apps')
          .doc(wabaId as string)
          .collection('clients')
          .doc(messageObject.clientid);

        if (messageObject.type === 'message') {
          await clientDoc.collection('messages').add(messageObject);
        }

        const updates: any = { lastupdatedat: messageObject.timestamp };
        if (messageObject.status_raw?.conversation?.expiration_timestamp) {
          updates.whatsappExpiration =
            messageObject.status_raw?.conversation?.expiration_timestamp;
        }
        if (messageObject.type === 'message') {
          updates.lastseen = messageObject.timestamp;
          if (messageObject.contact?.profile?.name) {
            updates.name = messageObject.contact?.profile?.name;
          }
        }

        await clientDoc.set(updates, { merge: true });

        console.log(
          'webhook triggered on: ',
          messageObject.type,
          messageObject.timestamp,
          messageObject.type === 'message' ? messageObject.message : '',
        );

        if (
          messageObject.type === 'message' &&
          messageObject.timestamp > Date.now() / 1000 - 180
        ) {
          await replyToUser(messageObject);
        }
      }
    }
  } catch (e) {
    console.error('Error in processWebhook:', e);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('x-hub-signature')?.toString();

  // Verify payload
  const hmac = crypto.createHmac(
    'sha1',
    process.env.FACEBOOK_APP_SECRET || 'N/A',
  );
  hmac.update(body, 'ascii');
  const expectedSignature = `sha1=${hmac.digest('hex')}`;
  console.log(
    'expectedSignature',
    expectedSignature,
    signature === expectedSignature,
  );

  // Immediately return a success response to Facebook
  const immediateResponse = new Response('success', {
    status: 200,
    headers: corsHeaders,
  });

  if (signature === expectedSignature) {
    // Process the webhook data in the background
    processWebhook(body).catch((e) => {
      console.error('Error processing webhook:', e);
    });
  } else {
    console.error('Invalid signature');
  }

  return immediateResponse; // Return immediately after verifying the signature
}
