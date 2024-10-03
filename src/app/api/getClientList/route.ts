import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('api_key');

  // Check if the api_key is correct
  if (apiKey !== '7x3i2TvUdHPEozST') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const wabaId = process.env.WABA_ID;
    const clientList = await firestore
      .collection('apps')
      .doc(wabaId as string)
      .collection('clients')
      .orderBy('lastupdatedat', 'desc')
      .get();

    const clients = clientList.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Error getting client list:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
