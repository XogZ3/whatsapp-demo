import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import { getBaseUrl } from '@/utils/helpers';

const firestore = firebase.getFirestore();

class RandomStringGenerator {
  private characters: string;

  constructor() {
    this.characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  }

  generate(length: number = 6): string {
    let result = '';
    for (let i = 0; i < length; i += 1) {
      const randomIndex = Math.floor(Math.random() * this.characters.length);
      result += this.characters[randomIndex];
    }
    return result;
  }
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return new Response('Missing token', { status: 401 });
  }
  if (token !== 'ncuwegf5682rc') {
    return new Response('Invalid token', { status: 402 });
  }

  const rawBody = await req.text();
  const { clientid, longURL } = JSON.parse(rawBody);

  if (!clientid || !longURL) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  }
  const generator = new RandomStringGenerator();
  const shortCode = generator.generate(8);
  const shortURL = `${getBaseUrl()}/buy/${shortCode}`;

  try {
    const urlMapDoc = firestore.collection('short_url_map').doc(shortCode);
    const updates = {
      longURL,
      shortURL,
      clientid,
      createdAt: DateTime.now().toMillis(),
    };
    await urlMapDoc.set(updates, { merge: true });
    return NextResponse.json({ shortURL }, { status: 200 });
  } catch (error) {
    console.error('error: ', JSON.stringify(error, null, 2));
    return NextResponse.json({ error }, { status: 400 });
  }
}
