import * as admin from 'firebase-admin';

import firebase from '@/modules/firebase';
import { makeRequestToWhatsapp } from '@/modules/whatsapp/whatsapp';

const firestore = firebase.getFirestore();

function createMessagePayload(
  msgtype: string,
  message_id: string,
  recipient_id: any,
  phoneId: any,
  display_phone_number: any,
  msg: string,
) {
  // handle template messages separately
  if (msgtype !== 'text' && msgtype !== 'image' && msgtype !== 'sticker')
    return;
  const timestamp = Date.now();
  const type = 'message';
  const clientid = recipient_id;
  const message: any = {
    from: display_phone_number,
    id: message_id,
    timestamp: Math.floor(Date.now() / 1000),
    type: msgtype,
  };
  if (msgtype === 'text') message.text = { body: msg };
  if (msgtype === 'image') message.image = { url: msg };
  if (msgtype === 'sticker') message.image = { url: msg };

  // eslint-disable-next-line consistent-return
  return {
    timestamp,
    type,
    clientid,
    messaging_product: 'whatsapp',
    metadata: {
      display_phone_number,
      phone_number_id: phoneId,
    },
    // status messages
    status_raw: null,
    pricing: null,
    status: null,
    origin: null,
    // message
    message,
    contact: {
      wa_id: clientid,
    },
    // error
    error: null,
  };
}
export async function saveMessageToDB(
  msgtype: string,
  message_id: string,
  recipient_id: any,
  phoneId: any,
  msg: string,
) {
  const wabaId = process.env.WABA_ID;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const display_phone_number = process.env.PHONE_NUMBER;
  const messageObject = createMessagePayload(
    msgtype,
    message_id,
    recipient_id,
    phoneId,
    display_phone_number,
    msg,
  );
  if (messageObject && messageObject.clientid && messageObject.timestamp) {
    const clientDoc = firestore
      .collection('apps')
      .doc(wabaId as string)
      .collection('clients')
      .doc(messageObject.clientid);
    await clientDoc.collection('messages').add(messageObject);

    // make updates to the profile
    const updates: any = { lastupdatedat: messageObject.timestamp };
    await clientDoc.set(updates, { merge: true });
  }
}
export async function saveCreditsUsed(clientid: any) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  // make updates to the profile
  const updates: any = { creditsused: admin.firestore.FieldValue.increment(1) };
  await clientDoc.set(updates, { merge: true });
}

export async function checkCredits(clientid: any) {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);

  const updates: any = { creditstotal: 100 };
  await clientDoc.set(updates, { merge: true });

  const creditsUsed = await (await clientDoc.get()).data()?.creditsused;
  if (creditsUsed > updates.creditstotal) {
    return false;
  }
  return true;
  // make updates to the profile
}

export async function sendIndividualMessageToWhatsapp(
  phoneNumber: any,
  message: string,
) {
  const data = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneNumber,
    type: 'text',
    text: {
      preview_url: false,
      body: message,
    },
  };
  const res = await makeRequestToWhatsapp(data);
  if (res) return true;
  // if (res?.data?.messages?.length) {
  //   // await saveMessageToDB(
  //   //   'text',
  //   //   res?.data?.messages[0].id,
  //   //   res?.data?.contacts[0].wa_id,
  //   //   process.env.PHONE_ID,
  //   //   message
  //   // );
  //   return res && res.status === 200;
  // }
  return null;
}

export async function sendQuickReplyMessageToWhatsapp(
  phoneNumber: any,
  message: string,
  button1: string,
  button2: string,
) {
  const data = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phoneNumber,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: {
        text: message,
      },
      action: {
        buttons: [
          {
            type: 'reply',
            reply: {
              id: 'button1',
              title: button1,
            },
          },
          {
            type: 'reply',
            reply: {
              id: 'button2',
              title: button2,
            },
          },
        ],
      },
    },
  };

  const res = await makeRequestToWhatsapp(data);
  if (res) return true;
  // if (res?.data?.messages?.length) {
  //   await saveMessageToDB(
  //     'text',
  //     res?.data?.messages[0].id,
  //     res?.data?.contacts[0].wa_id,
  //     process.env.PHONE_ID,
  //     message,
  //   );
  // }
  // return res && res.status === 200;
  return null;
}
