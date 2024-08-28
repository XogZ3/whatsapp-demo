// machine.ts

import { assign, createMachine, not } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6JtARgAcJgHRnR2gJyiAzJoCs2l2bMBfL-rRYcfCJSSjBLZQAhGXQAJwhKKDoABQAZFgBBABFOJIAJFgAVFl4xSSQQWXlFZVUNBAA2RzNLOwB2F1E7etbWuxMTTX0jBFMuls167UcTOzNNTTNtTR8-DGw8QhJyKnCKKNj4ikSU9PoAcVp0s5EJVUqFJRVyuscOy1adF3qujtETR3cQ2MonqzTMvTsbRcjnqJm+y18IH86yCW1Cu32cQS1EE5xSfFypTucgeNWeiEcr0sC3aCyadhcLlaQIQ5nqLha2iWZhhHzMDJWSLWgU2IR2kWiWKO1CSLAASgVaBdBLwbmVpCTqk9QC8qTSXHT+YzmYZEHDJi16pourN-pNRAjVgENsFtmEJQdsek5ekItwAMJE8r3LW1Cl68EGnlGpksgb1USWUSiD6MhlTCaC5Ei13oj1SxJJOUB7jnIMaqqPMMIGH1SwJjpfTROOyaAaOOOU1qWJmppw9ZygrPCl1o8V7SWHRKKorF9IpcsVTVV8k1+p1huiJsttuaDum1mmDkDD7zGwZ7yI7OjsXuiee6UAMXnKQi6X9jEXIZXOvDHP1hoMrGB79DMPYuJC0yvK0sLaMOzqorelhkAAtugMCwNwFDEDIKG4AANmAmA0HkhQsJwcqCP6gjcAAaoImRfsuZK-ggkJWNMLgmNoyYgp4JgsqYJiJmY7IWBYswAuy8EoqKbrIWhGFYTheGEcR1DXPQgg+gUgicAQLCZIIC63MGzHauoZpTN22iLJMrSjDyLiCVydaOJCjJMgMdgwi4Mk5mOYSoehcDKbhBFETQmnaekun6YZxnCCY6pLpWLGWYejg2XZ2gOTMTmCf8IncQ6XKtLYyaOkKCFyeiwVKdh4VqTQz4pK+76fqZFakhZdTsdSHTCV0Ng2Oygl-ByuU8g67SvHY-k3vJMBUDEWAJAQMgQGA+HUK17UfkxaW9WaEGOC0Pl9NxsKtCYMGFc2ljTH0bZ2LZrQWAtiHyShm3bWcYArVgkCPjEYBgAUMRkOgO1FiwBBJAUh09dWjTNFCnTdL0-SDAebZozyN3sh4HzvZ9tU7D9W34f9gPERAINgxDUMw3KcMI0lKXfuluocbYXwGg4p7aPULKvGd13WlyMLC5o7Rk7mFO-dTANgKtdMM+DkPQ3Qqo5Kz8OI11qXI6uqMtO0GM9JdOPDBMzS2eC-xW7luXy4FliU39Ktq8DoOa8zOt6bDBsc8SR3VtM2jWBb7QeAazay+NmiPfMkKuNMya2VV15feinvK7TvuM1rO3cPDrP0XrbOG5z5ko005sdF0VvYyyXHdqdN2dJCvQ9G7SH5zTqtA-TftM9rZew5Xwfs8lYcm6xwv268-ZNDBBr-CyFgtN5ngMgmLaXk6skK2EuDoAYyDQztES0AAmpw-qUZk3AFCURtc8dbHtNSI1fE4bYmT7mGO5M6XJRKiStOeBy-d5Ln0vtfagqon6CBrvPUMq5uJZUsLZYWLt8qvDbrdHsPku6QjaG0VosD0TwKvvhHa-pTjURMrXcOq5ZhRwNB4a0nh+ZzEEm0esbZboAicPYYSjhqE7FoYgvab4DofzruwxYPZXBzFmGYPhNtgRRy3L5KEmiBZSLPqgGQmAZBJBiOFRQ0oZ5oLMmw1icJbKWCdvCBkDlXpmC3mMBYkYEwSMdsYywuBTHmMsdY7EtBdZ2KRhgpxVorC5RgpAmYkIxoHhJjg5xHhHBbm4m4YJoSzEWKsXhGxiRJ4VyDvrdmijHEZRMMaR6bgib-EAUsFkkxk7vUmG4VoeSrqSKvCOXO0iwmlMidKRh9BmFxJ-I0vp7x2i3SmPYUSPk272FcbMAZXjoQODgiMmqp8QkTIieU7EyDKL2O6vExpe4rBzD+GeB0jRbAsgZE80SMwdCyyZB4YJyAyC4CSOcspuAKkylqbc429yXi5XeHza63QpbaLYiCaw3FZbNlbHk6EQKQVgpKRcyFUSYkwvmdzCkD1NFNAKbyBMVoWTvWTk0JYoIuI+RBNnUZ5MwjAtBeCqZlTy4sGnpS+pC8MpLxwSvLKa92Rti6bCFobgJj2HmHkj4hKhUkohVCmZcypXwvDBuAFXCeRZWEs5A8Xw3JWlbE6jxAxdXEvCQa7ESR0h3zYC+KlX8zbo2bljAYW9pjvEpN8L4Cr-jDOPgFJCgr3WTMudKa5qCA31zRhbEN1s4wpl0U0b4tkmTRiOYiCgv14DlBzvy9BCy6gAFoRYHibRychnau2QWCfmKcDbqU1imNSOEGdvjvR5K24Yow3LCWTNMUCQ5jkn3dvVUKjVVKRQHV-HyHIPDC24q2RoAyXL9AGpSaYVo8l9OCctYeFSNpU23dWJpDIcE8XMENHQ3EXIPQcOuRkCr27BMHt7EeGtx74WfauAEdh6xOAktGcqzg24pmsPyWYacmnC3XEUi+dCoMOOlX1A0OC2j9BgmveYLJrRnQsPaZMr1KNHITYtGhwq01QGg04iCk0P0WE6N+vQIEtyJhggym6TZ5rLsTfJZNHGyVHG4xlZwcGBnJkA10B03iROqtEOom6EIvgDJ8D4IAA */
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
