import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const wamid = decodeURIComponent(searchParams.get('wamid') || '');
  const clientid = searchParams.get('clientid');

  if (!wamid || !clientid) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  }

  const messagesRef = firestore
    .collection('apps')
    .doc('105535119086690')
    .collection('clients')
    .doc(clientid)
    .collection('messages');

  const query = messagesRef.where('whatsappMessageID', '==', wamid);

  const snapshot = await query.get();

  if (snapshot.empty) {
    return NextResponse.json({ error: 'document not found' }, { status: 404 });
  }

  // Since you expect only one result, get the first document
  const doc = snapshot.docs[0];
  const data = doc?.data();

  const seed = data?.seed;

  if (!seed) {
    return NextResponse.json({ error: 'seed not found' }, { status: 404 });
  }

  return NextResponse.json({ seed }, { status: 200 });
}
