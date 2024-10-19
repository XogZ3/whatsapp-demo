import { DateTime } from 'luxon';
import { type NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import firebase from '@/modules/firebase';
import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import {
  getUserFields,
  type UserFieldsFirebase,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import {
  getLanguageCode,
  getTranslation,
  type Language,
} from '@/utils/translations';

const firestore = firebase.getFirestore();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

async function sendConfirmCancellationTemplate(
  clientid: string,
  language: Language,
  membershipEndDateHumanReadable: string,
) {
  const languageCode = getLanguageCode(language);
  let finalLanguageCode: any;
  if (languageCode === 'pt') finalLanguageCode = 'pt_BR';
  else finalLanguageCode = languageCode;

  let templateName: string;
  if (languageCode === 'pt') templateName = 'fotolabs_cancellation_pt';
  else templateName = 'fotolabs_cancellation';

  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    template: true,
    templateName,
    templateLanguageCode: finalLanguageCode || 'en',
    variables: true,
    quickReply: true,
    variable1: membershipEndDateHumanReadable,
  };
  const result = await sendMessageToWhatsapp(payload);
  return result;
}

async function sendConfirmCancellationMessage(
  clientid: string,
  language: Language,
  membershipEndDateHumanReadable: string,
) {
  const message = `${getTranslation('confirm cancellation 1', language)} ${membershipEndDateHumanReadable}.\n${getTranslation('confirm cancellation 2', language)}`;
  const payload = {
    phoneNumber: clientid,
    quickReply: true,
    msgBody: message,
    button1id: 'cancel subscription',
    button1: getTranslation('cancel subscription', language),
    button2id: 'back to safety',
    button2: getTranslation('back to safety', language),
  };
  const result = await sendMessageToWhatsapp(payload);
  return result;
}

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

    const userFields = await getUserFields(clientid);

    // Destructure with default values to prevent undefined errors
    const {
      language = 'english',
      membershipEndDate,
      state,
      subscriptionId,
      whatsappExpiration,
      lastCancellationReqTime,
    } = userFields || {};

    if (!subscriptionId)
      return NextResponse.json(
        { error: 'subscription not found' },
        { status: 404 },
      );

    const currentTime = DateTime.now(); // Current time as a DateTime object

    // Check if lastCancellationReqTime exists
    if (lastCancellationReqTime) {
      const lastCancellation = DateTime.fromMillis(lastCancellationReqTime);
      const timeDiffInHours = currentTime.diff(lastCancellation, 'hours').hours;

      if (timeDiffInHours < 6) {
        return NextResponse.json(
          { cancellationFrequent: true, cancellationStat: false, error: '' },
          { status: 200 },
        );
      }
    }

    // If lastCancellationReqTime doesn't exist or the time difference is >= 6 hours, continue with the cancellation process

    let message;
    let payload: ICreateMessagePayload;
    const subscriptionDetails =
      await stripe.subscriptions.retrieve(subscriptionId);
    const subscriptionStatus = subscriptionDetails.status;
    if (subscriptionStatus === 'canceled') {
      message = getTranslation('already cancelled', language);
      payload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await sendMessageToWhatsapp(payload);
      return NextResponse.json(
        { cancellationFrequent: false, cancellationStat: true, error: '' },
        { status: 200 },
      );
    }

    let stateJSON;

    try {
      stateJSON = state ? JSON.parse(state) : {}; // Handle null or undefined state
    } catch (error) {
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
    const membershipEndDateHumanReadable = new Date(
      membershipEndDate,
    ).toLocaleDateString('en-GB');

    let result = false;
    if (DateTime.now().toMillis() >= whatsappExpiration) {
      result = await sendConfirmCancellationTemplate(
        clientid,
        language,
        membershipEndDateHumanReadable,
      );
    } else {
      result = await sendConfirmCancellationMessage(
        clientid,
        language,
        membershipEndDateHumanReadable,
      );
    }

    return NextResponse.json(
      { cancellationFrequent: false, cancellationStat: result, error: '' },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error in GET function:', error);
    return NextResponse.json(
      {
        cancellationFrequent: false,
        cancellationStat: false,
        error: (error as Error).message,
      },
      { status: 400 },
    );
  }
}
