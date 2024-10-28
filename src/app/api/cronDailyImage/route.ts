/* eslint-disable no-await-in-loop */
import { format } from 'date-fns';
import { DateTime } from 'luxon';
import type { NextRequest } from 'next/server';

import firebase from '@/modules/firebase';
import { generateImagesWithReplicateUploadToFirebase } from '@/modules/replicate';
import { sendMessageToWhatsapp } from '@/modules/whatsapp/whatsapp';
import { getEligibleClientidArray } from '@/utils/ReplyHelper/FirebaseHelpers';

const firestore = firebase.getFirestore();
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Add type definition for client data
interface ClientData {
  clientid: string;
  age: number;
  gender: string;
  whatsappExpiration: number;
}

// Add better error handling and typing to getAgeGenderForClientidArray
async function getAgeGenderForClientidArray(
  clientidArray: string[],
): Promise<ClientData[]> {
  const wabaId = process.env.WABA_ID;
  if (!wabaId) throw new Error('WABA_ID environment variable is not set');

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

// Improve sendDailyImageTemplate with proper typing
async function sendDailyImageTemplate(
  clientid: string,
  imageURL: string,
  caption: string,
): Promise<void> {
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
  try {
    // Move token validation to a separate constant
    const VALID_TOKEN = 'f8780122520f';

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
      return new Response('Missing token', {
        status: 401,
        headers: corsHeaders,
      });
    }

    if (token !== VALID_TOKEN) {
      return new Response('Unauthorized', {
        status: 403,
        headers: corsHeaders,
      }); // Changed from 402 to 403
    }

    // Add input validation
    const body = await request.json(); // Use .json() instead of .text() + JSON.parse
    const { requestedAt, locationJson } = body;

    if (!requestedAt || !locationJson?.location || !locationJson?.prompt) {
      return new Response('Missing required fields', {
        status: 400,
        headers: corsHeaders,
      });
    }

    const formattedDate = format(new Date(requestedAt), 'MMMM d, yyyy');
    console.log(`[s] dailyCRON triggered at ${formattedDate} ${requestedAt}`);
    console.log(`locationJson: ${JSON.stringify(locationJson, null, 2)}`);

    const { prompt } = locationJson;

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
      for (const clientData of clientDataArray) {
        const { clientid, whatsappExpiration } = clientData;
        const images = clientGeneratedImageMap[clientid] || [];

        if (!images.length) {
          console.warn(`No images generated for client: ${clientid}`);
          // eslint-disable-next-line no-continue
          continue;
        }

        const now = DateTime.now().toMillis();

        for (const url of images) {
          try {
            if (now >= whatsappExpiration) {
              await sendDailyImageTemplate(
                clientid,
                url,
                locationJson.location,
              );
            } else {
              await sendMessageToWhatsapp({
                phoneNumber: clientid,
                image: true,
                imageLink: url,
                imageCaption: locationJson.location,
              });
            }
            await delay(rateLimit);
          } catch (error) {
            console.error(`Error sending message to ${clientid}:`, error);
            // Continue with next image instead of breaking the entire loop
          }
        }
      }
    };

    await sendMessages();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
