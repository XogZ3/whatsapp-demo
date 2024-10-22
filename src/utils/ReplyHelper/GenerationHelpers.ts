import { DateTime } from 'luxon';

import {
  type ICreateMessagePayload,
  sendMessageToWhatsapp,
} from '@/modules/whatsapp/whatsapp';
import {
  callTrainingAPI,
  getUserFields,
  saveAgeAndGender,
  setStatePhotoPrompting,
} from '@/utils/ReplyHelper/FirebaseHelpers';

import { sendMessageToTelegram } from '../telegram';
import { getTranslation, type Language } from '../translations';

async function sendModelExistsMessage(clientid: string, language: Language) {
  const message = getTranslation('model already exists', language);
  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: message,
  };

  await sendMessageToWhatsapp(payload);
}

async function sendGeneratingModelMessage(
  clientid: string,
  language: Language,
) {
  const paymentConfirmationPayload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: getTranslation('payment confirmation', language),
  };
  await sendMessageToWhatsapp(paymentConfirmationPayload);

  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    text: true,
    msgBody: getTranslation('generating model', language),
  };
  await sendMessageToWhatsapp(payload);
}

async function sendGeneratingModelTemplate(
  clientid: string,
  language: Language,
) {
  const languageCode = language === 'portuguese' ? 'pt_BR' : 'en';
  let templateName: string;

  if (languageCode === 'pt_BR')
    templateName = 'fotolabs_payment_confirmation_pt';
  else templateName = 'fotolabs_payment_confirmation_en';

  const paymentConfirmationPayload: ICreateMessagePayload = {
    phoneNumber: clientid,
    template: true,
    templateName,
    templateLanguageCode: languageCode,
  };
  await sendMessageToWhatsapp(paymentConfirmationPayload);

  if (languageCode === 'pt_BR') templateName = 'fotolabs_generating_model_pt';
  else templateName = 'fotolabs_generating_model_en';

  const payload: ICreateMessagePayload = {
    phoneNumber: clientid,
    template: true,
    templateName,
    templateLanguageCode: languageCode,
  };
  await sendMessageToWhatsapp(payload);
}

export async function startGeneratingModel(
  clientid: string,
  language: Language,
): Promise<void> {
  try {
    const userFields = await getUserFields(clientid);
    const { loraURL, loraFilename, trainingImageURLs, whatsappExpiration } =
      userFields;

    const isWhatsappExpired =
      DateTime.now().toMillis() > (whatsappExpiration ?? Infinity);

    if (loraURL && loraFilename) {
      await setStatePhotoPrompting(clientid);

      await sendModelExistsMessage(clientid, language);

      return;
    }

    if (isWhatsappExpired) {
      await sendGeneratingModelTemplate(clientid, language);
    } else {
      await sendGeneratingModelMessage(clientid, language);
    }

    const response = await callTrainingAPI(clientid, trainingImageURLs);
    if (response.jobId) {
      console.log(`[+] callTrainingAPI job created: ${response.jobId}`);
    }

    await saveAgeAndGender(clientid);
  } catch (error) {
    if (error instanceof Error && 'status' in error && error.status === 409) {
      console.log(
        '[~] Known error in callStartTrainingAPI action:',
        error.message,
      );
    } else {
      console.error('[!] Error in startGeneratingModel:', error);
    }
    await sendMessageToTelegram(
      `error ${JSON.stringify(error, null, 2)} in startGeneratingModel for clientid ${clientid}`,
    );
  }
}
