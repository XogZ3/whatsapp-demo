/* eslint-disable no-await-in-loop */
import { format } from 'date-fns';
import { DateTime } from 'luxon';
import type { NextRequest } from 'next/server';

import firebase from '@/modules/firebase';
import { getCronDailyImagePromptFromGroq } from '@/modules/groq';
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

    const { age, gender, whatsappExpiration } = clientData.data() || {};
    return { clientid, age, gender, whatsappExpiration };
  });

  return Promise.all(promises);
}

function fillPrompt(prompt: string, age: number, gender: 'male' | 'female') {
  // Replace placeholders with the provided values
  const genderHeShe = gender === 'male' ? 'he' : 'she';
  const genderHisHer = gender === 'male' ? 'his' : 'her';
  const genderManWoman = gender === 'male' ? 'man' : 'woman';

  // Replace placeholders in the prompt
  return prompt
    .replace(/PERSON_Age/g, age.toString())
    .replace(/PERSON_GENDER_HeShe/g, genderHeShe)
    .replace(/PERSON_GENDER_He/g, genderHeShe)
    .replace(/PERSON_GENDER_She/g, genderHeShe)
    .replace(/PERSON_GENDER_HisHer/g, genderHisHer)
    .replace(/PERSON_GENDER_Her/g, genderHisHer)
    .replace(/PERSON_GENDER_Her/g, genderHisHer)
    .replace(/PERSON_GENDER_ManWoman/g, genderManWoman)
    .replace(/PERSON_GENDER_Woman/g, genderManWoman)
    .replace(/PERSON_GENDER_Man/g, genderManWoman);
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
  const { requestedAt, location } = data;

  if (!requestedAt) {
    return new Response('Missing required fields', {
      status: 400,
      headers: corsHeaders,
    });
  }

  const formattedDate = format(new Date(requestedAt), 'MMMM d, yyyy');
  console.log(`CRON triggered at ${formattedDate} ${requestedAt}`);

  let promptTemplate;
  try {
    promptTemplate = await getCronDailyImagePromptFromGroq({ location });
    console.log(`[?] today's promptTemplate: `, promptTemplate);
  } catch (error) {
    console.error('Error fetching prompt template:', error);
    return new Response('Failed to fetch prompt template', {
      status: 500,
      headers: corsHeaders,
    });
  }

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

  try {
    await Promise.all(
      clientDataArray.map(async ({ clientid, age, gender }) => {
        const clientPrompt = fillPrompt(promptTemplate, age, gender);
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

  console.log('[+] received URLs: ', clientGeneratedImageMap);

  const delay = (ms: number) =>
    new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  const rateLimit = 5000; // 1 second between messages

  const sendMessages = async () => {
    for (const { clientid, whatsappExpiration } of clientDataArray) {
      const now = DateTime.now().toMillis(); // Get the current time in milliseconds

      for (const url of clientGeneratedImageMap[clientid] || []) {
        const payload: ICreateMessagePayload = {
          phoneNumber: clientid,
          image: true,
          imageLink: url,
          imageCaption: location,
        };

        try {
          // Check if the current time is after the whatsappExpiration
          if (now >= whatsappExpiration) {
            console.log(`Sending template message to ${clientid}`);
            await sendDailyImageTemplate(clientid, url, location); // Use sendDailyImageTemplate if expired
          } else {
            console.log(`Sending regular message to ${clientid}`);
            await sendMessageToWhatsapp(payload); // Use sendMessageToWhatsapp if not expired
          }
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
