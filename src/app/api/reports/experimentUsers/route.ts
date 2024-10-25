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

  const experimentDocs = snapshot.docs.filter((doc) => {
    const data = doc.data();
    return data.isExperiment === true;
  });

  console.log(`Number of experiment documents: ${experimentDocs.length}`);

  const experimentClientidArray = experimentDocs.map((doc) => doc.id);
  console.log(`Experiment clientids: ${experimentClientidArray.length}`);

  return new Response(
    JSON.stringify({
      success: true,
      experimentClientCount: experimentClientidArray.length,
      experimentClientids: experimentClientidArray,
    }),
    {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    },
  );
}
