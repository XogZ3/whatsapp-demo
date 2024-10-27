/* eslint-disable no-await-in-loop */
import { format } from 'date-fns';
import { DateTime } from 'luxon';
import type { NextRequest } from 'next/server';

import firebase from '@/modules/firebase';
import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { getEligibleClientidArray } from '@/utils/ReplyHelper/FirebaseHelpers';

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

    const { age, gender, whatsappExpiration } = clientData.data() || {};
    return { clientid, age, gender, whatsappExpiration };
  });

  return Promise.all(promises);
}

async function sendDailyImageTemplate(
  clientid: string,
  imageURL: string,
  caption: string,
) {
  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: clientid,
    type: 'template',
    template: {
      name: 'fotolabs_daily_image',
      language: {
        code: 'en',
      },
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                link: imageURL,
              },
            },
          ],
        },
        {
          type: 'body',
          parameters: [
            {
              type: 'text',
              text: caption,
            },
          ],
        },
      ],
    },
  };
  await sendMessageToWhatsapp(payload);
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
  const { requestedAt, locationJson } = data;

  if (!requestedAt || !locationJson) {
    return new Response('Missing required fields', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const formattedDate = format(new Date(requestedAt), 'MMMM d, yyyy');
  console.log(`[s] dailyCRON triggered at ${formattedDate} ${requestedAt}`);
  console.log(`locationJson: ${JSON.stringify(locationJson, null, 2)}`);

  const { location, prompt } = locationJson;

  const clientidArray = await getEligibleClientidArray();
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

  try {
    await Promise.all(
      clientDataArray.map(async ({ clientid, age, gender }) => {
        const clientPrompt = `a realistic photograph of ${age} year old ${gender}, ${prompt}`;
        const imagesForClient =
          await generateImagesWithReplicateUploadToFirebase(
            clientPrompt,
            clientid,
          );
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

  const delay = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  const rateLimit = 5000; // 1 second between messages

  const sendMessages = async () => {
    for (const { clientid, whatsappExpiration } of clientDataArray) {
      const now = DateTime.now().toMillis();

      for (const url of clientGeneratedImageMap[clientid] || []) {
        const payload: ICreateMessagePayload = {
          phoneNumber: clientid,
          image: true,
          imageLink: url,
          imageCaption: location,
        };

        try {
          if (now >= whatsappExpiration) {
            await sendDailyImageTemplate(clientid, url, location);
          } else {
            await sendMessageToWhatsapp(payload);
          }
        } catch (error) {
          console.error(`Error sending message to ${clientid}:`, error);
        }

        await delay(rateLimit);
      }
    }
  };

  await sendMessages();

  console.log('All images sent successfully.');
  return new Response('success', { status: 200, headers: corsHeaders });
}
