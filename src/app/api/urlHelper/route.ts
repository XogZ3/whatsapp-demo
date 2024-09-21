import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shortCode = searchParams.get('shortCode');

  if (!shortCode) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  }

  const urlMapDoc = firestore.collection('short_url_map').doc(shortCode);
  const urlMapData = await urlMapDoc.get();

  if (!urlMapData.exists) {
    // Correct existence check
    console.error('[!] shortURL not found in map');
    return NextResponse.json({ error: 'shortURL not found' }, { status: 404 });
  }

  const { longURL } = urlMapData.data() || {};

  if (!longURL) {
    return NextResponse.json({ error: 'longURL not found' }, { status: 404 });
  }

  return NextResponse.json({ longURL }, { status: 200 });
}
