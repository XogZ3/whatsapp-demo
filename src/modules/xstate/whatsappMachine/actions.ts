import console from 'console';
import { DateTime } from 'luxon';
import { assign } from 'xstate';

import {
  getAgeAndGenderFromImageURLUsingGroq,
  getImprovedPromptFromGroq,
} from '@/modules/groq';
import {
  type GenderAndAgeType,
  getAgeAndGenderFromImageURLUsingOpenAI,
} from '@/modules/openai';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import {
  callTrainingAPI,
  generateAndSaveShortURLMap,
  getPhotoCount,
  getProcessingFlag,
  getTrainingImageURLs,
  getUserFields,
  incrementCreditsUsedTodayAndSetProcessingFlagFalse,
  setProcessingFlag,
  setRetriedFlag,
  setUserAgeAndGender,
  setUserLanguage,
  setUserState,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { sendMessageToTelegram } from '@/utils/telegram';
import { getTranslation } from '@/utils/translations';

import {
  checkTrainingJobForClient,
  createReferralPromoCode,
  createStripeLink,
  getCreditsAvailability,
  getMembershipAvailability,
  notifyPendingPhotos,
  processAndSendImages,
  sendContactInfoMessage,
  sendIntroQuickReplyMessage,
  setUserStateAndInform,
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
      modelGenerated: () => false,
      language: () => 'english',
      age: () => 25,
      gender: () => 'male',
      shortenedStripeLink: () => '',
    }),
    sendInvalidInputMessage: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('invalid input', language);
      await sendMessage(config.whatsappInstance, message, clientid);
    },
    // sendSamplePhotos: async () => {
    //   const { clientid } = config.userMetaData;
    //   await Promise.all(
    //     samplePhotoURLs.map((URL: string) =>
    //       config.whatsappInstance.send({
    //         phoneNumber: clientid,
    //         image: true,
    //         imageLink: URL,
    //       }),
    //     ),
    //   );
    // },
    sendIntroOptionsMessageBasedOnPhoneNumber: async (event: any) => {
      try {
        console.log(
          '[~] attempting to sendIntroOptionsMessageBasedOnPhoneNumber',
        );
        // use language based on phone number
        const { clientid, language } = config.userMetaData;

        const languageButtonTextLocale = getTranslation('language', language);
        const finalLanguageButtonText = `Language${languageButtonTextLocale !== 'Language' ? ` | ${languageButtonTextLocale}` : ''}`;

        let shortenedStripeLink = event?.context?.shortenedStripeLink;
        let message;

        if (shortenedStripeLink === '' || !shortenedStripeLink) {
          createStripeLink(clientid)
            .then(async (stripeLink) => {
              console.log('Created Stripe link:', stripeLink);
              shortenedStripeLink = await generateAndSaveShortURLMap(
                stripeLink,
                clientid,
              );
              console.log(
                'Generated and saved short URL:',
                shortenedStripeLink,
              );
              return shortenedStripeLink;
            })
            .then(async (shortLink) => {
              config.storeInstance.setContext(
                clientid,
                'shortenedStripeLink',
                shortLink,
              );

              message = `${getTranslation('intro message', language)}\n\n${shortLink}`;

              await sendIntroQuickReplyMessage(
                clientid,
                message,
                finalLanguageButtonText,
                getTranslation('tutorial', language),
              );
            })
            .catch(async (error) => {
              console.error(
                'Error in creating/sending shortened Stripe link:',
                error,
              );
              await sendMessageToTelegram(
                `Error in sending intro msg: ${JSON.stringify(error, null, 2)}`,
              );
            });
        } else {
          message = `${getTranslation('intro message', language)}\n\n${shortenedStripeLink}`;
          await sendIntroQuickReplyMessage(
            clientid,
            message,
            finalLanguageButtonText,
            getTranslation('tutorial', language),
          );
        }
      } catch (err) {
        console.error(
          'Error in sendIntroOptionsMessageBasedOnPhoneNumber:',
          err,
        );
        await sendMessageToTelegram(
          `Error in sendIntroOptionsMessageBasedOnPhoneNumber: ${JSON.stringify(err, null, 2)}`,
        );
      }
    },
    sendIntroOptionsMessage: async (event: any) => {
      try {
        console.log('[~] attempting to sendIntroOptionsMessage');
        // use language based on the user's selection
        const { clientid } = config.userMetaData;
        const language = event?.context?.language;

        const languageButtonTextLocale = getTranslation('language', language);
        const finalLanguageButtonText = `Language${languageButtonTextLocale !== 'Language' ? ` | ${languageButtonTextLocale}` : ''}`;

        let shortenedStripeLink = event?.context?.shortenedStripeLink;
        console.log(
          '[~] shortenedStripeLink in context: ',
          shortenedStripeLink,
        );

        let message;

        if (shortenedStripeLink === '' || !shortenedStripeLink) {
          createStripeLink(clientid)
            .then(async (stripeLink) => {
              console.log('Created Stripe link:', stripeLink);
              shortenedStripeLink = await generateAndSaveShortURLMap(
                stripeLink,
                clientid,
              );
              console.log(
                'Generated and saved short URL:',
                shortenedStripeLink,
              );
              return shortenedStripeLink;
            })
            .then(async (shortLink) => {
              config.storeInstance.setContext(
                clientid,
                'shortenedStripeLink',
                shortLink,
              );

              message = `${getTranslation('intro message', language)}\n\n${shortLink}`;

              await sendIntroQuickReplyMessage(
                clientid,
                message,
                finalLanguageButtonText,
                getTranslation('tutorial', language),
              );
            })
            .catch(async (error) => {
              console.error(
                'Error in creating/sending shortened Stripe link:',
                error,
              );
              await sendMessageToTelegram(
                `Error in sending intro msg: ${JSON.stringify(error, null, 2)}`,
              );
            });
        } else {
          message = `${getTranslation('intro message', language)}\n\n${shortenedStripeLink}`;
          await sendIntroQuickReplyMessage(
            clientid,
            message,
            finalLanguageButtonText,
            getTranslation('tutorial', language),
          );
        }
      } catch (err) {
        console.error('Error in sendIntroOptionsMessage:', err);
        await sendMessageToTelegram(
          `Error in sendIntroOptionsMessage: ${JSON.stringify(err, null, 2)}`,
        );
      }
    },
    sendPromoMessage: async () => {
      const { clientid, language } = config.userMetaData;
      const promoCode = await createReferralPromoCode(clientid);
      const message = `${getTranslation('referral 1', language)} *${promoCode}* ${getTranslation('referral 2', language)}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
      await sendContactInfoMessage(clientid);
    },
    sendSelectLanguage: async (event: any) => {
      // console.log(
      //   '[+] sending select language message on event: ',
      //   JSON.stringify(event, null, 2),
      // );
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('select language', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        quickReply: true,
        button1id: 'english',
        button2id: 'portuguese',
        button3id: 'arabic',
        button1: 'English',
        button2: 'Português',
        button3: 'عربي',
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
      const { clientid } = config.userMetaData;
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
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('pricing', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        quickReply: true,
        button1id: 'get membership',
        button2id: 'tutorial',
        button3id: 'main menu',
        button1: getTranslation('get membership', language),
        button2: getTranslation('tutorial', language),
        button3: getTranslation('main menu', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendTutorial: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('tutorial message', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        quickReply: true,
        button1id: 'main menu',
        button1: getTranslation('main menu', language),
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPhotoUploadInstruction: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('photo upload instruction', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPendingPhotos: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      getPhotoCount(clientid).then(async (currentPhotoCount: number) => {
        await notifyPendingPhotos(clientid, language, currentPhotoCount);
      });
    },
    callStartTrainingAPI: async (event: any) => {
      let message = '';
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
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
        .then(async (response) => {
          if (response.jobId) console.log('[+] callTrainingAPI job created');
          if (response.error) {
            console.error('[!] callTrainingAPI call error', response.error);
            if (
              response.error ===
              'Failed to start training: A training job for this model_name already exists'
            ) {
              console.log(
                '[~] Known error in callStartTrainingAPI action: ',
                response.error,
              );
            } else {
              console.error(
                '[!] Error in callStartTrainingAPI action: ',
                response.error,
              );
              console.log('notifying user that something went wrong');
              message = getTranslation('unknown error', language);
              await Promise.all([
                sendMessageToTelegram(`${clientid}: ${response.error}`),
                config.whatsappInstance.send({
                  phoneNumber: clientid,
                  text: true,
                  msgBody: message,
                }),
              ]);
            }
          }
        })
        .catch(async (error) => {
          if (error.status === 409) {
            console.log(
              '[~] Known error in callStartTrainingAPI action: ',
              error.error,
            );
          } else {
            console.error('[!] Error in callStartTrainingAPI action: ', error);
          }
        });
    },
    saveAgeAndGender: async () => {
      const { clientid } = config.userMetaData;
      try {
        const imageUrls = await getTrainingImageURLs(clientid);
        if (imageUrls.length === 0) {
          throw new Error('No training image URLs available.');
        }
        const randomIndex = Math.floor(Math.random() * imageUrls.length);
        const randomImageUrl = imageUrls[randomIndex];

        if (!randomImageUrl) {
          throw new Error('Failed to select a random image URL.');
        }
        // Step 1: Try using Groq API
        let result: GenderAndAgeType | null;
        result = await getAgeAndGenderFromImageURLUsingGroq(randomImageUrl);
        // Step 2: If Groq API fails, try using OpenAI API
        if (!result) {
          console.warn(
            'Groq API failed to return valid age and gender. Falling back to OpenAI API.',
          );
          result = await getAgeAndGenderFromImageURLUsingOpenAI(randomImageUrl);
        }
        if (result) {
          await Promise.all([
            setUserAgeAndGender(clientid, result.age, result.gender),
            config.storeInstance.setContext(clientid, 'age', result.age),
            config.storeInstance.setContext(clientid, 'gender', result.gender),
          ]);
          console.log('Age and gender saved successfully.');
        } else {
          console.warn('Failed to get age and gender from the image.');
        }
      } catch (error) {
        console.error('Error in saveAgeAndGenderUsingOpenAI:', error);
      }
    },
    notifyModelExists: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('model already exists', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendGeneratingModel: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('generating model', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPleaseWaitGeneratingModel: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('please wait generating model', language);
      // TODO: implement language in buttons
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    handleModelGenerationStatus: async () => {
      await checkTrainingJobForClient(config.userMetaData.clientid);
    },
    setRetriedFlagTrue: async () => {
      const { clientid } = config.userMetaData;
      await setRetriedFlag(clientid, true);
    },
    sendPaywall: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const { membershipEndDate } = await getUserFields(clientid);
      const currentTimestamp = DateTime.now();

      // Reject if membership already exists
      if (currentTimestamp < DateTime.fromMillis(membershipEndDate || 0)) {
        console.log('[-] Active membership exists, purchase not allowed.');

        await setUserStateAndInform({
          clientid,
          language,
          stateValue: 'photoPrompting',
          reason: 'active membership',
        });
        return;
      }

      // Allow buying membership
      const stripeLink = await createStripeLink(clientid);
      const message = `${getTranslation('new user paywall', language)}

${stripeLink}`;
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
    },
    sendPromptingInstruction: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('prompting instruction', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
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
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const prompt = event?.event?.message;

      async function getMachineAvailability() {
        const machineIsAvailable =
          (await getProcessingFlag(clientid)) === false;
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
              phoneNumber: clientid,
              quickReply: true,
              button1id: 'use prompt',
              button2id: 'improve prompt',
              button1: getTranslation('use prompt', language),
              button2: getTranslation('improve prompt', language),
              msgBody: message,
            };
          } else {
            const message = getTranslation(
              'please wait machine busy',
              language,
            );
            // TODO: implement language in buttons
            payload = {
              phoneNumber: clientid,
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
      const {
        clientid,
        language = event?.context?.language,
        age,
        gender,
      } = config.userMetaData;
      // console.log(
      //   '[+] sendImprovedPromptConfirmationAndSetContext: ',
      //   JSON.stringify(event, null, 2),
      // );
      const prompt: string = event?.context?.latestPrompt;
      async function getImprovedPromptSetItInContext() {
        const improvedPrompt = await getImprovedPromptFromGroq({
          prompt,
          age,
          gender,
        });
        // overwrite latestPrompt with improvedPrompt
        await config.storeInstance.setContext(
          clientid,
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
            phoneNumber: clientid,
            quickReply: true,
            button1id: 'use prompt',
            button2id: 'improve prompt',
            button1: getTranslation('use prompt', language),
            button2: getTranslation('improve prompt', language),
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
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      // console.log(
      //   '[+] sendReImprovedPromptConfirmationAndSetContext: ',
      //   JSON.stringify(event, null, 2),
      // );
      const improvedPrompt = event?.context?.latestImprovedPrompt;
      async function getImprovedPromptSetItInContext() {
        const reImprovedPrompt =
          await getImprovedPromptFromGroq(improvedPrompt);
        await config.storeInstance.setContext(
          clientid,
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
            phoneNumber: clientid,
            quickReply: true,
            button1id: 'use prompt',
            button2id: 'improve prompt',
            button1: getTranslation('use prompt', language),
            button2: getTranslation('improve prompt', language),
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
      const {
        age = 26,
        gender = 'male',
        clientid,
        language = event?.context?.language,
      } = config.userMetaData;
      const genderCommon = gender === 'male' ? 'man' : 'woman';
      const prompt = `photograph of ${age} year old ${genderCommon} person${clientid} ${event?.context?.latestPrompt}`;

      let message;
      let payload: ICreateMessagePayload;
      const clientData = await getUserFields(clientid);

      async function getMachineAvailability() {
        return !clientData.processing;
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
              getMembershipAvailability(clientData),
              getCreditsAvailability(clientData),
            ]);

            const canGenerateImages = hasValidMembership && hasCredits;

            if (!canGenerateImages) {
              if (!hasCredits) {
                message = getTranslation('reached limit', language);
                await config.whatsappInstance.send({
                  phoneNumber: clientid,
                  text: true,
                  msgBody: message,
                });
              } else if (!hasValidMembership) {
                // hard transition xstate to paywall
                message = getTranslation('paywall', language);
                const stateJSON = JSON.parse(clientData.state);
                stateJSON.value = 'paywall';

                const stripeLink = await createStripeLink(clientid);
                message = `${getTranslation('new user paywall', language)}

${stripeLink}`;
                await Promise.all([
                  config.whatsappInstance.send({
                    phoneNumber: clientid,
                    text: true,
                    msgBody: message,
                  }),
                  setUserState(JSON.stringify(stateJSON), clientid),
                ]);
              } else {
                message = getTranslation('unknown error', language);
                await config.whatsappInstance.send({
                  phoneNumber: clientid,
                  text: true,
                  msgBody: message,
                });
              }
              // Stop the chain
              return Promise.reject(
                new Error(
                  `${!hasValidMembership ? 'Membership Expired' : ''} ${!hasCredits ? 'Credits Over' : ''}`,
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
          await setProcessingFlag(clientid, true);

          processAndSendImages(config, prompt)
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
              await setProcessingFlag(clientid, false);
              console.error(
                '[!] Error in processing or setting context:',
                error,
              );
              if (error.message && error.message.includes('NSFW')) {
                message = getTranslation('nsfw error', language);
              } else {
                message = getTranslation('unknown error', language);
              }
              payload = {
                phoneNumber: clientid,
                text: true,
                msgBody: message,
              };
              await config.whatsappInstance.send(payload);
            });
        })
        .catch(async (error) => {
          await setProcessingFlag(clientid, false);
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
