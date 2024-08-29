import firebase from '@/modules/firebase';
import { DEFAULT_CREDITS } from '@/utils/constants';
import type { UserFieldsFirebase } from '@/utils/ReplyHelper/FirebaseHelpers';
import { generateAndSendModelImages } from '@/utils/sendSampleImages';

const firestore = firebase.getFirestore();

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

    const stateJSON = {
      status: 'stopped',
      context: {
        freeTrialCredits: DEFAULT_CREDITS,
        language: language || 'english',
        modelGenerated: true,
      },
      value: 'modelGeneratedFreeTrial',
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

      await generateAndSendModelImages(loraFilename, clientid, language);

      return new Response('success', { status: 200 });
    }
    return new Response('Invalid token', { status: 401 });
  } catch (error) {
    console.error('Error handling request:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// {"status":"stopped","context":{"freeTrialCredits":1,"modelGenerated":true,"message":"photo received","latestPrompt":"","latestImprovedPrompt":"","language":"english"},"value":"modelGeneratedFreeTrial","children":{},"historyValue":{},"tags":[]}
