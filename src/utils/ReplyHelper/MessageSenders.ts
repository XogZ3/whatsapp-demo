import { Env } from '@/libs/Env.mjs';

import { db } from '../Firebase';

export async function setLatestMessage(
  clientid: any,
  message: any,
): Promise<void> {
  const wabaId = Env.WABA_ID;
  const clientDoc = db
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { latestmsg: message };
  await clientDoc.set(updates, { merge: true });
}
