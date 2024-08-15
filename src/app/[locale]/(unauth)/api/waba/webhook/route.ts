/* eslint-disable no-console */

import crypto from 'crypto';
import { getFirestore } from 'firebase-admin/firestore';

import { replyToUser } from '@/utils/ReplyHelper';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function parseMessagePayload(payload: any) {
  let timestamp = Date.now();
  if (payload.errors) timestamp = payload.errors[0].timestamp * 1e3;
  if (payload.messages) timestamp = payload.messages[0].timestamp * 1e3;
  if (payload.statuses) timestamp = payload.statuses[0].timestamp * 1e3;

  let type = 'error';
  if (payload.statuses) type = 'status';
  if (payload.messages) type = 'message';

  let clientid = null;
  if (payload.statuses) clientid = payload.statuses[0].recipient_id;
  if (payload.messages) clientid = payload.messages[0].from;

  return {
    timestamp,
    type,
    clientid,
    messaging_product: payload.messaging_product,
    metadata: payload.metadata,
    // status messages
    status_raw: payload.statuses ? payload.statuses[0] : null,
    pricing: payload.statuses ? payload.statuses[0].pricing || null : null,
    status: payload.statuses ? payload.statuses[0].status || null : null,
    origin: payload.statuses ? payload.statuses[0].origin?.type || null : null,
    // incoming message
    message: payload.messages ? payload.messages[0] : null,
    contact: payload.contacts ? payload.contacts[0] : null,
    // error
    error: payload.errors ? payload.errors[0] : null,
  };
}

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

export async function POST(request: Request) {
  console.log('request: ', JSON.stringify(request, null, 2));
  const body = await request.text();
  console.log('body: ', body);
  const url = new URL(request.url);
  const signature = url.searchParams.get('x-hub-signature')?.toString();

  // Verify payload
  const hmac = crypto.createHmac(
    'sha1',
    process.env.FACEBOOK_APP_SECRET || 'N/A',
  );
  hmac.update(body, 'ascii');
  const expectedSignature = `sha1=${hmac.digest('hex')}`;

  if (signature === expectedSignature) {
    try {
      const data = JSON.parse(body);
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
          const clientDoc = getFirestore()
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
            console.log('sending response');
            await replyToUser(messageObject);
          }
        }
      }

      return new Response('success', { status: 200, headers: corsHeaders });
    } catch (e) {
      console.error(e);
      return new Response('unable to save response', { status: 200 });
    }
  } else {
    return new Response('Invalid signature', { status: 401 });
  }
}
