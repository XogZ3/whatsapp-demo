import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const apiKey = url.searchParams.get('api_key');
  const clientid = url.searchParams.get('clientid');
  const limit = parseInt(url.searchParams.get('limit') || '10', 10); // Default to 10 messages
  const startAfter = url.searchParams.get('startAfter'); // For pagination

  // Check missing params
  if (!apiKey || !clientid) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }
  // Check if the api_key is correct
  if (apiKey !== '7x3i2TvGokPEozST') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const wabaId = process.env.WABA_ID;
    let query = firestore
      .collection('apps')
      .doc(wabaId as string)
      .collection('clients')
      .doc(clientid)
      .collection('messages')
      .where('type', 'in', [
        'message',
        'text',
        'image',
        'template',
        'interactive',
      ])
      .where('timestamp', '>', 0)
      .orderBy('timestamp', 'desc')
      .limit(limit);

    // If startAfter is provided, use it for pagination
    if (startAfter) {
      const startAfterDoc = await firestore
        .collection('apps')
        .doc(wabaId as string)
        .collection('clients')
        .doc(clientid)
        .collection('messages')
        .doc(startAfter)
        .get();

      if (startAfterDoc.exists) {
        query = query.startAfter(startAfterDoc);
      }
    }

    const clientMessages = await query.get();

    const messages = clientMessages.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const lastMessageId =
      clientMessages?.docs && clientMessages.docs.length > 0
        ? clientMessages.docs[clientMessages.docs.length - 1]?.id
        : null;

    return NextResponse.json({ messages, lastMessageId }, { status: 200 });
  } catch (error) {
    console.error('Error getting client messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
