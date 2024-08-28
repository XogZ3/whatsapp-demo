// machine.ts

import { assign, createMachine, not } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        latestPrompt: '',
        latestImprovedPrompt: '',
        freeTrialCredits: DEFAULT_CREDITS,
        modelGenerated: false,
        language: 'english',
      } as IMachineContext,
      on: {
        UNKNOWN_ISSUE: {
          target: '.onBoarding',
          actions: 'sendIntroOptionsMessage',
        },
      },
      states: {
        onBoarding: {
          entry: ['assignDefaultValues'],
          on: {
            UPLOAD_PHOTOS: {
              actions: 'assignMessage',
              target: 'imagesIncomplete',
            },
            LANGUAGE: {
              actions: ['sendSelectLanguage', 'assignMessage'],
            },
            ENGLISH: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroOptionsMessage',
              ],
            },
            PORTUGUESE: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroOptionsMessage',
              ],
            },
            ARABIC: {
              actions: [
                'assignMessage',
                'assignLanguage',
                'setLanguageInFirebase',
                'sendSelectedLanguage',
                'sendIntroOptionsMessage',
              ],
            },
            PRICING: {
              actions: ['assignMessage', 'sendPricing'],
            },
            TUTORIAL: {
              actions: ['assignMessage', 'sendTutorial'],
            },
            FALLBACK: {
              actions: ['sendIntroOptionsMessage'],
            },
          },
        },
        imagesIncomplete: {
          entry: ['sendPhotoUploadInstruction'],
          on: {
            PHOTO_RECEIVED: {
              actions: [assign({ message: () => 'photo received' })],
            },
            GENERATE_MODEL: [
              {
                guard: not('modelAlreadyGenerated'),
                target: 'generatingModel',
                actions: ['callStartTrainingAPI'],
              },
              {
                actions: ['notifyModelExists'],
                target: 'photoPrompting',
              },
            ],
            FALLBACK: {
              actions: ['sendPendingPhotos'],
            },
          },
        },
        generatingModel: {
          entry: ['sendGeneratingModel'],
          on: {
            FALLBACK: {
              actions: 'sendPleaseWaitGeneratingModel',
            },
          },
        },
        modelGeneratedFreeTrial: {
          on: {
            PROMPT: [
              {
                guard: not('hasFreeTrialCredits'),
                target: 'paywall',
              },
              {
                actions: [
                  'assignMessage',
                  'assignPromptToContext',
                  'sendPromptConfirmation',
                ],
              },
            ],
            USE_PROMPT: [
              {
                guard: not('hasFreeTrialCredits'),
                target: 'paywall',
              },
              {
                actions: [
                  'assignMessage',
                  'setProcessingTrue',
                  'sendPromptedPhoto',
                ],
              },
            ],
            IMPROVE_PROMPT: [
              {
                guard: not('hasFreeTrialCredits'),
                target: 'paywall',
              },
              {
                actions: [
                  'assignMessage',
                  'sendImprovedPromptConfirmationAndSetContext',
                ],
              },
            ],
          },
        },
        paywall: {
          entry: ['sendPaywall'],
          on: {
            BUY_CREDITS: {
              actions: ['sendStripeLink'],
            },
            SECRET: { target: 'photoPrompting' },
            CANCEL: { actions: 'sendPaywall' },
            FALLBACK: { actions: 'sendPaywall' },
          },
        },
        photoPrompting: {
          entry: ['sendPromptingInstruction'],
          on: {
            PROMPT: [
              {
                actions: [
                  'assignMessage',
                  'assignPromptToContext',
                  'sendPromptConfirmation',
                ],
              },
            ],
            USE_PROMPT: {
              actions: [
                'assignMessage',
                'setProcessingTrue',
                'sendPromptedPhoto',
              ],
            },
            IMPROVE_PROMPT: {
              actions: [
                'assignMessage',
                'sendImprovedPromptConfirmationAndSetContext',
              ],
            },
            CANCEL: {
              actions: ['sendPromptingInstruction'],
            },
            SECRET: 'wipPhotoPrompting',
          },
        },
        wipPhotoPrompting: {
          on: {
            PROMPT: [
              {
                actions: [
                  // 'decrementCredits',
                  'assignMessage',
                  'assignPromptToContext',
                  'sendWIPPromptConfirmation',
                ],
              },
            ],
            USE_PROMPT: {
              actions: ['assignMessage', 'sendWIPPromptedPhoto'],
            },
            IMPROVE_PROMPT: {
              actions: [
                'assignMessage',
                'sendImprovedPromptConfirmationAndSetContext',
              ],
            },
            CANCEL: {
              actions: ['sendPromptingInstruction'],
            },
            PAYWALL: { target: 'paywall' },
            SECRET: { target: 'photoPrompting' },
          },
        },
        // improvePrompt: {
        //   // entry: ['sendTestMessage'],
        //   invoke: {
        //     // id: 'fetchImprovedPrompt',
        //     src: fromPromise(async (context: any) => {
        //       console.log('[+] invoke: ', JSON.stringify(context, null, 2));
        //       const improvedPrompt = await getImprovedPromptFromGroq(
        //         context.context.userMetaData.latestPrompt,
        //       );
        //       console.log('[+] improvedPrompt: ', improvedPrompt);
        //       return improvedPrompt;
        //     }),
        //     // input: ({ context: { latestPrompt } }) => ({ latestPrompt }),
        //     onDone: {
        //       target: 'photoPrompting',
        //       actions: [
        //         assign((event: any) => {
        //           console.log('[-] on Done: ', JSON.stringify(event, null, 2));
        //           return {
        //             latestImprovedPrompt: 'error',
        //           };
        //         }),
        //         // assign({
        //         //   latestImprovedPrompt: ({ event }) => event.output,
        //         // }),
        //         'sendPromptConfirmation',
        //       ],
        //     },
        //     onError: {
        //       target: 'photoPrompting',
        //       actions: assign((event: any) => {
        //         console.log('[-] error: ', JSON.stringify(event, null, 2));
        //         return {
        //           latestImprovedPrompt: 'error',
        //         };
        //       }),
        //     },
        //   },
        // },
      },
    },
    {
      guards: guardsFactory(config),
      actions: actionsFactory(config),
    },
  );
};
