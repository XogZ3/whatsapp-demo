import { DateTime } from 'luxon';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  const wabaId = process.env.WABA_ID as string;

  const now = DateTime.now().toMillis();
  console.log(`Current timestamp: ${now}`);

  const clientRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients');

  const snapshot = await clientRef.get();
  console.log(`Number of documents found: ${snapshot.size}`);

  // Get today's start timestamp in milliseconds
  const todayStart = DateTime.now()
    .setZone('Asia/Dubai')
    .startOf('day')
    .toMillis();
  console.log(`Today's start timestamp in Dubai time: ${todayStart}`);
  // 1729535400000

  // Add detailed logging
  let totalChecked = 0;
  let firstMessageToday = 0;
  let firstMessageTodayAndEnoughPhotos = 0;

  // Filter and count clients
  const qualifiedClients = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      totalChecked += 1;

      const hasEnoughPhotos = (data.photosUploaded ?? 0) >= 5;

      // Get the earliest message timestamp
      const messagesRef = doc.ref.collection('messages');
      const earliestMessage = await messagesRef
        .orderBy('timestamp', 'asc')
        .limit(1)
        .get();
      const earliestTimestamp = earliestMessage.empty
        ? null
        : earliestMessage.docs[0]?.data().timestamp;

      const isFirstMessageToday =
        earliestTimestamp && earliestTimestamp > todayStart;
      if (isFirstMessageToday) firstMessageToday += 1;

      const isQualified = isFirstMessageToday && hasEnoughPhotos;
      if (isQualified) firstMessageTodayAndEnoughPhotos += 1;

      console.log(
        `Client ${doc.id}: photosUploaded=${data.photosUploaded ?? 0}, earliestMessageTimestamp=${earliestTimestamp}, isFirstMessageToday=${isFirstMessageToday}, hasEnoughPhotos=${hasEnoughPhotos}, isQualified=${isQualified}`,
      );

      return {
        id: doc.id,
        isQualified,
        earliestMessageTimestamp: earliestTimestamp,
      };
    }),
  );

  const qualifiedClientCount = qualifiedClients.filter(
    (client) => client.isQualified,
  ).length;
  const qualifiedClientIds = qualifiedClients
    .filter((client) => client.isQualified)
    .map((client) => client.id);

  console.log(`Total clients checked: ${totalChecked}`);
  console.log(`Clients with first message today: ${firstMessageToday}`);
  console.log(
    `Qualified clients (first message today and 5+ photos): ${firstMessageTodayAndEnoughPhotos}`,
  );

  // Return the result
  return new Response(
    JSON.stringify({ qualifiedClientCount, qualifiedClientIds }),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}
