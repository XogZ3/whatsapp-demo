/* eslint-disable no-await-in-loop */
import { format } from 'date-fns';
import type { NextRequest } from 'next/server';

import firebase from '@/modules/firebase';
import { getCronImagePromptFromGroq } from '@/modules/groq';
import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
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

async function getAgeGenderForClientidArray(clientidArray: string[]) {
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

    const { age, gender } = clientData.data() || {};
    return { clientid, age, gender };
  });

  return Promise.all(promises);
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

  if (token !== 'f8780122520f') {
    return new Response('Invalid token', { status: 402, headers: corsHeaders });
  }

  const body = await request.text();
  const data = JSON.parse(body);
  const { requestedAt, location } = data;

  if (!requestedAt) {
    return new Response('Missing required fields', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const formattedDate = format(new Date(requestedAt), 'MMMM d, yyyy');
  console.log(`CRON triggered at ${formattedDate} ${requestedAt}`);

  const clientidArray = ['918754535859', '918056977300']; // FIXME: Replace with actual client IDs as needed
  let clientDataArray;

  try {
    clientDataArray = await getAgeGenderForClientidArray(clientidArray);
  } catch (error) {
    console.error('Error fetching client data:', error);
    return new Response('Failed to fetch client data', {
      status: 500,
      headers: corsHeaders,
    });
  }

  const clientGeneratedImageMap: Record<string, string[]> = {};
  let prompt;
  try {
    await Promise.all(
      clientDataArray.map(async ({ clientid, age, gender }) => {
        prompt = await getCronImagePromptFromGroq({ age, gender, location });
        console.log(`[?] today's client ${clientid} prompt: `, prompt);
        const imagesForClient =
          await generateImagesWithReplicateUploadToFirebase(prompt, clientid);
        clientGeneratedImageMap[clientid] = imagesForClient;
      }),
    );
  } catch (error) {
    console.error('Error generating images:', error);
    return new Response('Failed to generate images', {
      status: 500,
      headers: corsHeaders,
    });
  }

  console.log('[+] received URLs: ', clientGeneratedImageMap);

  const delay = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  const rateLimit = 5000; // 1 second between messages

  const sendMessages = async () => {
    for (const [clientid, urls] of Object.entries(clientGeneratedImageMap)) {
      for (const url of urls) {
        const payload: ICreateMessagePayload = {
          phoneNumber: clientid,
          image: true,
          imageLink: url,
          imageCaption: location,
        };

        try {
          await sendMessageToWhatsapp(payload);
          console.log(`Message sent to ${clientid}`);
        } catch (error) {
          console.error(`Error sending message to ${clientid}:`, error);
        }

        // Wait for the specified delay before sending the next message
        await delay(rateLimit);
      }
    }
  };

  await sendMessages();

  console.log('All images sent successfully.');
  return new Response('success', { status: 200, headers: corsHeaders });
}
