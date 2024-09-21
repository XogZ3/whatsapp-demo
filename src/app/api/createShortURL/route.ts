import { DateTime } from 'luxon';
import { customAlphabet } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { getBaseUrl } from '@/utils/helpers';
import { sendMessageToTelegram } from '@/utils/telegram';

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

  const baseUrl = getBaseUrl();
  console.log('Base URL:', baseUrl);

  if (!baseUrl || !/^https?:\/\/.+/i.test(baseUrl)) {
    return NextResponse.json({ error: 'Invalid Base URL' }, { status: 400 });
  }

  // Generate a unique shortCode
  let isUnique = false;
  while (!isUnique) {
    shortCode = nanoid();
    shortURL = `${baseUrl}/buy/${shortCode}`;

    console.log('[x] checking shortCode:', shortCode);

    // Check if the shortCode already exists in Firestore
    const urlMapDoc = firestore.collection('short_url_map').doc(shortCode);
    // eslint-disable-next-line no-await-in-loop
    const urlMapData = await urlMapDoc.get();

    isUnique = !urlMapData.exists;
  }

  console.log('shortCode:', shortCode);

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
    const errorMessage = `Error during URL creation
clientid: ${clientid}
shortCode: ${shortCode}
longURL: ${longURL}
error: ${JSON.stringify(error, null, 2)}`;
    console.error('Error during URL creation: ', {
      clientid,
      shortCode,
      longURL,
      error: JSON.stringify(error, null, 2),
    });
    await sendMessageToTelegram(errorMessage);
    return NextResponse.json({ error }, { status: 400 });
  }
}
