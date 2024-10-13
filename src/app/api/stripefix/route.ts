import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { secret } = JSON.parse(rawBody);

  if (!secret) {
    return NextResponse.json({ error: 'Missing secret' }, { status: 400 });
  }

  if (secret !== 'bobthebuilder') {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  try {
    const shortUrlCollection = firestore.collection('short_url_map');
    const snapshot = await shortUrlCollection.get();

    const updatePromises = snapshot.docs.map(async (doc) => {
      const data = doc.data();
      if (data.longURL && data.longURL.includes('buy.fotolabs.ai')) {
        const updatedLongURL = data.longURL.replace(
          'buy.fotolabs.ai/b',
          'buy.stripe.com',
        );
        await doc.ref.update({ longURL: updatedLongURL });
        return { id: doc.id, oldURL: data.longURL, newURL: updatedLongURL };
      }
      return null;
    });

    const updatedDocs = (await Promise.all(updatePromises)).filter(Boolean);

    return NextResponse.json({ updatedDocs }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
