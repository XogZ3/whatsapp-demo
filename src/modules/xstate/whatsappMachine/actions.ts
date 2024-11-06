import { DateTime } from 'luxon';
import { assign } from 'xstate';

import { getAgeAndGenderFromImageURLUsingGroq } from '@/modules/groq';
import {
  type GenderAndAgeSchemaType,
  getAgeAndGenderFromImageURLUsingOpenAI,
  getImprovedPromptFromOpenAI,
} from '@/modules/openai';
import type { ICreateMessagePayload } from '@/modules/whatsapp/whatsapp';
import {
  callTrainingAPI,
  deleteTrainingImageURLs,
  generateAndSaveShortURLMap,
  getPhotoCount,
  getSeedUsingWhatsappMsgID,
  getTrainingImageURLs,
  getUserFields,
  incrementCreditsUsedTodayAndSetProcessingFlagFalse,
  setPaywallSentTimestamp,
  setPaywallSentTimestampDiscountSentFalse,
  setProcessingFlag,
  setRetriedFlag,
  setUserAgeAndGender,
  setUserLanguage,
  setUserState,
} from '@/utils/ReplyHelper/FirebaseHelpers';
import { sendUploadedImagesConfirmationUsingTrainingImageURLs } from '@/utils/ReplyHelper/MessageHelpers';
import { sendMessageToTelegram } from '@/utils/telegram';
import { getTranslation } from '@/utils/translations';

import {
  callCancelSubscription,
  checkExistingSubscription,
  checkTrainingJobForClient,
  createExperimentStripeLink,
  createReferralPromoCode,
  createStripeLink,
  getCreditsAvailability,
  getMembershipAvailability,
  notifyPendingPhotos,
  processAndSendImages,
  sendContactInfoMessage,
  sendIntroOptionsQuickReplyMessage,
  sendIntroQuickReplyMessage,
  sendPhotoUploadInstructionWithMainMenuButton,
  setUserStateAndInform,
} from './actionsHelper';
import type { IMachineConfig, IWhatsappInstance } from './types';

