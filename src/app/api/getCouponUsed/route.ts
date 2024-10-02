import { NextResponse } from 'next/server';

import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const clientid = searchParams.get('clientid');

  if (!clientid) {
    return NextResponse.json({ error: 'Missing parameter' }, { status: 400 });
  }

  try {
    const invoiceRef = firestore.collection('invoices');

    const query = invoiceRef
      .where('clientid', '==', clientid)
      .orderBy('date', 'desc')
      .limit(1);

    const snapshot = await query.get();

    if (snapshot.empty) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    const doc = snapshot.docs[0];
    const data = doc?.data();

    if (!data?.couponUsed) {
      return NextResponse.json(
        { error: 'couponUsed not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ couponUsed: data.couponUsed }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
