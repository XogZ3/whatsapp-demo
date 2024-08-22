// machine.ts

import { assign, createMachine } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6IAjAA5TAdgB0mgMwA2Y-YsBWbQE5bL49oC+v-TQsHHwiUkowK2UAIRl0ACcISig6AAUAGRYAQQARTlSACRYAFRZeMUkkEFl5RWVVDQRTe00rCw93U1sLHU0Le30jBGN3UWse0Vtu4xdbU3dNf0CMbDxCEnIqKIpYhKSKFPSs+gBxWiyTkQlVGoUlFSrGx2t3Y273bQtO93tRY0GTD17FY5j0zH8LCM3EsQEFVqENhFtrtEslqIJTuk+AUKjc5Hd6o9EI5RG0HNpuuZjBZ2npDCYXBZSZ9tJonJoXO5PC4YXCQutwlsYnFUQdqLJ4pgAK5QKVwMC4qq3OoPUBPYykizkymmam0gHDWwLKwzMGaUbaZw6XkrflhTaRYV7NFZABKWWi3AAworpPiVQ1iRqyfYKRYqTTtHShj4zFZRL03rYOWyvDbgmt7UinaKUqlXd7uKdfdV-fdAwh7FM2v1tC5NKYxi4WqYDRr3C4rI5WR5un9nLZ0-CBQ7kSL9ilirRSgWsukS8ry0TK9WaaH643XC2De4tSbTKyOUbzdpjIsArDbZnEUKduO0QQskXOAQMbQF2XCWriaJtF2XJYjIJrYCbmAapguJqbiaI4bI-K4g4Xny16Co6d7OmKABUH61Eu36Vr+-6AUydiga29IIK4pgmoyHJvHWXxDnaN6RGQAC26AwLA3AUMQMhsbgAA2YCYDQhQlCwnCuoIXqCNwABqgg5DhBKquoJi2FGVgHpBv4diBXhtj0f72OY2jmPYzZsueywZgiqFWOxnFwDxfECcJonUOJpRSTJcmKcpxiVH6uFfupTQtG0HRdMZfQDBR3juFYnyhqetgzFWHJMSho5OVxrn8UJIk0NEACaqRZPwKkBsuxhmNYoiWQmohjEyEEGrB2lVkyXzzGMTjZfZuUcflvGFR5NBescsnztcSqfmpjR1aYrTJgx5pbjobYQdRdizH8v5MnMg0jkieUuWN7nFdQ2FzSFqkVmeZ7xpoLUco21IuG4bZNfGnifBB67mRYJ1ZlsMBUPEWDJAQMgQGAgnUAQLA5II6ScJc9CCO6xRKdVeHhelSVspBiWMpy+kGkaSWUj0bKWburg2ZedmneDYCQ9DByw-DiNlRVVV3aWoWLYgRM2DMohk64XKzAadakhqoZ9M2XKvMzyFDUiENgFDijc3DCPUFN9AzfjYWNOLJNS1CMuUxR1KjDYrKWH0RppTySFXlrWxsYbgknBzutYJAtAULg6BkBA1DRLQpWcF60k5NwxTlELi4Wz+nZS7pX2iCtjbuPLnQ0ZBHivVLXJpl7rNg5Efu84HnOiRAYcR1HMflZVafBcLD3Ls0rTtFyMW9P0Bqpl25hajBOgjD0oMsVYDcI03wct23kfRybZvpwtFaWcCsykwezQLBS8sNtp5pV583R2IvDkrwHQd66H4db15WSla+9DFAnLB6AADFuCulfMpPeIsKyDyiiPe+rJx4UXStRDUPg+g-EsL8KYj9RzPzXm-CAqRP6J0EFkXG+QiilHNqLYYTJFYKwcOGRsRpbAT28CaamLQ7CvUcMYHBSI8GvxDoQz+-Nu7UMenQk0DDnDmEmJ4KmX0rBfQQWuRqrJ+G+39vg4RRCO47zRhI2qOhiauBaqyX8MF0pUx8DYFojMei7k5AmTRkRcCoBkJgGQqR4iFX1nmV0LACCpGKEY-Cp5Gw2BVjbKsMxoxizeDRFW4Yfj2FMoyVxVh3GeO8b4gS-ivKBOCaEoKeIoG1VGJ2FoCsvivBGD4KmloazmgPJaLomk-A12HHXLJHivE+L8WiWgvBBD5CKSEsJ4URhaUgqGfovxTKTCMtYMuDZmztGTI4TJ2T+l5NwAU7gwTAmKTGUEiZkD+7hPBFEsx3hYnfQontZRK0wSWHqX0bZfTcmDLFAY2avcM40PqaSLkrgwzmT6GYcCxgrDqxHvC0QoxEIXgoIbeAVRNZszAGUy54UAC08UhgEvjC1P4R4Fj2H0p02y3Sl45gnDimq+FGQwtac2fO+cPqaG2nuXUEwRgfE0KmTJ51uKXSKqJRlBMloOFJOuBMWpGTpRcNtH4sLfjhjcNBTJOs9Yw39lKzOCAtoJVPBwtWHSHCeA1t7LFy9tFCI3h-KOhqaGMmsKmGk6tkxeCLkgkuxk7ljFeg4G1tcl6CObpAPREBXWPTmDC5sPgKSMl7E4CeiSpasi4RSEYWyunMQcjs75+TkhxtqnIqJdZy7eCFW8CenwQTK1MgsaklLkW+CAA */
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
            '*': {
              actions: ['sendIntroOptionsMessage'],
            },
          },
        },
        imagesIncomplete: {
          entry: ['sendPhotoUploadInstruction'],
          on: {
            PHOTO_RECEIVED: {
              guard: 'canUploadMorePhotos',
              actions: [
                'incrementPhotoCount',
                'sendPhotosReceivedCount',
                assign({ message: () => 'photo received' }),
              ],
            },
            GENERATE_MODEL: {
              guard: 'hasUploadedEnoughPhotos',
              target: 'generatingModel',
              actions: ['callStartTrainingAPI'],
            },
            BYPASS: {
              actions: assign({ message: () => 'Bypass imagesIncomplete' }),
              target: 'generatingModel',
            },
            CANCEL: {
              target: 'onBoarding',
            },
            '*': {
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
            BYPASS: {
              actions: [
                'sendModelGeneratedSuccess',
                'sendSamplePhotos',
                assign({ message: () => 'Bypass generatingModel' }),
              ],
              target: 'modelGeneratedUnpaid',
            },
            CANCEL: 'onBoarding',
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
