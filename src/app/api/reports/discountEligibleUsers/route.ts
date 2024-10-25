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

  const eligibleDocs = snapshot.docs.filter((doc) => {
    const data = doc.data();
    const { paid } = data;
    const stateData = data.state ? JSON.parse(data.state) : null;
    const stateValue = stateData?.value;

    return (
      !Object.prototype.hasOwnProperty.call(data, 'paid') ||
      paid === false ||
      stateValue === 'onBoarding'
    );
  });

  console.log(`Number of eligible documents: ${eligibleDocs.length}`);

  const eligibleClientidArray = eligibleDocs.map((doc) => doc.id);
  console.log(`Eligible clientids: ${eligibleClientidArray.length}`);

  return new Response(
    JSON.stringify({
      success: true,
      eligibleClientCount: eligibleClientidArray.length,
      // eligibleClientids: eligibleClientidArray,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}

// 331 eligible users
