import console from 'console';
import { assign } from 'xstate';

import { generateImagesUploadToFirebaseGetURL } from '@/modules/runpod';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { DEFAULT_CREDITS, TRAINING_IMAGES_LIMIT } from '@/utils/constants';
import { getImprovedPromptFromGroq } from '@/utils/groq';
import {
  callTrainingAPI,
  getTrainingImageURLs,
  setUserLanguage,
} from '@/utils/ReplyHelper/FirebaseHelpers';
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
    callStartTrainingAPI: async () => {
      const clientid = config.userMetaData.phonenumber;
      async function getTrainingImageURLsFromFirebase() {
        const trainingImageURLs = await getTrainingImageURLs(clientid);
        return trainingImageURLs || [];
      }
      await getTrainingImageURLsFromFirebase()
        .then(async (trainingImageURLs) => {
          const response = await callTrainingAPI(clientid, trainingImageURLs);
          console.log('[+] callTrainingAPI called');
          return response;
        })
        .then((response) => {
          if (response.jobId) console.log('[+] callTrainingAPI job created');
          if (response.error)
            console.error('[!] callTrainingAPI call error', response.error);
        })
        .catch((error) => {
          console.error(
            '[!] Unhandled error in callStartTrainingAPI action: ',
            error,
          );
        });
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
    assignImprovedPromptToPromptInContext: assign((event: any) => {
      const improvedPrompt = event?.context?.latestImprovedPrompt;
      console.log(
        '[+] assignImprovedPromptToPromptInContext | improvedPrompt: ',
        improvedPrompt,
      );
      return {
        latestPrompt: improvedPrompt,
      };
    }),
    sendPromptConfirmation: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      const prompt = event?.event?.message;
      console.log('[+] sendPromptConfirmation | prompt: ', prompt);
      const message = `${getTranslation('prompt confirmation', language)}
>>> ${prompt}`;
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
    sendImprovedPromptConfirmationAndSetContext: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      // console.log(
      //   '[+] sendImprovedPromptConfirmationAndSetContext: ',
      //   JSON.stringify(event, null, 2),
      // );
      const prompt = event?.context?.latestPrompt;
      async function getImprovedPromptSetItInContext() {
        const improvedPrompt = await getImprovedPromptFromGroq(prompt);
        // overwrite latestPrompt with improvedPrompt
        await config.storeInstance.setContext(
          config.userMetaData.phonenumber,
          'latestPrompt',
          improvedPrompt,
        );
        return improvedPrompt;
      }
      getImprovedPromptSetItInContext()
        .then(async (improvedPrompt: string) => {
          // console.log('[+] improved prompt set it context');
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
        })
        .then(() => {
          console.log('[+] sendImprovedPromptConfirmation success');
        })
        .catch((error) => {
          console.error('[!] Error in sending prompt confirmation msg:', error);
        });
    },
    sendReImprovedPromptConfirmationAndSetContext: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      // console.log(
      //   '[+] sendReImprovedPromptConfirmationAndSetContext: ',
      //   JSON.stringify(event, null, 2),
      // );
      const improvedPrompt = event?.context?.latestImprovedPrompt;
      async function getImprovedPromptSetItInContext() {
        const reImprovedPrompt =
          await getImprovedPromptFromGroq(improvedPrompt);
        await config.storeInstance.setContext(
          config.userMetaData.phonenumber,
          'latestImprovedPrompt',
          reImprovedPrompt,
        );
        return reImprovedPrompt;
      }
      getImprovedPromptSetItInContext()
        .then(async (reImprovedPrompt: string) => {
          // console.log('[+] improved prompt set it context');
          const message = `${getTranslation('prompt confirmation', language)}
  >>> ${reImprovedPrompt}`;
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
        })
        .then(() => {
          console.log('[+] sendImprovedPromptConfirmation success');
        })
        .catch((error) => {
          console.error('[!] Error in sending prompt confirmation msg:', error);
        });
    },
    assignProcessingTrue: assign({ processing: () => true }),
    assignProcessingFalse: assign({ processing: () => false }),

    sendPromptedPhoto: async (event: any) => {
      const language = event?.event?.userMetaData?.language;
      const prompt = event?.context?.latestPrompt;
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
          return true; // Indicate success
        }
        message =
          'Uh-oh. Something went wrong, please try again after some time.';
        const payload: ICreateMessagePayload = {
          phoneNumber: config.userMetaData.phonenumber,
          text: true,
          msgBody: message,
        };
        await config.whatsappInstance.send(payload);
        return false; // Indicate failure
      }

      processAndSendImages()
        .then(async (success) => {
          console.log('[+] processAndSendImages done');
          await config.storeInstance.setContext(
            config.userMetaData.phonenumber,
            'processing',
            false,
          );
          return success; // Pass success to the next .then()
        })
        .then(async (success) => {
          console.log('[+] Context updated successfully');
          if (success) {
            message = `Cool photo! Just send another prompt.`;
            const payload: ICreateMessagePayload = {
              phoneNumber: config.userMetaData.phonenumber,
              text: true,
              msgBody: message,
            };
            await config.whatsappInstance.send(payload);
          }
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
    sendTestMessage: async (event: any) => {
      console.log('[!] test: ', JSON.stringify(event, null, 2));
      const message = `ping`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.phonenumber,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
  };
};
