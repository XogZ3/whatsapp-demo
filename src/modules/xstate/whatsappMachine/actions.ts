import { assign } from 'xstate';

import { generateImagesUploadToFirebaseGetURL } from '@/modules/runpod';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { DEFAULT_CREDITS, TRAINING_IMAGES_LIMIT } from '@/utils/constants';
import { getImprovedPromptFromGroq } from '@/utils/groq';
import { setUserLanguage } from '@/utils/ReplyHelper/FirebaseHelpers';
import { getTranslation } from '@/utils/translations';

import type { IMachineConfig, IWhatsappInstance } from './types';

async function sendMessage(
  whatsappInstance: IWhatsappInstance,
  message: string,
  phonenumber: string,
) {
  const payload: ICreateMessagePayload = {
    phoneNumber: phonenumber,
    text: true,
    msgBody: message,
  };

  await whatsappInstance.send(payload);
}

export const actionsFactory = (config: IMachineConfig): any => {
  return {
    assignMessage: assign({ message: ({ event }) => event?.message }),
    assignDefaultValues: assign({
      message: () => '',
      latestPrompt: () => '',
      latestImprovedPrompt: () => '',
      processing: () => false,
      photosUploaded: () => 0,
      creditsRemaining: () => DEFAULT_CREDITS,
      language: () => 'english',
    }),
    notifyPendingPhotos: assign({
      message: ({ event }) =>
        `Send ${TRAINING_IMAGES_LIMIT - (event?.context?.photosUploaded || 0)} more photo(s)`,
    }),
    sendPendingPhotos: async (event: any) => {
      const language = event?.context?.language;
      const message = `${getTranslation(
        'photo received',
        language,
      )}: ${event?.context?.photosUploaded} / ${TRAINING_IMAGES_LIMIT}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    incrementPhotoCount: assign((event: any) => {
      console.log(
        'incrementPhotoCount event: ',
        JSON.stringify(event, null, 2),
      );
      console.log(
        'incremented vale: ',
        (event?.context?.photosUploaded || 0) + 1,
      );
      return {
        photosUploaded: (event?.context?.photosUploaded || 0) + 1,
      };
    }),
    sendInvalidInputMessage: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      const message = getTranslation('invalid input', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );
    },
    sendIntroOptionsMessage: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      console.log('[+] sending intro message');
      const message = getTranslation('intro message', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: getTranslation('upload photos', language),
        button2: getTranslation('language', language),
        button3: getTranslation('tutorial', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    // assignLanguage: assign({
    //   language: ({ event }) => event?.userMetaData?.language,
    // }),
    sendSelectLanguage: async (event: any) => {
      console.log(
        '[+] sending select language message on event: ',
        JSON.stringify(event, null, 2),
      );
      const language = event?.event?.userMetaData?.language;
      const message = getTranslation('select language', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: getTranslation('english', language),
        button2: getTranslation('portuguese', language),
        button3: getTranslation('arabic', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    assignLanguage: assign(({ event }) => {
      console.log('assignLanguage event: ', JSON.stringify(event, null, 2));
      return {
        language: event?.message,
      };
    }),
    setLanguageInFirebase: async (event: any) => {
      const clientid = event?.event?.userMetaData?.phonenumber;
      const language = event?.event?.message;
      await setUserLanguage(language, clientid);
      console.log(`[+] firebase: language ${language} updates successfully`);
    },
    sendSelectedLanguage: async (event: any) => {
      const message = getTranslation(
        'language selected',
        event?.context?.language,
      );
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPricing: async (event: any) => {
      console.log('[-] sendPricing event: ', JSON.stringify(event, null, 2));
      const language = event?.context?.language;
      const message = getTranslation('pricing', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: getTranslation('buy credits', language),
        button2: getTranslation('tutorial', language),
        button3: getTranslation('main menu', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendTutorial: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('tutorial message', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: getTranslation('upload photos', language),
        button2: getTranslation('pricing', language),
        button3: getTranslation('main menu', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPhotoUploadInstruction: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('photo upload instruction', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPhotosReceivedCount: async (event: any) => {
      const language = event?.context?.language;
      const message = `${getTranslation(
        'photo received',
        language,
      )}: ${event?.context?.photosUploaded} / ${TRAINING_IMAGES_LIMIT}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendGeneratingModel: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('generating model', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendModelGeneratedSuccess: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('model generated', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );
    },
    sendSamplePhotos: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('sample photos', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );
    },
    sendUnpaidUserOptions: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('unpaid user options', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Buy Credits',
        button2: 'Bypass',
        button3: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPaymentInstructions: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('payment instructions', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPaymentConfirmation: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('payment confirmation', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        button2: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPaidUserOptions: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('paid user options', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Create Photo',
        button2: 'Cancel',
        button3: 'Bypass',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPromptingInstruction: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('prompting instruction', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    // assignImprovedPrompt
    assignPromptToContext: assign((event: any) => {
      const prompt = event?.event?.message;
      console.log('[+] assignPromptToContext | prompt: ', prompt);
      return {
        latestPrompt: prompt,
      };
    }),
    getImprovedPromptAndAssignToContext: async (event: any) => {
      const prompt = event?.context?.latestPrompt;
      const improvedPrompt = await getImprovedPromptFromGroq(prompt);
      console.log(
        '[+] getImprovedPromptAndAssignToContext | improvedPrompt: ',
        improvedPrompt,
      );
      await config.storeInstance.setContext(
        config.userMetaData.phonenumber,
        'latestImprovedPrompt',
        improvedPrompt,
      );
    },
    sendPromptConfirmation: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      const prompt = event?.context?.latestPrompt;
      const improvedPrompt = event?.context?.latestImprovedPrompt;
      console.log(
        '[+] sendPromptConfirmation | prompt: ',
        prompt,
        ', improvedPrompt: ',
        improvedPrompt,
      );
      const message = `${getTranslation('prompt confirmation', language)}
>>> ${improvedPrompt}`;
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Use Prompt',
        button2: 'Improve Prompt',
        button3: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendImprovedPromptConfirmation: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      console.log(
        '[+] sendImprovedPromptConfirmation: ',
        JSON.stringify(event, null, 2),
      );
      const prompt = event?.context?.latestPrompt;
      const improvedPrompt = await getImprovedPromptFromGroq(prompt);
      const message = `${getTranslation('prompt confirmation', language)}
>>> ${improvedPrompt}`;
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        quickReply: true,
        button1: 'Use Prompt',
        button2: 'Improve Prompt',
        button3: 'Cancel',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    assignProcessingTrue: assign({ message: () => true }),
    assignProcessingFalse: assign({ message: () => false }),
    sendPromptedPhoto: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      const prompt = event?.context?.latestImprovedPrompt;
      console.log('[+] action: send photo for prompt: ', prompt);

      let message = getTranslation('generating image', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.phonenumber,
      );

      async function processAndSendImages() {
        const generatedImageURLs: string[] =
          await generateImagesUploadToFirebaseGetURL(
            prompt,
            config.userMetaData.phonenumber,
          );

        console.log('[+] receveid runpod urls: ', generatedImageURLs);
        if (generatedImageURLs.length > 0) {
          const sendPromises = generatedImageURLs.map(async (url) => {
            const payload: ICreateMessagePayload = {
              phoneNumber: config.userMetaData.phonenumber,
              image: true,
              imageLink: url,
            };
            await config.whatsappInstance.send(payload);
          });
          await Promise.all(sendPromises);

          console.log('All images sent successfully.');

          message = `Cool photo! Just send another prompt.`;
          const payload: ICreateMessagePayload = {
            phoneNumber: config.userMetaData.phonenumber,
            text: true,
            msgBody: message,
          };
          await config.whatsappInstance.send(payload);
        } else {
          message =
            'Uh-oh. Something went wrong, please try again after some time.';
          const payload: ICreateMessagePayload = {
            phoneNumber: config.userMetaData.phonenumber,
            text: true,
            msgBody: message,
          };
          await config.whatsappInstance.send(payload);
        }
      }
      await processAndSendImages()
        .then(() => {
          console.log('[+] processAndSendImages done');
          return config.storeInstance.setContext(
            config.userMetaData.phonenumber,
            'processing',
            false,
          );
        })
        .then(() => {
          console.log('[+] Context updated successfully');
        })
        .catch((error) => {
          console.error('[!] Error in processing or setting context:', error);
        });
    },
    sendPleaseWait: async () => {
      const message = 'Please wait for the image to be generated first.';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendRequestNewPrompt: async () => {
      const message = 'Alright, send a new prompt. :)';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendCredits: async (event: any) => {
      // Logic to send remaining credits
      const language = event?.event?.userMetaData?.language;
      const message = `${getTranslation('credits remaining', language)}: ${event?.context?.creditsRemaining}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
  };
};
