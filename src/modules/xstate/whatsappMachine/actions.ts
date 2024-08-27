import { DateTime } from 'luxon';
import { assign } from 'xstate';

import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import { DEFAULT_CREDITS, TRAINING_IMAGES_LIMIT } from '@/utils/constants';
import { getImprovedPromptFromGroq } from '@/utils/groq';
import {
  callTrainingAPI,
  getProcessingFlag,
  getTrainingImageURLs,
  getUserFields,
  incrementCreditsUsedTodayAndSetProcessingFlagFalse,
  setProcessingFlag,
  setUserLanguage,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { getTranslation } from '@/utils/translations';

import {
  createStripeLink,
  getCreditsAvailability,
  getMembershipAvailability,
  processAndSendImages,
  wipProcessAndSendImages,
} from './actionsHelper';
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
      creditsRemaining: () => DEFAULT_CREDITS,
      language: () => 'english',
      modelGenerated: () => false,
    }),
    notifyPendingPhotos: assign({
      message: ({ event }) =>
        `Send ${TRAINING_IMAGES_LIMIT - (event?.context?.photosUploaded || 0)} more photo(s)`,
    }),
    sendInvalidInputMessage: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('invalid input', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.clientid,
      );
    },
    sendIntroOptionsMessage: async (event: any) => {
      const language = event?.context?.language;
      console.log('[+] sending intro message');
      const message = getTranslation('intro message', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        quickReply: true,
        button1: getTranslation('upload photos', language),
        button2: getTranslation('language', language),
        button3: getTranslation('tutorial', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendSelectLanguage: async (event: any) => {
      // console.log(
      //   '[+] sending select language message on event: ',
      //   JSON.stringify(event, null, 2),
      // );
      const language = event?.context?.language;
      const message = getTranslation('select language', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        quickReply: true,
        button1: getTranslation('english', language),
        button2: getTranslation('portuguese', language),
        button3: getTranslation('arabic', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    assignLanguage: assign(({ event }) => {
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
        phoneNumber: config.userMetaData.clientid,
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
        phoneNumber: config.userMetaData.clientid,
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
        phoneNumber: config.userMetaData.clientid,
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
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    callStartTrainingAPI: async () => {
      const { clientid } = config.userMetaData;
      async function getTrainingImageURLsFromFirebase() {
        const trainingImageURLs = await getTrainingImageURLs(clientid);
        return trainingImageURLs || [];
      }
      await getTrainingImageURLsFromFirebase()
        .then(async (trainingImageURLs) => {
          const response = await callTrainingAPI(clientid, trainingImageURLs);
          // console.log('[+] callTrainingAPI called');
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
    notifyModelExists: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('model already exists', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
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
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPleaseWaitGeneratingModel: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('please wait generating model', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
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
        config.userMetaData.clientid,
      );
    },
    sendSamplePhotos: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('sample photos', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.clientid,
      );
    },
    sendPaywall: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('paywall', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        quickReply: true,
        button1: getTranslation('buy credits', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendStripeLink: async (event: any) => {
      const language = event?.context?.language;
      const { clientid } = config.userMetaData;
      const { membershipEndDate } = await getUserFields(clientid);
      const currentTimestamp = DateTime.now();

      // Reject if membership already exists
      if (currentTimestamp < DateTime.fromMillis(membershipEndDate || 0)) {
        console.log('[-] Active membership exists, purchase not allowed.');
        const message = `${getTranslation('active membership', language)}`;
        const payload: ICreateMessagePayload = {
          phoneNumber: clientid,
          text: true,
          msgBody: message,
        };
        await config.whatsappInstance.send(payload);
        return;
      }

      // Allow buying membership
      const stripeLink = await createStripeLink(clientid);
      const message = `${getTranslation('payment instructions', language)}
${stripeLink}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        quickReply: true,
        button1: getTranslation('cancel', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendUnpaidUserOptions: async (event: any) => {
      const language = event?.context?.language;
      const message = `${getTranslation('prompting instruction', language)}
Credits remaining: ${event?.context?.creditsRemaining || DEFAULT_CREDITS}`;
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPaymentInstructions: async (event: any) => {
      const language = event?.context?.language;
      const message = getTranslation('payment instructions', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
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
        phoneNumber: config.userMetaData.clientid,
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
        phoneNumber: config.userMetaData.clientid,
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
      // TODO: uncomment for paid flow
      //       const message = `${getTranslation('prompting instruction', language)}
      // Credits remaining: ${event?.context?.creditsRemaining || DEFAULT_CREDITS}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
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
      const language = event?.context?.language;
      const prompt = event?.event?.message;
      console.log('[+] sendPromptConfirmation | prompt: ', prompt);
      const message = `${getTranslation('prompt confirmation', language)}
*${prompt}*`;
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        quickReply: true,
        button1: 'Use Prompt',
        button2: 'Improve Prompt',
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },

    sendWIPPromptConfirmation: async (event: any) => {
      const language = event?.context?.language;
      const prompt = event?.event?.message;

      async function getMachineAvailability() {
        const machineIsAvailable =
          (await getProcessingFlag(config.userMetaData.clientid)) === false;
        return machineIsAvailable;
      }
      await getMachineAvailability()
        .then(async (machineIsAvailable) => {
          let payload: ICreateMessagePayload;
          if (machineIsAvailable) {
            console.log('[+] sendPromptConfirmation | prompt: ', prompt);
            const message = `${getTranslation('prompt confirmation', language)}
*${prompt}*`;
            // TODO: implement language in buttons
            payload = {
              phoneNumber: config.userMetaData.clientid,
              quickReply: true,
              button1: 'Use Prompt',
              button2: 'Improve Prompt',
              msgBody: message,
            };
          } else {
            const message = getTranslation(
              'please wait machine busy',
              language,
            );
            // TODO: implement language in buttons
            payload = {
              phoneNumber: config.userMetaData.clientid,
              text: true,
              msgBody: message,
            };
          }
          await config.whatsappInstance.send(payload);
        })
        .catch((error) => {
          console.error('Error in sendPromptConfirmation:', error);
        });
    },
    sendImprovedPromptConfirmationAndSetContext: async (event: any) => {
      const language = event?.context?.language;
      // console.log(
      //   '[+] sendImprovedPromptConfirmationAndSetContext: ',
      //   JSON.stringify(event, null, 2),
      // );
      const prompt = event?.context?.latestPrompt;
      async function getImprovedPromptSetItInContext() {
        const improvedPrompt = await getImprovedPromptFromGroq(prompt);
        // overwrite latestPrompt with improvedPrompt
        await config.storeInstance.setContext(
          config.userMetaData.clientid,
          'latestPrompt',
          improvedPrompt,
        );
        return improvedPrompt;
      }
      getImprovedPromptSetItInContext()
        .then(async (improvedPrompt: string) => {
          // console.log('[+] improved prompt set it context');
          const message = `${getTranslation('prompt confirmation', language)}
  *${improvedPrompt}*`;
          // TODO: implement language in buttons
          const payload: ICreateMessagePayload = {
            phoneNumber: config.userMetaData.clientid,
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
      const language = event?.context?.language;
      // console.log(
      //   '[+] sendReImprovedPromptConfirmationAndSetContext: ',
      //   JSON.stringify(event, null, 2),
      // );
      const improvedPrompt = event?.context?.latestImprovedPrompt;
      async function getImprovedPromptSetItInContext() {
        const reImprovedPrompt =
          await getImprovedPromptFromGroq(improvedPrompt);
        await config.storeInstance.setContext(
          config.userMetaData.clientid,
          'latestImprovedPrompt',
          reImprovedPrompt,
        );
        return reImprovedPrompt;
      }
      getImprovedPromptSetItInContext()
        .then(async (reImprovedPrompt: string) => {
          // console.log('[+] improved prompt set it context');
          const message = `${getTranslation('prompt confirmation', language)}
*${reImprovedPrompt}*`;
          // TODO: implement language in buttons
          const payload: ICreateMessagePayload = {
            phoneNumber: config.userMetaData.clientid,
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
    setProcessingTrue: async () =>
      setProcessingFlag(config.userMetaData.clientid, true),
    setProcessingFalse: async () =>
      setProcessingFlag(config.userMetaData.clientid, false),

    sendPromptedPhoto: async (event: any) => {
      const language = event?.context?.language;
      const prompt = event?.context?.latestPrompt;
      console.log('[+] action: send photo for prompt: ', prompt);

      let message = getTranslation('generating image', language);
      await sendMessage(
        config.whatsappInstance,
        message,
        config.userMetaData.clientid,
      );

      processAndSendImages(config, prompt)
        .then(async (success) => {
          console.log('[+] processAndSendImages done');
          await setProcessingFlag(config.userMetaData.clientid, false);
          return success; // Pass success to the next .then()
        })
        .then(async (success) => {
          console.log('[+] Context updated successfully');
          if (success) {
            message = `Cool photo! Just send another prompt.`;
            const payload: ICreateMessagePayload = {
              phoneNumber: config.userMetaData.clientid,
              text: true,
              msgBody: message,
            };
            await config.whatsappInstance.send(payload);
          }
        })
        .catch(async (error) => {
          await setProcessingFlag(config.userMetaData.clientid, false);
          console.error('[!] Error in processing or setting context:', error);
        });
    },

    sendWIPPromptedPhoto: async (event: any) => {
      const language = event?.context?.language;
      const prompt = event?.context?.latestPrompt;
      const { clientid } = config.userMetaData;

      let message;
      let payload: ICreateMessagePayload;

      async function getMachineAvailability() {
        const machineIsAvailable =
          (await getProcessingFlag(config.userMetaData.clientid)) === false;
        return machineIsAvailable;
      }

      // if machine available && credits available, then send prompted photo
      await getMachineAvailability()
        .then(async (machineIsAvailable) => {
          if (!machineIsAvailable) {
            message = getTranslation('please wait machine busy', language);
            // TODO: implement language in buttons
            payload = {
              phoneNumber: clientid,
              text: true,
              msgBody: message,
            };
            await config.whatsappInstance.send(payload);
            // Stop the chain
            return Promise.reject(new Error('Machine not available'));
          }
          return machineIsAvailable;
        })
        .then(async (machineIsAvailable) => {
          if (machineIsAvailable) {
            const [hasValidMembership, hasCredits] = await Promise.all([
              getMembershipAvailability(clientid),
              getCreditsAvailability(clientid),
            ]);

            const canGenerateImages = hasValidMembership && hasCredits;

            if (!canGenerateImages) {
              message = getTranslation('paywall', language);
              await config.whatsappInstance.send({
                phoneNumber: clientid,
                quickReply: true,
                button1: getTranslation('buy credits', language),
                msgBody: message,
              });
              // Stop the chain
              return Promise.reject(
                new Error(
                  `${!hasValidMembership && 'Membership Expired'} ${!hasCredits && 'Credits Over'}`,
                ),
              );
            }
          }
          return machineIsAvailable;
        })
        .then(async () => {
          console.log('[+] action: send photo for prompt: ', prompt);

          message = getTranslation('generating image', language);
          await sendMessage(config.whatsappInstance, message, clientid);

          // Set Machine Busy
          await setProcessingFlag(config.userMetaData.clientid, true);

          wipProcessAndSendImages(config, prompt)
            .then(async (success) => {
              console.log('[+] processAndSendImages done');
              await incrementCreditsUsedTodayAndSetProcessingFlagFalse(
                clientid,
              );
              return success; // Pass success to the next .then()
            })
            .then(async (success) => {
              console.log('[+] Context updated successfully');
              if (success) {
                message = getTranslation('new prompt request', language);
                payload = {
                  phoneNumber: clientid,
                  text: true,
                  msgBody: message,
                };
                await config.whatsappInstance.send(payload);
              }
            })
            .catch(async (error) => {
              await setProcessingFlag(config.userMetaData.clientid, false);
              console.error(
                '[!] Error in processing or setting context:',
                error,
              );
            });
        })
        .catch(async (error) => {
          await setProcessingFlag(config.userMetaData.clientid, false);
          console.error('[!] Error in machine & credit check:', error.message);
        });
    },
    sendRequestNewPrompt: async () => {
      const message = 'Alright, send a new prompt. :)';
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendCredits: async (event: any) => {
      // Logic to send remaining credits
      const language = event?.context?.language;
      const message = `${getTranslation('credits remaining', language)}: ${event?.context?.creditsRemaining}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendTestMessage: async (event: any) => {
      console.log('[!] test: ', JSON.stringify(event, null, 2));
      const message = `ping`;
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
  };
};
