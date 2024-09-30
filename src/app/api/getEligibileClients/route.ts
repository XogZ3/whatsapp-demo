import { DateTime } from 'luxon';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function getEligibleClientidArray() {
  const wabaId = process.env.WABA_ID as string;

  const now = DateTime.now().toMillis();

  const clientRef = firestore
    .collection('apps')
    .doc(wabaId)
    .collection('clients');

  const query = clientRef
    .where('subscriptionStatus', '==', 'active')
    .where('membershipEndDate', '>', now);

  const snapshot = await query.get();

  if (snapshot.empty) {
    return [];
  }

  // Extract the client IDs from the snapshot
  const eligibleClientIds = snapshot.docs.map((doc) => doc.id);

  return eligibleClientIds;
}

export async function GET() {
  const eligibleClientidArray = await getEligibleClientidArray();
  return new Response(JSON.stringify(eligibleClientidArray), {
    status: 200,
    headers: corsHeaders,
  });
}
