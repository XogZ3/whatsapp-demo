// machine.ts

import { assign, createMachine, not } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6JtARgAcJgHRnR2gJyiAzJoCs2l2bMBfL-rRYcfCJSSjBLZQAhGXQAJwhKKDoABQAZFgBBABFOJIAJFgAVFl4xSSQQWXlFZVUNBAA2RzNLOwB2F1E7etbWuxMTTX0jBFMuls167UcTOzNNTTNtTR8-DGw8QhJyKnCKKNj4ikSU9PoAcVp0s5EJVUqFJRVyuscOy1adF3qujtETR3cQ2MonqzTMvTsbRcjnqJm+y18IH86yCW1Cu32cQS1EE5xSfFypTucgeNWeiEcr0sC3aCyadhcLlaQIQ5nqLha2iWZhhHzMDJWSLWgU2IR2kWiWKO1CSLAASgVaBdBLwbmVpCTqk9QC8qTSXHT+YzmYZEHDJi16pourN-pNRAjVgENsFtmEJQdsek5ekItwAMJE8r3LW1Cl68EGnlGpksgb1USWUSiD6MhlTCaC5Ei13oj1SxJJOUB7jnIMaqqPMMIGH1SwJjpfTROOyaAaOOOU1qWJmppw9ZygrPCl1o8V7SWHRKKorF9IpcsVTVV8k1+p1huiJsttuaDum1mmDkDD7zGwZ7yI7OjsXuiee6UAMXnKQi6X9jEXIZXOvDHP1hoMrGB79DMPYuJC0yvK0sLaMOzqorelhkAAtugMCwNwFDEDIKG4AANmAmA0HkhQsJwcqCP6gjcAAaoImRfsuZK-ggkJWNMLgmNoyYgp4JgsqYJiJmY7IWBYswAuy8EoqKbrIWhGFYTheGEcR1DXPQgg+gUgicAQLCZIIC63MGzHauoZpTN22iLJMrSjDyLiCVydaOJCjJMgMdgwi4Mk5mOYSoehcDKbhBFETQmnaekun6YZxnCCY6pLpWLGWYejg2XZ2gOTMTmCf8IncQ6XKtLYyaOkKCFyeiwVKdh4VqTQz4pK+76fqZFakhZdTsdSHTCV0Ng2Oygl-ByuU8g67SvHY-k3vJMBUDEWAJAQMgQGA+HUK17UfkxaW9WaEGOC0Pl9NxsKtCYMGFc2ljTH0bZ2LZrQWAtiHyShm3bWcYArVgkCPjEYBgAUMRkOgO1FiwBBJAUh09dWjTNFCnTdL0-SDAebZozyN3sh4HzvZ9tU7D9W34f9gPERAINgxDUMw3KcMI0lKXfuluocbYXwGg4p7aPULKvGd13WlyMLC5o7Rk7mFO-dTANgKtdMM+DkPQ3Qqo5Kz8OI11qXI6uqMtO0GM9JdOPDBMzS2eC-xW7luXy4FliU39Ktq8DoOa8zOt6bDBsc8SR3VtM2jWBb7QeAazay+NmiPfMkKuNMya2VV15feinvK7TvuM1rO3cPDrP0XrbOG5z5ko2B0a9Hb67uc5B7QsnjTOFb4IJksbtIfnNOq0D9N+0z2tl7DlfB+zyVhybrHC-brz9k0MEGv8LIWC03meAyCYtpeTqyQrYS4OgBjINDO3XAU+mCAQETabwuTcEkSOhqu3GMuBN25QnGEdgWQTDsD2HyN1OiQl6D0bOI5c47AvlfG+1BVT+kojXBeX9WLcSypYWywsXb5VeCyLi3ZTqQMhG0NorQB7ySQdffCO1-SnGoiZWu4dVyzCjgaDw1pPD8zmIJNo9Y2y3QBE4ewwlHB0PRAwlBe03wHSNlzY6bFFg9lcHMWYZhBE22BFHLcvkoS6IFrIxBqAZCYBkEkGI4VFDSlnpgsynCcGTGaE7eEDIHKvTMNvMYCxIwJmkY7cx59LHWNsfY7EtBdZOM-j+DKcI2z4J6KCdcMxIRjQPCTfBcJ3DTS4u4OCV54Hk3CVYmxdi8IOMSFPCuQd9bsxUXXb+xpHpuCJv8Nsbh9ENCWO8USxTWiOD+MLGRpSapn0sLgCJVTonShYfQNhCTuZmkmByHoZCpj2FEj5Uh9hLD5RGb46EDgSknwCkhWZlSok1OxGgjBqy1HtisHMP4Z4HSNFsCyBkbzRIzB0LLJkHgwmWGQGQXASQ5l3NwLUmUTTnHdWwRlAE3ZyruGut0KWfSHB1gsEsD4nQ9xGLBRCqFMLqlwpiXExFzyI4PV0U0H+vIExWhZO9ZOTQligi4j5EEcCpnu3JdC25VL4X1JYDPOlLTXEZWXvg1eWV17sjbCyDJLRemTFbCSj4ZLIWisieK7ESyVmysXqimE9YQW8J5FlYSbdhhfDclaVsbrvEDH1RSsVCzCzpAAJpsBfPS02TRzYdC6FbbG29pjvEpN8L4yr-gTMuYtdEIrKW+tQVRJ55qUV1DNujSNWMBhxhTIYpo3xbJMmjCUxEFBfrwHKDncpWDEl1AALQiwPF2pMvFRA8gWNaFMTQwX5inG2tZNYpjUjhBnb470eTduGKMNywlkzTFAkOSZp93b1VCo1VSkVJ1qJ8hyDwwtuKtkaCMly-QBqUmmFaUZGywXLRHrUjaVMT3VhMBBSaPFzBDR0NxFyD08VE2VWQsFQ9vajw1hPfCP7VwAjAQmZlklwROD6R0bs+9Zhpz-cLdcYL5FMOQ6xBkyd7A3VuqjU8ICfLWHybxV6MEASkczfco4FGkn-vwYBiwxLTB6BAluRMMEWU3SbPNHdVz5IZp9dxqAvGXjWjjcmRk7kEwLDLbCJM2iboQi+CMnwPggA */
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
                guard: 'hasFreeTrialCredits',
                actions: [
                  'assignMessage',
                  'assignPromptToContext',
                  'sendWIPPromptConfirmation',
                ],
              },
              {
                guard: not('hasFreeTrialCredits'),
                target: 'paywall',
              },
            ],
            USE_PROMPT: [
              {
                guard: 'hasFreeTrialCredits',
                actions: [
                  'assignMessage',
                  'sendWIPPromptedPhoto',
                  'decrementFreeTrialCredits',
                ],
              },
              {
                guard: not('hasFreeTrialCredits'),
                target: 'paywall',
              },
            ],
            IMPROVE_PROMPT: [
              {
                guard: 'hasFreeTrialCredits',
                actions: [
                  'assignMessage',
                  'sendImprovedPromptConfirmationAndSetContext',
                ],
              },
              {
                guard: not('hasFreeTrialCredits'),
                target: 'paywall',
              },
            ],
          },
        },
        paywall: {
          entry: ['sendPaywall'],
          on: {
            GET_MEMBERSHIP: {
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