export async function sendMessage(
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
    sendIntroMessageBasedOnPhoneNumber: async () => {
      const subscriptionExists = await checkExistingSubscription(config);
      if (subscriptionExists) return;
      try {
        console.log('[~] attempting to sendIntroMessageBasedOnPhoneNumber');
        // use language based on phone number
        const { clientid, language = 'english' } = config.userMetaData;

        const languageButtonTextLocale = getTranslation('language', language);
        const finalLanguageButtonText = `Language${languageButtonTextLocale !== 'Language' ? ` | ${languageButtonTextLocale}` : ''}`;

        const message = `${getTranslation('intro message img', language)}`;

        await sendIntroQuickReplyMessage(
          clientid,
          message,
          getTranslation('upload photos', language),
          finalLanguageButtonText,
          getTranslation('tutorial', language),
        );
      } catch (err) {
        console.error('Error in sendIntroMessageBasedOnPhoneNumber:', err);
        await sendMessageToTelegram(
          `Error in sendIntroMessageBasedOnPhoneNumber: ${err}`,
        );
      }
    },
    sendIntroMessage: async (event: any) => {
      const subscriptionExists = await checkExistingSubscription(config);
      if (subscriptionExists) return;

      try {
        const { clientid } = config.userMetaData;
        const language = event?.context?.language || 'english';

        const languageButtonTextLocale = getTranslation('language', language);
        const finalLanguageButtonText = `Language${languageButtonTextLocale !== 'Language' ? ` | ${languageButtonTextLocale}` : ''}`;

        const message = `${getTranslation('intro message img', language)}`;

        await sendIntroQuickReplyMessage(
          clientid,
          message,
          getTranslation('upload photos', language),
          finalLanguageButtonText,
          getTranslation('tutorial', language),
        );
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
    // New flow: Take images first
    sendIntroOptionsMessageBasedOnPhoneNumber: async (event: any) => {
      const subscriptionExists = await checkExistingSubscription(config);
      if (subscriptionExists) return;
      try {
        console.log(
          '[~] attempting to sendIntroOptionsMessageBasedOnPhoneNumber',
        );
        // use language based on phone number
        const { clientid, language = 'english' } = config.userMetaData;

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

              await sendIntroOptionsQuickReplyMessage(
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
          await sendIntroOptionsQuickReplyMessage(
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
      const subscriptionExists = await checkExistingSubscription(config);
      if (subscriptionExists) return;
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

              await sendIntroOptionsQuickReplyMessage(
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
          await sendIntroOptionsQuickReplyMessage(
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
    sendPhotoUploadInstructionWithMenuButton: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      await sendPhotoUploadInstructionWithMainMenuButton(clientid, language);
    },
    sendPhotoUploadInstruction: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const photoInstructionImageLink =
        'https://firebasestorage.googleapis.com/v0/b/paparazzi-ai.appspot.com/o/sample_images%2Fphoto_instruction.png?alt=media&token=5982c2d9-8ccf-47c1-8a03-eef5ab61d280';
      const message = getTranslation('photo upload instruction', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: clientid,
        image: true,
        imageLink: photoInstructionImageLink,
        imageCaption: message,
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
      const userFields = await getUserFields(clientid);
      const { loraFilename, loraURL, state, trainingImageURLs } = userFields;
      const stateJSON = state ? JSON.parse(state) : {};
      if (loraURL && loraFilename) {
        stateJSON.value = 'photoPrompting';
        message = getTranslation('model already exists', language);
        await Promise.all([
          setUserState(JSON.stringify(stateJSON), clientid),
          sendMessageToTelegram(`${clientid}: ${message}`),
          config.whatsappInstance.send({
            phoneNumber: clientid,
            text: true,
            msgBody: message,
          }),
        ]);
        return;
      }

      // TODO: face crop images if possible
      // const finalTrainingImageURLs = await processTrainingImages(
      //   clientid,
      //   trainingImageURLs,
      // );

      await callTrainingAPI(clientid, trainingImageURLs)
        .then(async (response) => {
          if (response.jobId)
            console.log(`[+] callTrainingAPI job created: ${response.jobId}`);
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
        let result: GenderAndAgeSchemaType | null;
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
          await Promise.all([
            setUserAgeAndGender(clientid, 30, 'male'),
            config.storeInstance.setContext(clientid, 'age', 30),
            config.storeInstance.setContext(clientid, 'gender', 'male'),
          ]);
        }
      } catch (error) {
        console.error('Error in saveAgeAndGenderUsingOpenAI:', error);
      }
    },
    notifyModelExists: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      const message = getTranslation('model already exists', language);
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
      let message;
      let shortenedStripeLink = event?.context?.shortenedStripeLink;
      if (shortenedStripeLink === '' || !shortenedStripeLink) {
        createStripeLink(clientid)
          .then(async (stripeLink) => {
            console.log('Created Stripe link:', stripeLink);
            shortenedStripeLink = await generateAndSaveShortURLMap(
              stripeLink,
              clientid,
            );
            console.log('Generated and saved short URL:', shortenedStripeLink);
            return shortenedStripeLink;
          })
          .then(async (shortLink) => {
            await config.storeInstance.setContext(
              clientid,
              'shortenedStripeLink',
              shortLink,
            );
            message = `${getTranslation('new paywall message 1', language)}\n${shortLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortLink}`;
            await config.whatsappInstance.send({
              phoneNumber: clientid,
              text: true,
              msgBody: message,
            });
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
        message = `${getTranslation('new paywall message 1', language)}\n${shortenedStripeLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortenedStripeLink}`;
        await config.whatsappInstance.send({
          phoneNumber: clientid,
          text: true,
          msgBody: message,
        });
      }
    },
    sendExperimentPaywall: async (event: any) => {
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
      let message;
      let shortenedStripeLink = event?.context?.shortenedStripeLink;
      if (shortenedStripeLink === '' || !shortenedStripeLink) {
        createExperimentStripeLink(clientid)
          .then(async (stripeLink) => {
            console.log('Created Stripe link:', stripeLink);
            shortenedStripeLink = await generateAndSaveShortURLMap(
              stripeLink,
              clientid,
            );
            console.log('Generated and saved short URL:', shortenedStripeLink);
            return shortenedStripeLink;
          })
          .then(async (shortLink) => {
            await config.storeInstance.setContext(
              clientid,
              'shortenedStripeLink',
              shortLink,
            );

            message = `${getTranslation('new paywall message 1', language)}\n${shortLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortLink}`;
            await config.whatsappInstance.send({
              phoneNumber: clientid,
              text: true,
              msgBody: message,
            });
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
        message = `${getTranslation('new paywall message 1', language)}\n${shortenedStripeLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortenedStripeLink}`;
        await config.whatsappInstance.send({
          phoneNumber: clientid,
          text: true,
          msgBody: message,
        });
      }
    },
    setPaywallSentTimestampDiscountSentFalse: async () => {
      const { clientid } = config.userMetaData;
      await setPaywallSentTimestampDiscountSentFalse(clientid);
    },
    setPaywallSentTimestamp: async () => {
      const { clientid } = config.userMetaData;
      await setPaywallSentTimestamp(clientid);
    },
    sendUploadedImagesConfirmation: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      await sendUploadedImagesConfirmationUsingTrainingImageURLs(
        clientid,
        language,
      );
    },
    deleteImages: async () => {
      const { clientid } = config.userMetaData;
      await deleteTrainingImageURLs(clientid);
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

      let payload: ICreateMessagePayload;
      let message;

      // Run prompt through openai moderation
      // const isPromptSafe = await isTextSafe(prompt, clientid);
      // if (!isPromptSafe) {
      //   message = getTranslation('nsfw error', language);
      //   payload = {
      //     phoneNumber: clientid,
      //     text: true,
      //     msgBody: message,
      //   };
      //   await config.whatsappInstance.send(payload);
      //   return;
      // }

      const clientData = await getUserFields(clientid);

      async function getMachineAvailability() {
        console.log(
          '[t] sendPromptConfirmation machine availability: ',
          !clientData.processing,
        );
        return !clientData.processing;
      }

      await getMachineAvailability()
        .then(async (machineIsAvailable) => {
          if (!machineIsAvailable) {
            message = getTranslation('please wait machine busy', language);
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
          // truncating prompt as WhatsApp only allows sending 1024 characters
          // Using 950 to be safe since we're adding 'prompt confirmation' msg
          const truncatedPrompt =
            prompt?.length > 950 ? `${prompt.slice(0, 950)}...` : prompt;
          if (machineIsAvailable) {
            message = `${getTranslation('prompt confirmation', language)}
*${truncatedPrompt}*`;
            payload = {
              phoneNumber: clientid,
              quickReply: true,
              button1id: 'use prompt',
              button2id: 'improve prompt',
              button1: getTranslation('use prompt', language),
              button2: getTranslation('improve prompt', language),
              msgBody: message,
            };
            await config.whatsappInstance.send(payload);
          }
        })
        .catch(async (error) => {
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
      const prompt: string = event?.context?.latestPrompt;
      async function getImprovedPromptSetItInContext() {
        await setProcessingFlag(clientid, true);
        const openAIPrompt = await getImprovedPromptFromOpenAI({
          prompt,
          age,
          gender,
        });
        const improvedPrompt = openAIPrompt.prompt;
        await Promise.all([
          setProcessingFlag(clientid, false),
          config.storeInstance.setContext(
            clientid,
            'latestPrompt',
            improvedPrompt,
          ),
        ]);
        // overwrite latestPrompt with improvedPrompt
        return improvedPrompt;
      }
      getImprovedPromptSetItInContext()
        .then(async (improvedPrompt: string) => {
          // console.log('[+] improved prompt set it context');
          const message = `${getTranslation('prompt confirmation', language)}
  *${improvedPrompt}*`;
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
        const openAIPrompt = await getImprovedPromptFromOpenAI(improvedPrompt);
        const reImprovedPrompt = openAIPrompt.prompt;
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
      const prompt = `realistc photograph of ${age} year old ${genderCommon} person${clientid} ${event?.context?.latestPrompt}`;

      let message;
      let payload: ICreateMessagePayload;
      const clientData = await getUserFields(clientid);

      async function getMachineAvailability() {
        console.log('[t] machine availability: ', !clientData.processing);
        return !clientData.processing;
      }

      // if machine available && credits available, then send prompted photo
      await getMachineAvailability()
        .then(async (machineIsAvailable) => {
          if (!machineIsAvailable) {
            message = getTranslation('please wait machine busy', language);
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
            // Set Machine Busy
            await setProcessingFlag(clientid, true);
            console.log('[t] set machine unavailable');

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
                message = getTranslation('membership expired', language);
                const stateJSON = JSON.parse(clientData.state);
                stateJSON.value = 'paywall';

                let shortenedStripeLink = event?.context?.shortenedStripeLink;
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
                      await config.storeInstance.setContext(
                        clientid,
                        'shortenedStripeLink',
                        shortLink,
                      );
                      message = `${getTranslation('new paywall message 1', language)}\n${shortLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortLink}`;
                      await config.whatsappInstance.send({
                        phoneNumber: clientid,
                        text: true,
                        msgBody: message,
                      });
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
                  message = `${getTranslation('new paywall message 1', language)}\n${shortenedStripeLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortenedStripeLink}`;
                  await config.whatsappInstance.send({
                    phoneNumber: clientid,
                    text: true,
                    msgBody: message,
                  });
                }
              } else {
                message = getTranslation('unknown error', language);
                await config.whatsappInstance.send({
                  phoneNumber: clientid,
                  text: true,
                  msgBody: message,
                });
              }
              // Stop the chain
              await setProcessingFlag(clientid, false);
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
          await Promise.all([
            sendMessage(config.whatsappInstance, message, clientid),
            setProcessingFlag(clientid, true),
          ]);

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

    sendPromptedContextPhoto: async (event: any) => {
      const {
        age = 26,
        gender = 'male',
        clientid,
        language = event?.context?.language,
      } = config.userMetaData;

      const stringifiedPromptJSON = event?.event?.message;
      const parsedJSON = JSON.parse(stringifiedPromptJSON);
      if (!parsedJSON.contextMessageID || !parsedJSON.message) return;
      let message;

      const { contextMessageID } = parsedJSON;
      const genderCommon = gender === 'male' ? 'man' : 'woman';
      const prompt = `realistc photograph of ${age} year old ${genderCommon} person${clientid} ${parsedJSON.message}`;

      await config.storeInstance.setContext(clientid, 'latestPrompt', prompt);

      console.log('[t] contextMessageID, prompt: ', contextMessageID, prompt);

      const seed = await getSeedUsingWhatsappMsgID(clientid, contextMessageID);

      let payload: ICreateMessagePayload;
      const clientData = await getUserFields(clientid);

      async function getMachineAvailability() {
        console.log('[t] ctx machine availability: ', !clientData.processing);
        return !clientData.processing;
      }

      await getMachineAvailability()
        .then(async (machineIsAvailable) => {
          if (!machineIsAvailable) {
            message = getTranslation('please wait machine busy', language);
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
            // Set Machine Busy
            await setProcessingFlag(clientid, true);
            console.log('[t] ctx set machine unavailable');

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
                message = getTranslation('membership expired', language);
                const stateJSON = JSON.parse(clientData.state);
                stateJSON.value = 'paywall';

                let shortenedStripeLink = event?.context?.shortenedStripeLink;
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
                      await config.storeInstance.setContext(
                        clientid,
                        'shortenedStripeLink',
                        shortLink,
                      );
                      message = `${getTranslation('new paywall message 1', language)}\n${shortLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortLink}`;
                      await config.whatsappInstance.send({
                        phoneNumber: clientid,
                        text: true,
                        msgBody: message,
                      });
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
                  message = `${getTranslation('new paywall message 1', language)}\n${shortenedStripeLink}\n${getTranslation('new paywall message 2', language)}\n\n${shortenedStripeLink}`;
                  await config.whatsappInstance.send({
                    phoneNumber: clientid,
                    text: true,
                    msgBody: message,
                  });
                }
              } else {
                message = getTranslation('unknown error', language);
                await config.whatsappInstance.send({
                  phoneNumber: clientid,
                  text: true,
                  msgBody: message,
                });
              }
              // Stop the chain
              await setProcessingFlag(clientid, false);
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

          processAndSendImages(config, prompt, seed)
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
    cancelSubscription: async (event: any) => {
      const { clientid, language = event?.context?.language } =
        config.userMetaData;
      let message;
      let payload: ICreateMessagePayload;
      callCancelSubscription(clientid)
        .then(async (isSubscriptionCancelled) => {
          if (isSubscriptionCancelled) {
            message = getTranslation('cancellation success', language);
          } else {
            message = getTranslation('cancellation fail', language);
          }
          payload = {
            phoneNumber: clientid,
            text: true,
            msgBody: message,
          };
          await config.whatsappInstance.send(payload);
        })
        .then(async () => {
          message = getTranslation('prompting instruction', language);
          payload = {
            phoneNumber: clientid,
            text: true,
            msgBody: message,
          };
          await config.whatsappInstance.send(payload);
        });
    },
    sendCancellationCancelled: async (event: any) => {
      const { language = event?.context?.language } = config.userMetaData;
      const message = getTranslation('cancellation cancelled', language);
      const payload: ICreateMessagePayload = {
        phoneNumber: config.userMetaData.clientid,
        text: true,
        msgBody: message,
      };
      await config.whatsappInstance.send(payload);
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
