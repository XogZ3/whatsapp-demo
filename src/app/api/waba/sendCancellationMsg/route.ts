import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import { sendWhatsappRefreshTemplate } from '@/modules/xstate/whatsappMachine/actionsHelper';
import {
  getUserFields,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { getTranslation } from '@/utils/translations';

const firestore = firebase.getFirestore();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientid = searchParams.get('clientid');
  if (!clientid)
    return NextResponse.json({ error: 'clientid not found' }, { status: 404 });

  try {
    const wabaId = process.env.WABA_ID;
    const clientDoc = firestore
      .collection('apps')
      .doc(wabaId as string)
      .collection('clients')
      .doc(clientid!);

    const {
      language,
      membershipEndDate,
      state,
      subscriptionId,
      whatsappExpiration,
      lastCancellationReqTime = 0,
    } = await getUserFields(clientid!);

    if (!subscriptionId)
      return NextResponse.json(
        { error: 'subscriptions not found' },
        { status: 404 },
      );

    const currentTime = DateTime.now(); // Current time as a DateTime object
    const lastCancellation = DateTime.fromMillis(lastCancellationReqTime); // Convert previous time from milliseconds to DateTime

    // Calculate the time difference in hours
    const timeDiffInHours = currentTime.diff(lastCancellation, 'hours').hours;

    // Check if the difference is less than 6 hours
    if (timeDiffInHours < 6) {
      return NextResponse.json(false);
    }

    let stateJSON;

    try {
      stateJSON = state ? JSON.parse(state) : {}; // Handle null or undefined state
    } catch (error) {
      console.error('Error parsing state:', error);
      stateJSON = {}; // Fallback to empty state if parsing fails
    }

    // Update or initialize the state fields
    stateJSON.value = 'cancelSubscription';

    const updates: Partial<UserFieldsFirebase> = {
      state: JSON.stringify(stateJSON),
      processing: false,
      lastCancellationReqTime: DateTime.now().toMillis(),
    };
    await clientDoc.set(updates, { merge: true });
    if (DateTime.now().toMillis() >= whatsappExpiration)
      await sendWhatsappRefreshTemplate(clientid);
    const membershipEndDateHumanReadable = new Date(
      membershipEndDate,
    ).toLocaleDateString('en-GB');
    const message = `${getTranslation('confirm cancellation 1', language)} ${membershipEndDateHumanReadable}.\n${getTranslation('confirm cancellation 2', language)}`;
    const payload: ICreateMessagePayload = {
      phoneNumber: clientid,
      quickReply: true,
      msgBody: message,
      button1id: 'confirm cancel',
      button1: getTranslation('cancel subscription', language),
      button2id: 'back to safety',
      button2: getTranslation('back to safety', language),
    };
    const result = await sendMessageToWhatsapp(payload);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
