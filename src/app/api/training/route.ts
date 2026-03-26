import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { createStripeLink } from '@/modules/xstate/whatsappMachine/actionsHelper';
import type { UserFieldsFirebase } from '@/utils/ReplyHelper/FirebaseHelpers';
import { generateAndSendModelImages } from '@/utils/sendSampleImages';
import { sendMessageToTelegram } from '@/utils/telegram';
import { getTranslation, type Language } from '@/utils/translations';

const firestore = firebase.getFirestore();

async function sendNewUserPaywall({
  clientid,
  language,
  stripeLink,
}: {
  clientid: string;
  language: Language;
  stripeLink: string;
}) {
  const message = `${getTranslation('new user paywall', language)}

${stripeLink}`;

  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };
  await sendMessageToWhatsapp(payload);
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return new Response('Missing token', { status: 401 });
    }

    const body = await request.text();
    const data = JSON.parse(body);
    const { clientid, loraURL, loraFilename } = data;

    if (!clientid || !loraURL || !loraFilename) {
      return new Response('Missing required fields', { status: 400 });
    }

    const wabaId = process.env.WABA_ID;
    const clientDoc = firestore
      .collection('apps')
      .doc(wabaId as string)
      .collection('clients')
      .doc(clientid);

    const clientData = await clientDoc.get();
    const { age, gender, language, trainingToken } = clientData.data() || {};

    console.log('expectedToken', trainingToken);

    const stateJSON = {
      status: 'stopped',
      context: {
        language: language || 'english',
        modelGenerated: true,
      },
      value: 'paywall',
      children: {},
      historyValue: {},
      tags: [],
    };

    // Token validation
    if (token === trainingToken) {
      // Hard transition xstate
      const updates: Partial<UserFieldsFirebase> = {
        state: JSON.stringify(stateJSON),
        loraURL,
        loraFilename,
        processing: false,
      };
      await clientDoc.set(updates, { merge: true });

      generateAndSendModelImages({
        age,
        gender,
        loraFilename,
        clientid,
        language,
      })
        .then(async () => {
          const stripeLink = await createStripeLink(clientid);
          await sendNewUserPaywall({ clientid, language, stripeLink });
        })
        .catch(async (error) => {
          console.error(
            'Error in api/training/route.ts',
            JSON.stringify(error, null, 2),
          );
          await sendMessageToTelegram(
            `${clientid}: Error in api/training/route.ts: ${JSON.stringify(error, null, 2)}`,
          );
        });

      return new Response('success', { status: 200 });
    }
    return new Response('Invalid token', { status: 401 });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// {"status":"stopped","context":{"modelGenerated":true,"message":"photo received","latestPrompt":"","latestImprovedPrompt":"","language":"english"},"value":"paywall","children":{},"historyValue":{},"tags":[]}
