import firebase from '@/modules/firebase';

const firestore = firebase.getFirestore();

export async function setLatestMessage(
  clientid: string,
  message: any,
): Promise<void> {
  const wabaId = process.env.WABA_ID;
  const clientDoc = firestore
    .collection('apps')
    .doc(wabaId as string)
    .collection('clients')
    .doc(clientid);
  const updates: any = { latestmsg: message };
  await clientDoc.set(updates, { merge: true });
}
