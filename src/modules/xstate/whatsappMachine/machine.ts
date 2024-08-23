// machine.ts

import { assign, createMachine } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6IAjNoDsAVgB02nQE4AHHbsXjxs3e0BfL-rRYcfCJSSjArZQAhGXQAJwhKKDoABQAZFgBBABFOJIAJFgAVFl4xSSQQWXlFZVUNBAsANgarYx0LUU0LToBmB1ELfSMEY27ja1F3ZwazCZ1pnz8MbDxCEnIqcIoo2PiKRJT0+gBxWnSjkQlVSoUlFXK60bsrbu0G2wnjZxezQZMx7qsTXa2mBDnMmgaCxA-mWQTWoU22ziCWogmOKT4uVKVzkNxq90Q3Q6VlEZlMFm05ledlE2m6vwQLlEVhmlleoj6DncFihMMCqxCG0i0WRe2oSRYACUCrQToJeBcytJcdU7qAHsTSeTKWZqbT6YZEGZNGYWe1aWTulaGh1eUt+cF1mFhTsUelJekItwAMLY8rXVW1QmaskgnV6ukMrqaFmeClchwWGndTR2gIrR0Il2ixJJSU+7jHP3Kqq3IMIK3WYwOByWDlmFMOboNBk6bTPN6aRxmaYWY1NtOwgVOxEi3aJGVFfPpFLFioqssEivdKs1uu1xvNhnaZxWOwvCH7ru2BrdQcO+FCrZjlEEdKFzgENG0OcBxfq4MxrVhqkNGmRw1hjMU1gU0bovlEOx3F1c8M0vZ1r1dMUADEZxSCJ0m9RhXwXfEPwrENtV-f8DSGLk91aOwGk0YxRE7EYz18aF7TgwUwjIABbdAYFgbgKGIGQONwAAbMBMBoPJChYThJUEb1BG4AA1QRMhw0s8PUI0LABLs2WbMYZjohk3CcKxOmMP8+kcbpgO8Ji+VYkdOO4uA+IEoTRPE6hznoQQPQKQRHxYTJBFnS5-VwtVNOGNxmS5NlPlEOiaOM0YQMmKiZlaV4zFguE2KsZyeLcwSRLEmhvUOeSwqVed1KiupT3GMZaWohwaNJAZANMBprFDKi7DMJxXkheyWPypyuOK-jSs8mhUJSdDMOw8KSzxBrECbGNdRBT4LJGbRa2MyCAQcajKR1GykocPLhwRGAqBiLAEgIGQIDAYTqAIYLQs4Hy-PSALVNWur1vLaDmWbJLTCcHsaz0bqrXbJoDpNdobKtW7Mw2B6wCexQ9le97PoWpasLUsGlzGRpnnrU9q20blNGMuljDMmybWpNwXEYxZ0wmhEOLej6jjAR6sEgWgKFwdAyAgagIloABNThvVkzJuAKEoQbfDS6m0fpmU0OmztrXqrRZiErAsKyiWNWZPix+CrCF4nRfF8SIClmW5YVpWknSfgKcDJdKV3Y9XHag3nGZxG3haVpqMsSjKydgrXZFsW8Ylr3pdl+XKvoarg-faLGYmKwazNikuzsTofm6z5TXMJNRF6cxHGMNORwz4T3ezz3vfz8V0iVp96AKVWWHoZDuElJ9gdq3WNoQMOngj6sdEguuWaaa3zHcCz-z7bvBeFvus-xyAkmHtXBEBwLJKKEu9cQDv2w6aHOTO0YHFS3dGg2y5I4P8rhT4bF7v3K+EAb6+wiP7QO2sl6RXLO-EkxsJjf3pn-RGbc9xDWNg0CyOpOjgLCJAy+OdYEFyqqFF+K8QR9BaK8FuRIDbVgbkMHqcUaS1hcBYbSFlRp8yHNjMIuBUAyEwDIJIMRSoE1zJKFgBAkgFHoeWIkxI6Tmi5KeSkK4WaM2tmMTwwEVwWUgmQqwEipEyLkUJBR4olEqLUcYZB9UNFtyNiCWkNsDbNgRlw8ke5DrmSgh0KOVibHSNkfIlEtAFQ5Gcao9RS4iSuBsGCCk7g3i6jsAyQazRepJgaFtOuXQomSJifY3AjjuAqKUcpJJyiUk6xQaHTKzw+ztDrqYSC7UGSJhjJSJMvR9xuBBDyMa-M7obGiXYuJYpC7FzaR4tJbc+p9H1JoWuOhOFaQcICXoEJRjJS7D4JiFBhbwHKA5AWVAcRrPwgAWhbIBV5VjszjkeZTfC5gAR0i7ImXqg0dzGBZuRSC7RowQhtC8KxRVXIzQ8uVH5Id8JDTZnbeMxtGiMy6lw0YzQazuBbhZGYJ9pmiOdrjfGL1z5otLnUFqppykTDeBSKiXJUovBJD4oargbZklylSi86dz5QJzkPOWjLX6r1pO2HsdZPC0S7G3VKJoWilMIY0TQCZebMRmWIl2ErKGe2obKhh2l2yMzDJBBsXRgKpSIWZIaK5tIeC+JU2xsSHEJEtZ4-oNgfGfDaLRaiqVLAshrDRUwVE9oXK8EAA */
      id: 'whatsappMachine',
      initial: 'onBoarding',
      context: {
        message: '',
        latestPrompt: '',
        latestImprovedPrompt: '',
        creditsRemaining: DEFAULT_CREDITS,
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
          entry: ['sendIntroOptionsMessage', 'assignDefaultValues'],
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
            MAIN_MENU: {
              actions: ['assignMessage', 'sendIntroOptionsMessage'],
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
            GENERATE_MODEL: {
              target: 'generatingModel',
              actions: ['callStartTrainingAPI'],
            },
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
        modelGeneratedUnpaid: {
          entry: ['sendUnpaidUserOptions'],
          on: {
            BUY_CREDITS: {
              actions: ['sendPaymentInstructions'],
            },
            BYPASS: {
              actions: assign({ message: () => 'Bypass modelGeneratedUnpaid' }),
              target: 'modelGeneratedPaid',
            },
            CANCEL: {
              target: 'modelGeneratedUnpaid',
              reenter: true,
            },
            // TODO: Code payments
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
                guard: 'machineIsAvailable',
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
