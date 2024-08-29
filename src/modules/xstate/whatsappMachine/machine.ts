// machine.ts

import { assign, createMachine, not } from 'xstate';

import { DEFAULT_CREDITS } from '@/utils/constants';

import { actionsFactory } from './actions';
import { guardsFactory } from './guards';
import type { IMachineConfig, IMachineContext } from './types';

export const machineFactory = (config: IMachineConfig): any => {
  return createMachine(
    {
      /** @xstate-layout N4IgpgJg5mDOIC5QHcAWBDALrdAHXAsugMaoCWAdmAMQCqAcgNL0DyA6vQPoCSAyr7QCiAbQAMAXUShcAe1hlMZGRSkgAHogAsAJgA0IAJ6IAjMYBs2gHTbjAdgCc9uwGYArK9sAOAL7f9aLBx8IlJKMEtlACEZdAAnCEooOgAFABkWAEEAEU5kgAkWABUWXjFJJBBZeUVlVQ0EC09LM09tTXsPV1F7M1d7fSMEU1tbS2czY2c7PuNNV3NffwxsPEIScioIimi4hIok1Iz6AHFaDOORCVUqhSUVCvq3UUs+i1FPW3ezW20zAZNRO1rB1RJ9bKZnM4PosQAEVsF1mEtjt4olqIITqk+Hkytc5Ldag9EJDXGNNMY2l5bK5NK1+oZEJ5NGYxs5qW4zBN2sZ7DC4UE1qFNlEYqj9tRkiwAEqFWinQS8S7laT4mr3UCPNxkimaKk0un-BqaZxjTyic2iCbmOZ85YCkIbcIi3ZojJSjKRbgAYVxFRuarqxK1znJlI++u09MGmk0zx0bV6rgmDk8Cz8sLtqwdSOdYqSySl3u4J19Kuqd0DCHGLLmHzZutcU1szkNTcsjjazOMjfDvPT-KziOF21FeySsuKhYyqVLlVVFaJVc5llrzdsDabLYZQw6LwsOm+cw641stsCg6FTpHLvFADFp6lIhkvYxZ-6FxrEL8mtoQ-ZWkyojGICnh-Nujjtuu9i-O4XT2M4oiuGe8KCo6lhkAAtugMCwNwFDEDIGG4AANmAmA0PkRQsJwUqCF6gjcAAaoIWRvvOhKfggHwsrYZiON8rigbq3SGsBTjWGaTgeEy2jrsh9pDuEmHYXAeEEURpHkdQFz0II7qFIInAECwWSCDOVx+ux6rqCYFJWGuurGqIbSdKJ2iWpYqbMm4PT-r0zjyReaHKThamESRZE0DpekZAZRkmWZwjGMqc7lhxNlDHZlgOeuCEudShpmOS7buXMMbweaFiBQil7oVhoX4eFmk0PeqSPs+r4WWWBLWfU3HtoCjiTPMbLGJ4hqOKSfEht2fQzZC1WoUiMBULEWCJAQMgQGAxHULRhRSgAmmxaW9SYDaWKIkLrqm2igeMW6DGJJqeE4fHdLGkI2v2mY1WhK1gGtij7Jt227YqXr7SdPWVnY5rWNo2iuO5IbmlCrhuXMl0duYFIfNSmiLdmmwA0DG1bTt1Cte1L7QwGi6zDG1hTL+DhmCG43gf+YyAjyoLtLqUJE4plgYRTxHHGAq1YJAt6xGAYCFLEZDoLtBYsAQySFHTH4ZWNjbAp4qbOPBnI8pzT3dKM-7UoJguAtowu1WLYOS9L5EQHLCtKyratShrWtJSl77pfUNivRJ1L2My9i8Rj26mOzYyNiM3TQTofZLOef1Ii7O1u4DMue-LivK6rdCKrk-ua9rXWpTDDOeCGnngpGHhQj8UITbS2Xdpa+vNmNZhO2hecS1Lhce17pe+xXhnqzXQd4qdlbh-Ykd9DHcduRSzSCV4vStF0qYj7n4sF0Dsslz75fcJr-vMVXAe18HVmw6mpLNl002mJJYGDK0Fkd0ug6HKibKqP1s5LU2GPC+Rdp4312nfdWj8F6B2SsvBunE14b2jnxbeCdfjGHbOzM0Ngfj7yQpAlCxNwiwInpfYu3sy67Wpk+WmdcQ5nSGEbUkSYoTAXaPMcw8dBjNmePgmkiNBKNg8KfTYuB0AGGQKrXaFxChGUEAQSIeleB5G4MkHWocvzIxNJMX4IZvieD6ICUSIFWQ2P-NMDwmcMxQNoZYRRyjVHUAhlDThb9Fy-g+C8Ckgk7A23AYVKYl1UwtGunDRC8jwheJUcRXaXojj0XMq-FeQSaRAObNYvouUui2AmsjbKtJYw9F+PggK1CFK1VST4thHUjHcKRsyawRT3Cx2NGUw01jRjmG6B9NwTdvjJM8agGQmAZDJFiOFYG+Zq6BwCXkziY0jZjBBAeOwOg3CGnmNbLoV0nBsk5OMaZuBZnzMWcstEtBK5oJfpg+mWz7BAReE8V6v5aQiNbLuZG5oeQ-H6ZMG5dyFlLKIis6gyCH7zzWW8yymy9aplGBMc0dSpgO0NLJE0YyLTOHDmNeCUK5kwseeKTJ9BskdPfqBS6pKaT-jaOncpCcRgvGcmcyY3RBIhkpfc2FuB4XJAyIdNgD5GVBPJbgrevRCpmlNJyf8PQ7AphFdSuFaI2kcNyVgjFzKrpdPZe0SkQziFOHaI4aO5pY4-F8OmCgFN4AVAHDnKg7zdb1AALT-0QIGy6Fow3htBNM3MY5fXGKrL+awfE8HWJjDGINmVeLZSRmM0w0EJjTJCqpRqGlIqxu4a0YhV0bpeEEc5YwokeTENAkybsscRq6mmaTdaINxZlthsaUYZpqSRi+UbZyj0TCI2IaSuwwEOZIxaNM+h7sr7MN9n2xuXhQnmibu4LwyMLaTsqb8c07h3jcXcDcpRaTiIbuwfMJofKBWp3mKCBtPdoIzQtC20COqHl6v2HevWTgrDmAsNHFM5IPCFR+AjJGbh2Qdxdd4IAA */
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
            FALLBACK: {
              actions: ['sendIntroOptionsMessageBasedOnPhoneNumber'],
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
            FALLBACK: { actions: 'sendPendingPhotos' },
          },
        },
        generatingModel: {
          entry: ['sendGeneratingModel'],
          on: {
            // TODO: Handle multiple retries?
            RETRY: { actions: ['callStartTrainingAPI', 'setRetriedFlagTrue'] },
            SECRET: { target: 'modelGeneratedFreeTrial' },
            FALLBACK: { actions: 'handleModelGenerationStatus' },
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
