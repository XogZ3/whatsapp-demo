import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { getTranslation, type Language } from '@/utils/translations';

const firestore = firebase.getFirestore();

async function sendPromptingInstruction(clientid: string, language: Language) {
  const message = getTranslation('model generated request prompt', language);
  // TODO: implement language in buttons
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
    const { language, trainingToken } = clientData.data() || {};

    console.log('expectedToken', trainingToken);

    // Token validation
    if (token === trainingToken) {
      // Hard transition xstate
      const updates: any = {
        state:
          '{"status":"stopped","context":{"processing":false,"photosUploaded":15,"creditsRemaining":1},"value":"photoPrompting","children":{},"historyValue":{},"tags":[]}',
        loraURL,
        loraFilename,
      };
      await clientDoc.set(updates, { merge: true });

      await sendPromptingInstruction(clientid, language || 'english');

      return new Response('success', { status: 200 });
    }
    return new Response('Invalid token', { status: 401 });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
