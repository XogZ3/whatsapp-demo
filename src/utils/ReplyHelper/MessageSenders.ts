import { getFirestore } from 'firebase-admin/firestore';

import { Env } from '@/libs/Env.mjs';

export async function setLatestMessage(
  clientid: any,
  message: any,
): Promise<void> {
  const wabaId = Env.WABA_ID;
  const clientDoc = getFirestore()
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { latestmsg: message };
  await clientDoc.set(updates, { merge: true });
}
