// machine.ts

import { assign, createMachine, not } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6IAjMYBs2gHTbjAdgActgKz3RogJzGPAX2-60WDj4RKSUYJbKAEIy6ABOEJRQdAAKADIsAIIAIpzJABIsACosvGKSSCCy8orKqhoITtoAzJZmxtpOpqLa9pqaTpr6RgimtraWTW3aovb27k1uTfa+-hjYeIQk5FQRFNFxCRRJqRn0AOK0GWciEqpVCkoqFfULopZOUx-2Tdq22ja2IYmUSadzWdygpx-cxNWErEABdbBLZhXb7eKJaiCc6pPh5Mp3OQPWrPRA9JwTUQWJw04w6f6AwyIXpmCZNWyaMwzaY9HTwxFBTahHZRGIYo7UZIsABKhVoF0EvBu5WkRJqT1A9XJlOptPpvyBCDMmha7Pc7mNOh0TScTX5a0FIW24VFB0xGWlGUi3AAwgSKvd1XUyfYKQtdZ19Yzhn03vTOa4esZ7GZJvbAhsnajXeKkslpb7uOd-arqo9gwgmuZLNbbBZNN9mlymoaq+NzdpOWNjZ1RLZ00ihc60WLDkk5cUCxlUiXKmry6TK9Xa-XG5NRC2mSN3BSPp2zM43N8nBuB46USK9qPMQAxaepSIZH2MWeBheakNhqkdPX-A1b81LHcDlgLsDltDMewOjPTML3CMgAFt0BgWBuAoYgZAQ3AABswEwGh8iKFhOGlQQfUEbgADVBCyV95xJD8EDGYxLFsNw3C5OtIM0YxDS8TxrFcWwIV6Gkmk0fs-ARB1YOFeCkJQtCMKw3D8Ooa56EET1CkETgCBYLJBBnW4A3ojV1GBOxWgPE8oKg9xfncPjplZew6QGOwTVDY0YOROTLEQ5C4CUzCcLwmgNK0jIdL0gyjOEYwVTnMsGIskZRCsswbO5ezHMNY0WIckFRD3DK63cXyh1RQLFPQ0LVJoO9UgfJ8XxM0tiXM+pmMsY83DrFM-ggw1zQpMx5m0c1TDmSDjEqrMdhgKhYiwRICBkCAwGw6glR9UjCjolKupMJwLQmBwxk6MZ-hNZz+ksDxPDAto+htea4MsJawBWxQjnWzbtqalrn0OzqK2MWEWM6dpIItD4sr0LdTGmVjxPacrU0cO0pIFWThwQjatrOMBlqwSAb1iMAwEKWIyHQbb8xYAhkgO9rkrBxdPLBfoTyrWYmmA2Y+I8dtHE5Txvj6Gl3v8gmAeJ0n8IgCmqZpumGelJmWYSpK31SrUZgpV7yrcxoIc3YZTFTCZbUgvtGlsH4ZfxwnsIV76yeVynqdp+m6CVXJNeZ1ndbM8HHZY7pnHDDjNAykaG1Yul3DclNzHc53UTlomSY9pWVZ99X-d0xng51wkjoraZQxrE0TeMM3YWc9pWhccbv2+LxsdWDM-Jd+Xc5+8nvbVv3uGZzXqMDrWQ4rjnGLsUxes8JMqSpGknENKDWV5FOG+A+Y5kznZs7dwfPYL0ftvHxmp9L7XErnoNF2ro26-G02bCbpGIMK1M2JKhuWYoZj7hFPu7IeXtVa+0BveR8IM2Z62OiMBwLE-huAglWFOcwLaIEdm8caHJQyOAhkNUBlhcDoAMMgem21riFD0oIAgkQtK8DyNwZIoNn6MU7MYMEPRHDfEdjxHiwtE6wjbh4GYNosrkModQ2hO0yL7S4e+NK-xvjWUEXwveNp8pVgem5TGfDHZQW0HIqhNDsLbR9KccixlQ6Vxfn0KwJpFidwZLxACjRWINkmJ0NywkLEKOsdQIG8C2qOPnuolxNZXhLCrJ4reUJLDmBmONHm-w4Q4xkn3VEuBUAyEwDIZIsRQq-TzEHbWiCw6cwcJod4nRfiggRh0aMiArpAVBOac0B4DxOxyb3KqOwClFJKWUrCFTi7TzLjUpxC9hLjHGujEEqcJL2FbDud4OjzRsQFsBAYcjCnFNKeUzEN9J4lyqbPUy8y0qLxaFxCCqC2LDS3L8FoMwekQjjj8PhRyxmnMmZiWx9B7GqP1iYBwVhkyOHwV81OfExjvG6LzWwpCaTmMGYOBa4RRknImbgKZyQMgAE02D3ghcg1+td2Qfwbl-XBRpXATBTMaISk0uROABQSs5EpwmtSpeHKCqTZhjFeHMRFW43JAQbv1FO6LZjS3hBQQm8AKi4zyVQJ+aj6gAFozCGgNeQnMY4dWQoQB86wNoMprzMFCA8fE7Csj+JCIh7EQHYvPP5GqwU6oqXCua5B6KKQWmcO0AWB4XJOoEimeyJVoQZU0OQr6P01quyDeDWEVhHbOBus0Ps4lnI2AmDYCw4l-g7mTV6vGWdXYQIviPGBma6kcmshYVBEj7XOR8R0Ua9qSq-HtcEqx2EW08JEaK9ogjTZZSZaYRODku2plBM0bu0khm4oocc8ZfKoDjvua4ewpaOjOsmK4By+U-jWBuo4HoO4QRYt8EAA */
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
            LANGUAGE: { actions: ['sendSelectLanguage', 'assignMessage'] },
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
            PRICING: { actions: ['assignMessage', 'sendPricing'] },
            TUTORIAL: { actions: ['assignMessage', 'sendTutorial'] },
            FALLBACK: { actions: ['sendIntroOptionsMessage'] },
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
            CANCEL: { target: 'onBoarding' },
            // Handle fallback in replyHelper async
          },
        },
        generatingModel: {
          entry: ['sendGeneratingModel'],
          on: {
            SECRET: { target: 'modelGeneratedFreeTrial' },
            FALLBACK: { actions: 'sendPleaseWaitGeneratingModel' },
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
                  'sendPromptConfirmation',
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
                  'sendPromptedPhoto',
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
            FALLBACK: { actions: ['sendPromptingInstruction'] },
          },
        },
        paywall: {
          entry: ['sendPaywall'],
          on: {
            GET_MEMBERSHIP: { actions: ['sendStripeLink'] },
            SECRET: { target: 'photoPrompting' },
            CANCEL: { actions: 'sendPaywall' },
            FALLBACK: { actions: 'sendPaywall' },
          },
        },
        photoPrompting: {
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
            USE_PROMPT: { actions: ['assignMessage', 'sendPromptedPhoto'] },
            IMPROVE_PROMPT: {
              actions: [
                'assignMessage',
                'sendImprovedPromptConfirmationAndSetContext',
              ],
            },
            CANCEL: { actions: ['sendPromptingInstruction'] },
            PAYWALL: { target: 'paywall' },
            FALLBACK: { actions: ['sendPromptingInstruction'] },
          },
        },
      },
    },
    {
      guards: guardsFactory(config),
      actions: actionsFactory(config),
    },
  );
};
