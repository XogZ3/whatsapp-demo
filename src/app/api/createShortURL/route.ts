import { DateTime } from 'luxon';
import { customAlphabet } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { getBaseUrl } from '@/utils/helpers';

const firestore = firebase.getFirestore();

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const { clientid, longURL } = JSON.parse(rawBody);

  if (!clientid || !longURL) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  }

  const nanoid = customAlphabet(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
    8,
  );

  let shortCode;
  let shortURL;

  // Generate a unique shortCode
  let isUnique = false;
  while (!isUnique) {
    shortCode = nanoid();
    shortURL = `${getBaseUrl()}/buy/${shortCode}`;

    // Check if the shortCode already exists in Firestore
    const urlMapDoc = firestore.collection('short_url_map').doc(shortCode);
    // eslint-disable-next-line no-await-in-loop
    const urlMapData = await urlMapDoc.get();

    isUnique = !urlMapData.exists;
  }

  try {
    const updates = {
      longURL,
      shortURL,
      clientid,
      createdAt: DateTime.now().toMillis(),
    };
    await firestore
      .collection('short_url_map')
      .doc(shortCode!)
      .set(updates, { merge: true });
    return NextResponse.json({ shortURL }, { status: 200 });
  } catch (error) {
    console.error('error: ', JSON.stringify(error, null, 2));
    return NextResponse.json({ error }, { status: 400 });
  }
}
