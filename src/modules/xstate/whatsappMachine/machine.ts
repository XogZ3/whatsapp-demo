// machine.ts

import { assign, createMachine, not } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6IAjNoDsAVgB02nQE4AHHbsXjxs3e0BfL-rRYcfCJSSjArZQAhGXQAJwhKKDoABQAZFgBBABFOJIAJFgAVFl4xSSQQWXlFZVUNBAsANgarYx0LUU0LToBmB1ELfSMEY27ja1F3ZwazCZ1pnz8MbDxCEnIqcIoo2PiKRJT0+gBxWnSjkQlVSoUlFXK60bsrbu0G2wnjZxezQZMx7qsTXa2mBDnMmgaCxA-mWQTWoU22ziCWogmOKT4uVKVzkNxq90Q3Q6VlEZlMFm05ledlE2m6vwQLlEVhmlleoj6DncFihMMCqxCG0i0WRe2oSRYACUCrQToJeBcytJcdU7qAHsTSeTKWZqbT6YZEGZNGYWe1aWTulaGh1eUt+cF1mFhTsUelJekItwAMLY8rXVW1QmaskgnV6ukMrqaFmeClchwWGndTR2gIrR0Il2ixJJSU+7jHP3Kqq3IMIK3WYwOByWDlmFMOboNBk6bTPN6aRxmaYWY1NtOwgVOxEi3aJGVFfPpFLFioqssEivdKs1uu1xvNhnaZxWOwvCH7ru2BrdQcO+FCrZjlEAMRnKQi6W9jDnAcX6uDMa1YapDRpkaGggXJ7q0dgNJoxiiJ2Ixnr40L2hml5hGQAC26AwLA3AUMQMiobgAA2YCYDQeSFCwnCSoI3qCNwABqgiZG+C74p+CCWACXZss2YwzNBDJuE4VidMY-59I43RmLq55IYKKHoZh2G4fhREkdQ5z0IIHoFIInAECwmSCLOlz+ixarqH8UFWFybKfKI0GQQJoymq4HjgTMrSvGYMlwnJVhoRhcBKXhhHETQGlaekOl6QZRnCMYSrzqWrEWcM7jtqMmgOD0pLgf0AmiPu1kQTuEyUiMIw+cOCIBYpOEhapNDeocNHGYl74pXUp7jGMtIQdlUGWAJrzWKG4F2GYTivJC8F8rJI61UF9UqWF1D3ikj7Pq+Jklni5l1E2Ma6iCnyiSM2i1gVRUOCVlLmJJ9kOFVmYbDAVAxFgCQEDIEBgAR1D6YZKScBF2mMcxyX7SYUnMs29mmE4PY1noQGwe2TTnSa7SSVaz3IVYb1gB9ih7N9v3-etm0vhDe3lmMjTPPWp7Vto3KaMNozCZJNrUm4LhwYs6a+SOqE-X9RxgO9WCQLQFC4OgZAQNQES0AAmpw3pUZk3AFCUO1JbTS7aP0zKaEzN21g0FhWsNEJWBY4lEsasyfHjfmi+TEtSyRECy-LivK6rSTpPwNOBkbO5PMerjZcbzjs6jzbtm4EJY2BlZuyLYsEV7RPS77csK0rzX0K1YcfqlrMTNZa5W7Y8d9gJnymuYSaiL05iOMYmcIh74uS3nPt+0X4rpKrBBogUGssPQt7cJKE9MfrHVQwglK7tH1Y6IVdgJ0MphNPb5juKJAF9j3Gx9znA-E5ASQj5rghRbpZFFOXnWIJ37YdPDnI3aMDgnK7kaA7Lkjh-yuAvmEK+udb4QHvgHCIQcQ563amZcsX8SRmwmH-ZmgDE7tz3JNM2DRRI6k6FAqwMCb75wQcXFqcVl7oKNg7ZkB9W5EmNtWH4qN2TWRpLWFwFhraiRmoLIcL0wi4FQDITAMgkgxBCiTXMkoWAECSAUd+q8iTEjpOaLkp5KQrmGqze2YxPBSRXKJQqlDpGyPkYo-CyjxSqPUZohKOJIbliJESYSIJaQO2NknJuII9wXREnYKCWUdC2JkXIhRSiUS0AVDkVxGitHeP6MYGwYIKTuDeLqOwDIJrNCtkmBoh1d5dFifYhJTiUTcHUaohiqS1HpKYV4o27lnh9naLvUwhVsoMkTDGSkSZej7jcCCHks1ELCwRHY+JjjcDOJLmXDphs2I+NGn0fUmguy73MAySwDhAS9AhKMByXYfDwQoGLeA5Q5rzKoJ4zZqUAC0LYgKfJJPZduDZOj7hAd4WZQtqpXiROOV54c2L3RsCmRwICJo7mMMNEChV2jRghDaF4lDFpYWWqFEi0KK51Emtkp28YzaNFZgMROoka7pUsKJGY59QUSPxoTYmX1s4ko-sMdopoqkTDeBScCXInIvBJP4yargHZkm8uyi87ts6wPzsPRWfLV7G0pCyXshUq5dnbk5E0LQKkkMaFlasAsEJgskVQ1VNCfZ0K1Rg627ZWZhkKg2LoUknKkOEpNFc1s3L7hqUsxJexXVLh0dYMZExDmuAck5SwLIayQVMOBU6NyvBAA */
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        latestPrompt: '',
        latestImprovedPrompt: '',
        creditsRemaining: DEFAULT_CREDITS,
        language: 'english',
        modelGenerated: false,
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
            CANCEL: {
              target: 'onBoarding',
            },
            FALLBACK: {
              actions: ['notifyPendingPhotos'],
            },
          },
        },
        generatingModel: {
          entry: ['sendGeneratingModel'],
          on: {
            MODEL_GENERATED: {
              actions: ['sendModelGeneratedSuccess'],
              target: 'modelGeneratedUnpaid',
            },
            FALLBACK: {
              actions: 'sendPleaseWait',
            },
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
        modelGeneratedUnpaid: {
          entry: ['sendUnpaidUserOptions'],
          on: {
            PAYMENT_CONFIRMED: {
              actions: ['sendPaymentConfirmation'],
              target: 'modelGeneratedPaid',
            },
          },
        },
        modelGeneratedPaid: {
          entry: ['sendPaidUserOptions'],
          on: {
            CREATE_PHOTO: 'photoPrompting',
            BYPASS: {
              target: 'photoPrompting',
              actions: 'assignMessage',
            },
            CANCEL: {
              target: 'modelGeneratedPaid',
              actions: 'assignMessage',
              reenter: true,
            },
          },
        },
        photoPrompting: {
          entry: ['sendPromptingInstruction'],
          on: {
            PROMPT: [
              {
                actions: [
                  // 'decrementCredits',
                  'assignMessage',
                  'assignPromptToContext',
                  'sendPromptConfirmation',
                ],
                // guard: 'hasSufficientCredits',
                // reenter: true,
              },
              {
                actions: ['sendPleaseWait'],
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
          entry: ['sendPromptingInstruction'],
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
              {
                actions: ['sendPleaseWait'],
              },
            ],
            USE_PROMPT: {
              actions: [
                'assignMessage',
                'setProcessingTrue',
                'sendWIPPromptedPhoto',
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
